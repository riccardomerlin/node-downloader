const VideoFile = require('./VideoFile');
const PhotoFile = require('./PhotoFile');

class FileFactory {
  static Create(file) {
    switch (file.media) {
      case 'video':
        return new VideoFile(file);
      case 'photo':
        return new PhotoFile(file);
      default:
        throw new Error('FileFactory Create: invalid media type.');
    }
  }
}

module.exports = FileFactory;
