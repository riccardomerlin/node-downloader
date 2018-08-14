const Queue = require('./lib/Queue');
const ChildProcessPool = require('./lib/ChildProcessPool');
const fs = require('fs');
const { childProcesses } = require('./config');
const callApi = require('./lib/callApi');
const Monitor = require('./lib/Monitor');
const ApiProviders = require('./ApiProviders');
const { apiProviderName } = require('./config');

module.exports = master;

async function master(downloadPath) {
  const monitor = new Monitor({
    itemsInQueue: 0,
    totalItems: 0,
    totalSize: 0,
    activeDownloads: 0,
    downloadsCompleted: 0,
    httpFailures: 0
  });

  const apiProviders = new ApiProviders();
  const ApiProvider = await apiProviders.get(apiProviderName);

  let endpoint;
  try {
    const { accessToken, refreshToken } = await ApiProvider.getCredentials();
    endpoint = new ApiProvider(accessToken, refreshToken);
  } catch (error) {
    console.log(error.message);
    throw new Error('error on web-access');
  }

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

  try {
    const { totalItems, byteSize } = await callApi(endpoint, 'getFolderInfo');

    console.log(`${byteSize / 1024 / 1024} MB in ${totalItems} files.`);
    monitor.updateProperty('totalItems', totalItems);
    monitor.updateProperty('totalSize', byteSize);
  } catch (error) {
    console.error(error);
    process.exit();
  }

  let stop = false;
  const filesQueue = new Queue();
  filesQueue.on('itemsEnqueued', count => monitor.updateProperty('itemsInQueue', count));
  filesQueue.on('itemDequeued', count => monitor.updateProperty('itemsInQueue', count));

  const processPool = new ChildProcessPool(childProcesses);
  processPool.on('childDisconnected', onChildDisconnected);

  processPool.on('childForked', (activeChildProcesses) => {
    monitor.updateProperty('activeDownloads', activeChildProcesses);
  });

  populateQueue(filesQueue);

  downloadNext(filesQueue, processPool);

  function onChildDisconnected(activeChildProcesses) {
    monitor.updateProperty('activeDownloads', activeChildProcesses);

    if (activeChildProcesses === 0 && filesQueue.isEmpty && stop === true) {
      console.timeEnd('Elapsed time');
      console.log('All files downloaded, have a nice day!');
      process.exit();
    }

    setTimeout(() => { downloadNext(filesQueue, processPool); }, 100);
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

  function downloadNext(files, poolOfProcesses) {
    if (stop === true && files.isEmpty) {
      return;
    }

    const file = files.dequeue();
    if (!file) {
      setTimeout(() => { downloadNext(files, poolOfProcesses); }, 100);
      return;
    }

    const fileSaverProcess = poolOfProcesses.tryFork('./src/fileSaver.js');
    if (!fileSaverProcess) {
      files.enqueue(file);
      return;
    }

    fileSaverProcess.on('message', (message) => {
      const { status, processedFile, percentage } = message;
      if (status !== 'newChunk') {
        fileSaverProcess.disconnect();
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
          monitor.updateProperty('downloadsCompleted', monitor.displayObject.downloadsCompleted + 1);
          break;
        case 'retry':
          console.log(`Download failed. File ${processedFile.name} enqueued to be re-processed.`);
          files.enqueue(processedFile);
          monitor.updateProperty('httpFailures', monitor.displayObject.httpFailures + 1);
          break;
        default:
          break;
      }
    });

    fileSaverProcess.send({
      downloadPath,
      file,
      accessToken: endpoint.accessToken,
      refreshToken: endpoint.refreshToken
    });

    setTimeout(() => { downloadNext(files, poolOfProcesses); }, 100);
  }
}
