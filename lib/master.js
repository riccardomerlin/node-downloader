const Queue = require('./Queue');
const ChildProcessPool = require('./ChildProcessPool');
const fs = require('fs');
const OneDriveApi = require('./OneDriveApi');
const { clientID, clientSecret } = require('../config');
const callApi = require('./callApi');

module.exports = master;
function master(downloadPath, accessToken, refreshToken) {
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

    const childProcess = pool.tryFork('./lib/child.js');
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
