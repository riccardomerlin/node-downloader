const uuidV1 = require('uuid/v1');
const MediaFile = require('./MediaFile');

class VideoFile extends MediaFile {
  constructor(video) {
    super(video)
  }
}

module.exports = VideoFile;
