const callApi = require('./callApi');
const OneDriveApi = require('./OneDriveApi');
const { clientID, clientSecret } = require('../config');

let endpoint;
process.on('message', getFiles);

async function getFiles(params) {
  const { accessToken, refreshToken, link } = params;
  if (!endpoint) {
    endpoint = new OneDriveApi(
      accessToken,
      refreshToken,
      clientID,
      clientSecret);
  }

  try {
    const result = await callApi(endpoint, 'getFiles', link);
    process.send({ files: result.files, nextLink: result.nextLink });
  } catch (error) {
    process.send({ error, nextLink: link });
  }
}
