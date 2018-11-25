const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  flickrConsumerKey: process.env.FLICKR_CONSUMER_KEY,
  flickrConsumerSecret: process.env.FLICKR_CONSUMER_SECRET
};
