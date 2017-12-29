const Queue = require('./Queue');
const ChildProcessPool = require('./ChildProcessPool');
const fs = require('fs');
const OneDriveApi = require('./OneDriveApi');
const { clientID, clientSecret, childProcesses } = require('../config');
const callApi = require('./callApi');
const { fork } = require('child_process');
const Monitor = require('./Monitor');
// const log = require('single-line-log').stdout;

module.exports = master;
async function master(downloadPath, accessToken, refreshToken) {
  const monitorArgs = {
    itemsInQueue: 0,
    totalItems: 0,
    totalSize: 0,
    activeDownloads: 0,
    downloadsCompleted: 0
  };

  // creates monitor server
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

  const endpoint = new OneDriveApi(accessToken, refreshToken,
    clientID, clientSecret);

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

  function updateItemsToMonitor(count) {
    monitorArgs.itemsInQueue = count;
    monitor.broadcast(monitorArgs);
  }

  const processPool = new ChildProcessPool(childProcesses);
  processPool.on('childDisconnected', (activeChildren) => {
    monitorArgs.activeDownloads = activeChildren;
    monitor.broadcast(monitorArgs);

    if (activeChildren === 0 && filesQueue.isEmpty && stop === true) {
      console.timeEnd('Elapsed time');
      console.log('All files downloaded, have a nice day!');
      process.exit();
    }

    setTimeout(() => { downloadNext(filesQueue, processPool); }, 100);
  });

  processPool.on('childForked', (activeChildren) => {
    monitorArgs.activeDownloads = activeChildren;
    monitor.broadcast(monitorArgs);
  });


  populateQueue();

  // let count = 0;
  // setInterval(() => {
  //   log(`${++count} aaa`);
  // }, 1000);

  downloadNext(filesQueue, processPool);

  function populateQueue() {
    const child = fork('./lib/populateQueue.js');

    child.on('disconnect', () => {
      console.log('Child process disconnected.');
    });

    child.on('message', (args) => {
      const { files, nextLink, error } = args;
      if (error) {
        console.error(error);
        child.send({
          accessToken: endpoint.accessToken,
          refreshToken: endpoint.refreshToken,
          link: nextLink
        });
      } else {
        filesQueue.enqueue(files);
        if (nextLink) {
          child.send({
            accessToken: endpoint.accessToken,
            refreshToken: endpoint.refreshToken,
            link: nextLink
          });
        } else {
          stop = true;
          child.disconnect();
        }
      }
    });

    child.send({
      accessToken: endpoint.accessToken,
      refreshToken: endpoint.refreshToken
    });
  }

  function downloadNext(queue, pool) {
    if (stop === true && queue.isEmpty) {
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
    }

    setTimeout(() => { downloadNext(queue, pool); }, 100);
  }
}
