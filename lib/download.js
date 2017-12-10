const FileWriter = require('./FileWriter');
const { clientID, clientSecret } = require('../config');
const OneDriveApi = require('./OneDriveApi');
const callApi = require('./callApi');

const fileWriter = new FileWriter();
process.on('message', write);

async function write(args) {
  const { downloadPath, file, accessToken, refreshToken } = args;
  if (file) {
    let read = 0;
    fileWriter.on('newChunk', (chunk) => {
      read += chunk.length;
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write((`${percentage(file.size, read)}% `));
    });

    fileWriter.on('done', (fileName) => {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(`100% ${fileName} complete.\n`);

      process.send({ status: 'done', processedFile: file });
    });

    const endpoint = new OneDriveApi(accessToken, refreshToken, clientID, clientSecret);
    try {
      const stream = await callApi(endpoint, 'getFile', file.name);

      fileWriter.write(
        stream,
        downloadPath,
        file.name
      );
    } catch (error) {
      console.error(error.message);
      process.send({ status: 'retry', processedFile: file });
    }
  }
}

function percentage(total, fraction) {
  return Math.ceil((fraction * 100) / total);
}
