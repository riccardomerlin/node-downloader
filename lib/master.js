const Queue = require('./Queue');
const ChildProcessPool = require('./ChildProcessPool');
const fs = require('fs');
const OneDriveApi = require('./OneDriveApi');
const { childProcesses } = require('../config');
const callApi = require('./callApi');
const Monitor = require('./Monitor');

module.exports = master;
async function master(downloadPath, accessToken, refreshToken) {
  const monitorArgs = {
    itemsInQueue: 0,
    totalItems: 0,
    totalSize: 0,
    activeDownloads: 0,
    downloadsCompleted: 0,
    httpFailures: 0
  };

  const monitor = new Monitor();

  console.time('Elapsed time');
  try {
    fs.mkdirSync(downloadPath);
    console.log(`Directory '${downloadPath}' created.`);
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
    console.log(`Directory '${downloadPath}' already exists.`);
  }

  const endpoint = new OneDriveApi(accessToken, refreshToken);

  try {
    const { totalItems, byteSize } = await callApi(endpoint, 'getFolderInfo');
    console.log(`${byteSize / 1024 / 1024} MB in ${totalItems} files.`);
    monitorArgs.totalItems = totalItems;
    monitorArgs.totalSize = byteSize;
    monitor.broadcast(monitorArgs);
  } catch (error) {
    console.error(error);
    process.exit();
  }

  let stop = false;
  const filesQueue = new Queue();
  filesQueue.on('itemsEnqueued', updateItemsToMonitor);
  filesQueue.on('itemDequeued', updateItemsToMonitor);

  const processPool = new ChildProcessPool(childProcesses);
  processPool.on('childDisconnected', onChildDisconnected);

  processPool.on('childForked', (activeChildren) => {
    monitorArgs.activeDownloads = activeChildren;
    monitor.broadcast(monitorArgs);
  });

  populateQueue(filesQueue);

  downloadNext(filesQueue, processPool);

  function onChildDisconnected(activeChildren) {
    monitorArgs.activeDownloads = activeChildren;
    monitor.broadcast(monitorArgs);

    if (activeChildren === 0 && filesQueue.isEmpty && stop === true) {
      console.timeEnd('Elapsed time');
      console.log('All files downloaded, have a nice day!');
      process.exit();
    }

    setTimeout(() => { downloadNext(filesQueue, processPool); }, 100);
  }

  function updateItemsToMonitor(count) {
    monitorArgs.itemsInQueue = count;
    monitor.broadcast(monitorArgs);
  }

  async function populateQueue(queue, link) {
    let result;
    try {
      result = await callApi(endpoint, 'getFiles', link);
    } catch (error) {
      console.error(error);
      populateQueue(queue, link);
      return;
    }

    queue.enqueue(result.files);
    if (result.nextLink) {
      populateQueue(queue, result.nextLink);
    } else {
      stop = true;
    }
  }

  function downloadNext(queue, pool) {
    if (stop === true && queue.isEmpty) {
      return;
    }

    const file = queue.dequeue();
    if (!file) {
      setTimeout(() => { downloadNext(queue, pool); }, 100);
      return;
    }

    const childProcess = pool.tryFork('./lib/child.js');
    if (!childProcess) {
      queue.enqueue(file);
      return;
    }

    childProcess.on('message', (message) => {
      const { status, processedFile, percentage } = message;
      if (status !== 'newChunk') {
        childProcess.disconnect();
      }

      switch (status) {
        case 'newChunk':
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
          process.stdout.write(`${percentage}% `);
          break;
        case 'done':
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
          process.stdout.write(`100% ${processedFile.name} complete.\n`);
          monitorArgs.downloadsCompleted++;
          monitor.broadcast(monitorArgs);
          break;
        case 'retry':
          console.log(`Download failed. File ${processedFile.name} enqueued to be re-processed.`);
          queue.enqueue(processedFile);
          monitorArgs.httpFailures++;
          monitor.broadcast(monitorArgs);          
          break;
        default:
          break;
      }
    });

    childProcess.send({
      downloadPath,
      file,
      accessToken: endpoint.accessToken,
      refreshToken: endpoint.refreshToken
    });

    setTimeout(() => { downloadNext(queue, pool); }, 100);
  }
}
