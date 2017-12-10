const Queue = require('./lib/Queue');
const ChildProcessPool = require('./lib/ChildProcessPool');
const fs = require('fs');
const OneDriveApi = require('./lib/OneDriveApi');
const { clientID, clientSecret } = require('./config');
const readline = require('readline');
const callApi = require('./lib/callApi');

process.on('uncaughtException', (error) => {
  console.error(error.message);
  process.exit(1);
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const args = {
  downloadPath: '',
  accessToken: '',
  refreshToken: ''
};

let inputCount = 0;
rl.setPrompt('Download path (current dir): ');
rl.prompt();

rl.on('line', getInput);

function getInput(input) {
  inputCount++;
  switch (inputCount) {
    case 1:
      args.downloadPath = input || './downloads';
      rl.setPrompt('Access Token: ');
      break;
    case 2:
      args.accessToken = input;
      rl.setPrompt('Refresh Token: ');
      break;
    default:
      args.refreshToken = input;
      rl.removeListener('line', getInput);
      main(args);
      return;
  }

  rl.prompt();
}

function main(params) {
  const { downloadPath, accessToken, refreshToken } = params;

  try {
    fs.mkdirSync(downloadPath);
    console.log(`Directory '${downloadPath}' created.`);
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
    console.log(`Directory '${downloadPath}' already exists.`);
  }

  const endpoint = new OneDriveApi(accessToken, refreshToken, clientID, clientSecret);

  let stop = false;
  const filesQueue = new Queue();
  filesQueue.on('itemsReceived', () => {
    console.log('Items in queue:', filesQueue.count());
  });

  const processPool = new ChildProcessPool(10);
  processPool.on('childDisconnected', (activeChildren) => {
    if (activeChildren === 0 && filesQueue.isEmpty && stop === true) {
      console.log('All files downloaded, have a nice day!');
      process.exit();
    }
  });

  let result = {};
  const interval = setInterval(async () => {
    try {
      result = await callApi(endpoint, 'getFiles', result.nextLink);
      filesQueue.enqueue(result.files);   
      if (!result.nextLink) {
        clearInterval(interval);
        stop = true;
      }    
    } catch (error) {
      console.error('"getFiles" error:', error.message);
    }
  }, 1000);

  downloadNext(filesQueue, processPool);

  function downloadNext(queue, pool) {
    if (stop === true && queue.isEmpty === true) return;

    const childProcess = pool.tryFork('./lib/download.js');
    if (!childProcess) return;

    const file = queue.dequeue();
    if (!file) {
      childProcess.disconnect();
      setTimeout(() =>
        downloadNext(queue, pool),
        1000);
      return;
    }

    childProcess.on('message', (message) => {
      childProcess.disconnect();

      const { status, processedFile } = message;
      if (status === 'retry') {
        console.log(`Download failed. File ${processedFile.name} enqueued to be re-processed.`);
        queue.enqueue(processedFile);
      }

      downloadNext(queue, pool);
    });

    childProcess.send({
      downloadPath,
      file,
      accessToken: endpoint.accessToken,
      refreshToken: endpoint.refreshToken
    });

    downloadNext(queue, pool);
  }
}
