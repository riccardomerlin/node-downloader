const Queue = require('./Queue');
const ChildProcessPool = require('./ChildProcessPool');
const fs = require('fs');
const OneDriveApi = require('./OneDriveApi');
const { clientID, clientSecret } = require('../config');
const callApi = require('./callApi');

module.exports = master;
async function master(downloadPath, accessToken, refreshToken) {
  console.time('Elapsed time:');
  try {
    fs.mkdirSync(downloadPath);
    console.log(`Directory '${downloadPath}' created.`);
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
    console.log(`Directory '${downloadPath}' already exists.`);
  }

  const endpoint = new OneDriveApi(accessToken, refreshToken,
    clientID, clientSecret);

  try {
    const { totalItems, byteSize } = await callApi(endpoint, 'getFolderInfo');
    console.log(`${byteSize / 1024 / 1024} MB in ${totalItems} files.`);
  } catch (error) {
    console.error(error);
    process.exit();
  }

  let stop = false;
  const filesQueue = new Queue();

  const processPool = new ChildProcessPool(20);
  processPool.on('childDisconnected', (activeChildren) => {
    if (activeChildren === 0 && filesQueue.isEmpty && stop === true) {
      console.timeEnd('Elapsed time:');
      console.log('All files downloaded, have a nice day!');
      process.exit();
    }

    setTimeout(() => { downloadNext(filesQueue, processPool); }, 100);
  });

  populateQueue();
  setTimeout(() => { downloadNext(filesQueue, processPool); }, 100);

  async function populateQueue(link) {
    try {
      const result = await callApi(endpoint, 'getFiles', link);
      filesQueue.enqueue(result.files);
      if (result.nextLink) {
        setTimeout(() => { populateQueue(result.nextLink); }, 1000);
      } else {
        stop = true;
      }
    } catch (error) {
      console.error('"getFiles" error:', error.message);
    }
  }

  function downloadNext(queue, pool) {
    if (stop === true && queue.isEmpty) {
      console.log('stop');
      return;
    }

    const file = queue.dequeue();
    if (file) {
      const childProcess = pool.tryFork('./lib/child.js');
      if (!childProcess) {
        queue.enqueue(file);
        return;
      }

      childProcess.on('message', (message) => {
        childProcess.disconnect();

        const { status, processedFile } = message;
        if (status === 'retry') {
          console.log(`Download failed. File ${processedFile.name} enqueued to be re-processed.`);
          queue.enqueue(processedFile);
        }
      });

      childProcess.send({
        downloadPath,
        file,
        accessToken: endpoint.accessToken,
        refreshToken: endpoint.refreshToken
      });
    }

    setTimeout(() => { downloadNext(queue, pool); }, 100);
  }
}
