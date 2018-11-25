const Flickr = require('flickr-sdk');
const dotenv = require('dotenv');
const config = require('./config');

dotenv.config();

class OAuth {
  constructor() {
    this.oauth = new Flickr.OAuth(
      config.flickrConsumerKey,
      config.flickrConsumerSecret
    );
  }

  async authorizeUrl(token) {
    let url;

    try {
      url = await this.oauth.authorizeUrl(token);
    } catch (error) {
      console.error('authorizeUrl() error:', error.message);
      throw error;
    }

    return url;
  }

  async plugin(oauthToken, oauthTokenSecret) {
    return new Flickr(
      this.oauth.plugin(oauthToken, oauthTokenSecret));
  }

  async requestToken(baseUrl) {
    let res;
    
    try {
      res = await this.oauth.request(`${baseUrl}/oauth/callback`);
    } catch (error) {
      console.error('requestToken() error:', error.message);
      throw error;
    }

    return {
      oauthToken: res.body.oauth_token,
      oauthTokenSecret: res.body.oauth_token_secret
    };
  }

  async verify(oauthToken, oauthVerifier, tokenSecret) {
    let res;

    try {
      res = await this.oauth.verify(oauthToken, oauthVerifier, tokenSecret);
    } catch (error) {
      console.error('verify() error :', error.message);
      throw error;
    }

    return {
      oauthToken: res.body.oauth_token,
      oauthTokenSecret: res.body.oauth_token_secret
    };
  }
}

module.exports = OAuth;
