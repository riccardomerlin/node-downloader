const express = require('express');
const detect = require('detect-port');
const http = require('http');
const helmet = require('helmet');
const dotenv = require('dotenv');

const OAuth = require('../oauth');

dotenv.config();

const webAccessPort = 8989;

webServer();

async function webServer() {
  if (!process.env.FLICKR_CONSUMER_KEY || !process.env.FLICKR_CONSUMER_SECRET) {
    throw new Error('Error: CONSUMER_KEY or CONSUMER_SECRET are not set correctly.');
  }

  const port = await detect(webAccessPort);
  if (port !== webAccessPort) {
    throw new Error(`Port ${webAccessPort} is busy. Please, free up the port or change it.`);
  }

  const baseUrl = `http://localhost:${port}`;

  const oauth = new OAuth();
  const { oauthToken, oauthTokenSecret } = await oauth.requestToken(baseUrl);
  
  let server;
  const app = express();

  app.use(helmet());

  app.get('/', async (req, res) => {
    const url = await oauth.authorizeUrl(oauthToken);
    res.setHeader('Location', url);
    res.statusCode = 302;
    res.end();
  });

  app.get('/oauth/callback', async (req, res) => {
    const result = await oauth.verify(
      req.query.oauth_token,
      req.query.oauth_verifier,
      oauthTokenSecret
    );

    process.send(result);
    res.write('You are logged in successfully. Go back to the console to continue.');
    res.end(() => {
      server.close((err) => {
        if (err) {
          console.error('Cannot close the http server because of an error: ', err);
        }
      });
    });
  });

  server = http.createServer(app)
    .listen(port, () =>
      console.log(`Open up your browser to this url to log in: ${baseUrl}`));
}
