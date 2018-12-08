const uuidV1 = require('uuid/v1');

class MediaFile {
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

module.exports = MediaFile;
