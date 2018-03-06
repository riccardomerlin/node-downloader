const OneDrive = require('./OneDrive/OneDriveApi');

class ApiProviders {
  constructor() {
    this.providers = { OneDrive: OneDrive };
  }

  async get(providerName) {
    if (this.provider) {
      return this.provider;
    }

    this.provider = this.providers[providerName]();
    return this.provider;
  }


  close() {
    if (this.provider && typeof this.provider.close === 'function') {
      this.provider.close();
    }
  }
}

module.exports = ApiProviders;
