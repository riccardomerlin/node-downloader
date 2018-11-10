const webServer = require('./WebServer');

class FlickrApiProvider {
  constructor(oauthToken, oauthTokenSecret) {
    this.oauthToken = oauthToken;
    this.oauthTokenSecret = oauthTokenSecret;
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

  // async getFiles(link) {
  // }

  // async getFile(fileName) {
  // }

  // async getFolderInfo() {
  // }

  // async tokenRefresh() {
  // }
}

module.exports = FlickrApiProvider;
