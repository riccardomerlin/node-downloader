const OneDrive = require('./OneDrive/OneDriveApi');
const Flickr = require('./Flickr');
const Google = require('./Google');

class ApiProviders {
  constructor() {
    this.providers = {
      Flickr: Flickr,
      Google: Google,
      OneDrive: OneDrive,
    };
  }

  async get(providerName) {
    if (this.provider) {
      return this.provider;
    }

    this.provider = this.providers[providerName];
    return this.provider;
  }
}

module.exports = ApiProviders;
