const Queue = require('./lib/Queue');
const ChildProcessPool = require('./lib/ChildProcessPool');
const fs = require('fs');

process.on('uncaughtException', () => {
  process.exit(1);
});
const downloadPath = './downloads';

try {
  fs.mkdirSync(downloadPath);
  console.log(`Directory '${downloadPath}' created.`);  
} catch (error) {
  if (error.code !== 'EEXIST') {
    throw error;
  }
  console.log(`Directory '${downloadPath}' already exists.`);
}

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

const maxEnqueueCalls = 2;
let count = 0;
setInterval(() => {
  if (count < maxEnqueueCalls) {
    filesQueue.enqueue(
      [{ name: 'big1.file', size: 1788000447 },
      { name: 'small1.file', size: 4470447 },
      { name: 'big2.file', size: 1788000447 },
      { name: 'small2.file', size: 4470447 },
      { name: 'big3.file', size: 1788000447 },
      { name: 'small3.file', size: 4470447 },
      { name: 'big4.file', size: 1788000447 },
      { name: 'small4.file', size: 4470447 },
      { name: 'big5.file', size: 1788000447 },
      { name: 'small5.file', size: 4470447 }]
    );
    count++;
  } else {
    stop = true;
  }
}, 1000);

donwloadNext(filesQueue, processPool);

function donwloadNext(queue, pool) {
  if (stop === true && queue.isEmpty === true) return;

  const childProcess = pool.tryFork('./lib/download.js');
  if (!childProcess) return;

  const file = queue.dequeue();
  if (!file) {
    childProcess.disconnect();
    setTimeout(() => donwloadNext(queue, pool), 1000);
    return;
  }

  childProcess.on('message', () => {
    childProcess.disconnect();
    donwloadNext(queue, pool);
  });

  childProcess.send(file);
  
  donwloadNext(queue, pool);
}
