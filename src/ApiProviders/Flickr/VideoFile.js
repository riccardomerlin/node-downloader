const uuidV1 = require('uuid/v1');
const MediaFile = require('./MediaFile');

class VideoFile extends MediaFile {
  constructor(video) {
    super(video)
  }

  get url() {
    return `http://www.flickr.com/video_download.gne?id=${this._id}`
  }
}

module.exports = VideoFile;
