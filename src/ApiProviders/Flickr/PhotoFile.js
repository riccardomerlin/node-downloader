const uuidV1 = require('uuid/v1');

class PhotoFile {
  constructor(photo) {
    this._id = photo.id;
    this._url = photo.url_o;
    this._size = photo.size;
    this._dateTaken = photo.datetaken;
  }

  get id() {
    return this._id;
  }

  get name() {
    let name = uuidV1();
    if (typeof this._url === 'string') {
      const startPosition = this._url.lastIndexOf('/') + 1;
      name = this._url.substring(startPosition, this._url.length);
    }
    const prefix = this._dateTaken.split(' ')[0];
    return `${prefix}_${name}`;
  }

  get size() {
    return this._size;
  }

  get url() {
    return this._url;
  }
}

module.exports = PhotoFile;
