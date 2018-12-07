const Flickr = require('flickr-sdk');
const axios = require('axios');

const config = require('./config');
const webServer = require('./WebServer');
const PhotoFile = require('./PhotoFile');

const pageSize = 50;

class FlickrApiProvider {
  constructor(oauthToken, oauthTokenSecret) {
    this.oauthToken = oauthToken;
    this.oauthTokenSecret = oauthTokenSecret;
    this.flickr = new Flickr(Flickr.OAuth.createPlugin(
      config.flickrConsumerKey,
      config.flickrConsumerSecret,
      oauthToken,
      oauthTokenSecret
    ));
  }

  get accessToken() {
    return this.oauthToken;
  }

  get refreshToken() {
    return this.oauthTokenSecret;
  }

  async getUserId() {
    if (!this.userId) {
      try {
        const response = await this.flickr.test.login();
        this.userId = response.body.user.id;
      } catch (error) {
        throw error;
      }
    }

    return this.userId;
  }

  static async getCredentials() {
    const web = await webServer.run();

    return new Promise((resolve, reject) => {
      web.on('message', (data) => {
        if (!data) {
          reject('No data has been retuned for credentials.');
          return;
        }

        resolve({
          accessToken: data.oauthToken,
          refreshToken: data.oauthTokenSecret
        });
      });
    });
  }

  async getFiles(page) {
    let result;
    const currentPage = page || 1;

    try {
      const response = await this.flickr.photos.search(
        {
          user_id: await this.getUserId(),
          extras: 'url_o,date_taken',
          per_page: pageSize,
          page: currentPage,
          sort: 'date-taken-asc'
        });

      result = {
        files: response.body.photos.photo
          .map((photo) => {
            photo.size = 0;
            return new PhotoFile(photo);
          })
      };

      if (currentPage + 1 <= response.body.photos.pages) {
        result.nextLink = currentPage + 1;
      }
    } catch (error) {
      throw error;
    }

    return result;
  }

  async getFile(url) {
    let result;

    try {
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream'
      });

      result = response.data;
    } catch (error) {
      throw new Error(`getFile: ${error.message}`);
    }

    return result;
  }

  async getFolderInfo() {
    let result;

    try {
      const response = await this.flickr.photos
        .search({ 
          user_id: await this.getUserId(),
          per_page: 0 
        });
        
      result = {
        totalItems: response.body.photos.total,
        byteSize: 0
      };
    } catch (error) {
      throw error;
    }

    return result;
  }

  // async tokenRefresh() {
  // }
}

module.exports = FlickrApiProvider;
