const express = require('express');
const path = require('path');
const qs = require('querystring');
const url = require('url');
const axios = require('axios');
const hbs = require('hbs');
const detect = require('detect-port');
const urlJoin = require('proper-url-join');
const { webAccessPort } = require('../config');

detect(webAccessPort).then((p) => {
  if (webAccessPort !== p) {
    throw new Error(`Port ${webAccessPort} is busy. Please, change the port number in ./config.js file.`);
  }
  const baseUrl = `http://localhost:${webAccessPort}`;

  const app = express();

  hbs.registerPartials(`${__dirname}/views/partials`);

  app.set('view engine', 'hbs');
  app.set('views', path.join(__dirname, './views'));

  app.use(express.static('public'));

  app.get('/', (req, res) => {
    res.render('index', { partialView: () => 'login' });
  });

  app.get('/token', async (req, res) => {
    const urlParts = url.parse(req.url, true);

    const data = qs.stringify({
      client_id: '8bd169cf-338d-4d2e-8e16-e97a44bbfb0b',
      client_secret: '3ok4xP902oe585R8kB90BLD',
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

      res.render('index', {
        partialView: () => 'welcome',
        ...response.data
      });
    } catch (error) {
      console.log(error);
      res.write('Error!');
      res.end();
    }
  });

  app.listen(webAccessPort, () => console.log(`Open up your browser to this url to log in: ${baseUrl}`));
});
