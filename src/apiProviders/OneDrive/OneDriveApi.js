const request = require('superagent');
const axios = require('axios');
const qs = require('querystring');
const urlJoin = require('proper-url-join');
const throwError = require('../throwError');
const UrlComposer = require('./UrlComposer');
const { clientID, clientSecret, folder, webAccessPort } = require('./config');
const startWebAccess = require('./startWebAccess');
const detect = require('detect-port');

const responseTimeout = 10000;
const deadlineTimeout = 60000;
const pageSize = 50;
const baseUri = 'https://graph.microsoft.com/v1.0/me/drive/root';
const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

class OneDriveApi {
  constructor(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  async getFiles(link) {
    const url = link || urlJoin(UrlComposer.compose(baseUri, folder), `/children?select=id,name,size,folder&top=${pageSize}`);
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
      const url = urlJoin(UrlComposer.compose(baseUri, urlJoin(folder, fileName)), '/content');
      const response = await axios({
        method: 'GET',
        url: url,
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
      const url = UrlComposer.compose(baseUri, folder);
      response = await request
        .get(url)
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
        client_id: clientID,
        client_secret: clientSecret,
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token'
      });
      const response = await axios({
        method: 'POST',
        url: tokenUrl,
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

module.exports = async () => {
  if (!clientID || !clientSecret) {
    throw new Error('Error: clientID or clientSecret are not set correctly.\r\nCheck OneDrive provider configuration and try again.');
  }

  const port = await detect(webAccessPort);
  if (port === webAccessPort) {
    await startWebAccess();
  }

  return OneDriveApi;
};
