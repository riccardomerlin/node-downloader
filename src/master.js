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

  const filesQueue = new Queue(endpoint);
  const processPool = new ChildProcessPool(childProcesses);

  processPool
    .on('childDisconnected', onChildDisconnected)
    .on('childForked', (activeChildProcesses) => {
      monitor.updateProperty('activeDownloads', activeChildProcesses);
    })
    .on('canFork', () => {
      setImmediate(() => downloadNextFile(filesQueue, processPool));
    });

  filesQueue
    .on('started', () => {
      setImmediate(() => downloadNextFile(filesQueue, processPool));
    })
    .on('itemsEnqueued', count => monitor.updateProperty('itemsInQueue', count))
    .on('itemDequeued', count => monitor.updateProperty('itemsInQueue', count))
    .on('error', error => console.error(error))
    .populate();

  function onChildDisconnected(activeChildProcesses) {
    monitor.updateProperty('activeDownloads', activeChildProcesses);

    if (activeChildProcesses === 0 && filesQueue.isEmpty && !filesQueue.hasMoreItems) {
      console.timeEnd('Elapsed time');
      console.log('All files downloaded, have a nice day!');
      process.exit();
    }

    setImmediate(() => { downloadNextFile(filesQueue, processPool); });
  }

  function downloadNextFile(queue, poolOfProcesses) {
    if (!queue.hasMoreItems && queue.isEmpty) {
      return;
    }

    const file = queue.dequeue();
    if (!file) {
      return;
    }

    const fileSaverProcess = poolOfProcesses.tryFork('./src/fileSaver.js');
    if (!fileSaverProcess) {
      queue.enqueue(file);
      return;
    }

    fileSaverProcess.on('message', (message) => {
      const { status, processedFile, percentage } = message;
      if (status !== 'newChunk') {
        fileSaverProcess.disconnect();
      }

      const logger = {
        newChunk: () => {
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
          process.stdout.write(`${percentage}% `);
        },
        done: () => {
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
          process.stdout.write(`100% ${processedFile.name} complete.\n`);
          monitor.updateProperty('downloadsCompleted', monitor.displayObject.downloadsCompleted + 1);
        },
        retry: () => {
          console.log(`Download failed. File ${processedFile.name} enqueued to be re-processed.`);
          queue.enqueue(processedFile);
          monitor.updateProperty('httpFailures', monitor.displayObject.httpFailures + 1);
        }
      };

      logger[status]();
    });

    fileSaverProcess.send({
      downloadPath,
      file: { id: file.id, name: file.name, url: file.url, size: file.size },
      accessToken: endpoint.accessToken,
      refreshToken: endpoint.refreshToken
    });
  }
}
