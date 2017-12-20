const request = require('superagent');
const axios = require('axios');
const qs = require('querystring');
const throwError = require('./throwError');

const folder = 'Pictures/Immagini salvate'; // Mobile_uploads';
const responseTimeout = 10000;
const deadlineTimeout = 60000;

class OneDriveApi {
  constructor(accessToken, refreshToken, clientID, clientSecret) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.clientID = clientID;
    this.clientSecret = clientSecret;
  }

  async getFiles(link) {
    const url = link || `https://graph.microsoft.com/v1.0/me/drive/root:/${folder}:/children?select=id,name,size,folder&top=50`;
    let result;
    try {
      const response = await request
        .get(url)
        .set('Authorization', `Bearer ${this.accessToken}`)
        .set('Content-Type', 'application/json')
        .timeout({
          response: responseTimeout,
          deadline: deadlineTimeout
        });

      result = {
        files: response.body.value.filter(item => typeof item.folder === 'undefined'),
        nextLink: response.body['@odata.nextLink']
      };
    } catch (error) {
      throwError('getFiles', error, url);
    }

    return result;
  }

  async getFile(fileName) {
    let result;

    try {
      const response = await axios({
        method: 'get',
        url: `https://graph.microsoft.com/v1.0/me/drive/root:/${folder}/${fileName}:/content`,
        responseType: 'stream',
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        },
        timeout: responseTimeout        
      });

      result = response.data;
    } catch (error) {
      throwError('getFile', error, fileName);
    }

    return result;
  }

  async getFolderInfo() {
    let response;
    try {
      response = await request
        .get(`https://graph.microsoft.com/v1.0/me/drive/root:/${folder}:/`)
        .set('Authorization', `Bearer ${this.accessToken}`)
        .set('Content-Type', 'application/json')
        .timeout({
          response: responseTimeout,
          deadline: deadlineTimeout
        });
    } catch (error) {
      throwError('getFolderInfo', error);
    }

    return {
      totalItems: response.body.folder.childCount,
      byteSize: parseInt(response.body.size, 10)
    };
  }

  async tokenRefresh() {
    try {
      const data = qs.stringify({
        client_id: this.clientID,
        client_secret: this.clientSecret,
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token'
      });
      const response = await axios({
        method: 'POST',
        url: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        data: data,
        timeout: responseTimeout
      });

      this.refreshToken = response.data.refresh_token;
      this.accessToken = response.data.access_token;
    } catch (error) {
      throwError('tokenRefresh', error);
    }
  }
}

module.exports = OneDriveApi;
