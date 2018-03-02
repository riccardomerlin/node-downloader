const FileWriter = require('./FileWriter');
const ApiEndpoint = require('../apiProvider');
const callApi = require('./callApi');

const fileWriter = new FileWriter();
process.on('message', write);

async function write(args) {
  const { downloadPath, file, accessToken, refreshToken } = args;
  if (file) {
    let read = 0;
    fileWriter.on('newChunk', (chunk) => {
      read += chunk.length;
      const percent = percentage(file.size, read);
      process.send({
        status: 'newChunk',
        processedFile: file,
        percentage: percent
      });      
    });

    fileWriter.on('done', () => {
      process.send({ status: 'done', processedFile: file });
    });

    const endpoint = new ApiEndpoint(accessToken, refreshToken);
    try {
      const stream = await callApi(endpoint, 'getFile', file.name);

      fileWriter.write(
        stream,
        downloadPath,
        file.name
      );
    } catch (error) {
      console.error(`\n${error}`);
      process.send({ status: 'retry', processedFile: file });
    }
  }
}

function percentage(total, fraction) {
  return Math.ceil((fraction * 100) / total);
}
