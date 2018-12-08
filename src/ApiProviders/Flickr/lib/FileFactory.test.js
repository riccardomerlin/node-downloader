const FileFactory = require('./FileFactory');
const VideoFile = require('./VideoFile');
const PhotoFile = require('./PhotoFile');

describe('FileFactory tests', () => {
  test('should return VideoFile instance when media is video', () => {
    const file = { media: 'video' }
    const created = FileFactory.Create(file);
    expect(created).toBeInstanceOf(VideoFile);
  });

  test('should return PhotoFile instance when media is photo', () => {
    const file = { media: 'photo' }
    const created = FileFactory.Create(file);
    expect(created).toBeInstanceOf(PhotoFile);
  });

  test('should return undefined if no tipe in file', () => {
    const file = { }
    const created = FileFactory.Create(file);
    expect(created).toBeUndefined();
  });
});
