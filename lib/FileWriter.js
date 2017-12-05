const fs = require('fs');
const { Transform } = require('stream');
const EventEmitter = require('events');

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

  write(stream, fileName) {
    stream
    .pipe(this.progress)
    .pipe(fs.createWriteStream(`./downloads/${fileName}`))
    .on('finish', () => {
      this.emit('done', fileName);
    });
  }
}

module.exports = new FileWriter();
