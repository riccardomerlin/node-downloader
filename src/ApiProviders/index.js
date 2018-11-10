const OneDrive = require('./OneDrive/OneDriveApi');
const Flickr = require('./Flickr');

class ApiProviders {
  constructor() {
    this.providers = {
      Flickr: Flickr,
      OneDrive: OneDrive
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
