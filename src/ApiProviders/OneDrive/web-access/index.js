const express = require('express');
const path = require('path');
const qs = require('querystring');
const url = require('url');
const axios = require('axios');
const hbs = require('hbs');
const detect = require('detect-port');
const urlJoin = require('proper-url-join');
const http = require('http');
const helmet = require('helmet');
const { clientID, clientSecret, webAccessPort } = require('../config');

main();

async function main() {
  if (!clientID || !clientSecret) {
    throw new Error('Error: clientID or clientSecret are not set correctly.\r\nCheck OneDrive provider configuration and try again.');
  }

  const port = await detect(webAccessPort);
  if (port !== webAccessPort) {
    throw new Error(`Port ${webAccessPort} is busy. Please, free up the port or change the webAccessPort in ./config.js file.`);
  }

  let server;
  const baseUrl = `http://localhost:${port}`;

  const app = express();

  app.use(helmet());
  hbs.registerPartials(`${__dirname}/views/partials`);

  app.set('view engine', 'hbs');
  app.set('views', path.join(__dirname, './views'));

  app.get('/', (req, res) => {
    res.render('index', { partialView: () => 'login', clientID });
  });

  app.get('/token', async (req, res) => {
    const urlParts = url.parse(req.url, true);

    const data = qs.stringify({
      client_id: clientID,
      client_secret: clientSecret,
      code: urlParts.query.code,
      grant_type: 'authorization_code',
      redirect_uri: urlJoin(baseUrl, '/token')
    });

    try {
      const response = await axios({
        method: 'POST',
        url: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        data: data
      });

      res.write('You are logged in successfully. Go back to the console to continue.');
      res.end(() => {
        process.send(response.data);
        server.close((err) => {
          if (err) {
            console.error('Cannot close the http server because of an error: ', err);
          }
        });
        console.log('Http server disconnected.');
      });
    } catch (error) {
      console.log(error);
      res.write('An Error occured. Please, try again.');
      res.end();
    }
  });

  server = http
    .createServer(app)
    .listen(port, () => console.log(`Open up your browser to this url to log in: ${baseUrl}`));
}
