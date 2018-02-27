const client = require('net').Socket();
const log = require('single-line-log').stdout;

client.connect(8000, '127.0.0.1', () => {
  console.log('Connected');
});

client.on('data', (data) => {
  try {
    log(formatOutput(data));
  } catch (error) {
    // noop
  }
});

client.on('close', () => {
  console.log('Connection closed');
});

function formatOutput(msg) {
  const {
    itemsInQueue,
    activeDownloads,
    downloadsCompleted,
    totalItems,
    httpFailures
    } = JSON.parse(msg);

  return `Items in queue: ${itemsInQueue}\nActive downloads: ${activeDownloads}\nDownloads left: ${totalItems - downloadsCompleted}\nDownloaded / Total: ${downloadsCompleted}/${totalItems}\nFailures/Retry: ${httpFailures}\n`;
}
