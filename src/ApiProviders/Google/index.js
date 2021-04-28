const config = require('./config');
const { google } = require('googleapis');
const opn = require('open');
const destroyer = require('server-destroy');
const http = require('http');
const url = require('url');
const throwError = require('../throwError');
const axios = require('axios');
const urlJoin = require('proper-url-join');

const responseTimeout = 10000;
const baseUrl = 'https://photoslibrary.googleapis.com/v1';

class GoolgeApiProvider {
  constructor(accessToken, refreshToken) {
    this._accessToken = accessToken;
    this._refreshToken = refreshToken;
  }

  get accessToken() {
    return this._accessToken;
  }

  get refreshToken() {
    return this._refreshToken;
  }

  static async getCredentials() {
    const oauth2Client = new google.auth.OAuth2(
      config.clientID,
      config.clientSecret,
      config.redirectUri
    );

    // generate a url that asks permissions for Google Photos scopes
    const scopes = [
      'https://www.googleapis.com/auth/photoslibrary',
      'https://www.googleapis.com/auth/photoslibrary.readonly',
      'https://www.googleapis.com/auth/photoslibrary.readonly.appcreateddata',
      'https://www.googleapis.com/auth/drive.photos.readonly'
    ];

    return new Promise((resolve, reject) => {
      // grab the url that will be used for authorization
      const authorizeUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes.join(' '),
      });
      const server = http
        .createServer(async (req, res) => {
          try {
            if (req.url.indexOf('/oauth2callback') > -1) {
              const qs = new url.URL(req.url, 'http://localhost:8088')
                .searchParams;
              res.end('Authentication successful! Please return to the console.');
              server.destroy();
              const { tokens } = await oauth2Client.getToken(qs.get('code'));
              oauth2Client.credentials = tokens; // eslint-disable-line require-atomic-updates

              resolve({
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token
              });
            }
          } catch (e) {
            reject(e);
          }
        })
        .listen(config.webAccessPort, () => {
          // open the browser to the authorize url to start the workflow
          opn(authorizeUrl, { wait: false }).then(cp => cp.unref());
        });
      destroyer(server);
    });
  }

  async getFolderInfo() {
    return {
      totalItems: -1,
      byteSize: -1
    };
  }

  async getFiles(pageToken) {
    let filesUrl = urlJoin(baseUrl, 'mediaItems?pageSize=50');
    if (pageToken) {
      filesUrl = `${filesUrl}&pageToken=${pageToken}`;
    }

    let response;
    try {
      response = await axios({
        method: 'GET',
        url: filesUrl,
        responseType: 'application/json',
        headers: {
          Authorization: `Bearer ${this._accessToken}`
        },
        timeout: responseTimeout
      });
    } catch (error) {
      throwError('getFiles', error);
    }

    return {
      files: response.data.mediaItems.map(toFilesDto),
      nextLink: response.data.nextPageToken
    };

    function toFilesDto(mediaItem) {
      return {
        id: mediaItem.id,
        name: mediaItem.filename,
        url: `${mediaItem.baseUrl}=w2048-h1024`,
        size: -1
      };
    }
  }

  async getFile(fileUrl) {
    let result;

    try {
      const response = await axios({
        method: 'GET',
        url: fileUrl,
        responseType: 'stream'
      });

      result = response.data;
    } catch (error) {
      throw new Error(`getFile: ${error.message}`);
    }

    return result;
  }
}

module.exports = GoolgeApiProvider;
