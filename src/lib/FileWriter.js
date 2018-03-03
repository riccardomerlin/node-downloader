const fs = require('fs');
const { Transform } = require('stream');
const EventEmitter = require('events');
const path = require('path');

class FileWriter extends EventEmitter {
  constructor() {
    super();
    this.progress = new Transform({
      transform: (chunk, encoding, callback) => {
        this.emit('newChunk', chunk);
        callback(null, chunk);
      }
    });
  }

  write(stream, folderPath, fileName) {
    stream
    .pipe(this.progress)
    .pipe(fs.createWriteStream(`${path.join(folderPath, fileName)}`))
    .on('finish', () => {
      this.emit('done', fileName);
    });
  }
}

module.exports = FileWriter;
