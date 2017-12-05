const fileWriter = require('./FileWriter');
const fs = require('fs');

process.on('message', write);

function write(file) {
  if (file) {
    let read = 0;
    fileWriter.on('newChunk', (chunk) => {
      read += chunk.length;
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write((`${percentage(file.size, read)}% `));
    });

    fileWriter.on('done', (fileName) => {
      process.stdout.clearLine();      
      process.stdout.cursorTo(0);
      process.stdout.write(`100% ${fileName} complete.\n`);
  
      process.send('done');
    });

    fileWriter.write(
      fs.createReadStream(`./files/${file.name}`),
      file.name
    );
  }
}

function percentage(total, fraction) {
  return Math.ceil((fraction * 100) / total);
}
