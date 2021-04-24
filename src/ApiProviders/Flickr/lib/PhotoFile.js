const uuidV1 = require('uuid/v1');
const MediaFile = require('./MediaFile');

class PhotoFile extends MediaFile {
  get name() {
    let name = uuidV1();
    if (typeof this._url === 'string') {
      const startPosition = this._url.lastIndexOf('/') + 1;
      name = this._url.substring(startPosition, this._url.length);
    }
    const prefix = this._dateTaken.split(' ')[0];
    return `${prefix}_${name}`;
  }
}

module.exports = PhotoFile;
