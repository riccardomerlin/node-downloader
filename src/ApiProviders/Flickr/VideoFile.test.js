const uuidV1 = require('uuid/v1');

const VideoFile = require('./VideoFile');
jest.mock('uuid/v1', () => {
  return jest.fn().mockImplementation(() => {
    return '40db8d30-fa78-11e8-9dcc-6109579d5771';
  });
});

describe('VideoFile tests', () => {
  beforeEach(() => {
    uuidV1.mockClear();
  });

  test('should return photo.id value when ask for file.id', () => {
    const photo = { id: 1000 };
    const file = new VideoFile(photo);
    expect(file.id).toBe(photo.id);
  });

  test('should return photo.size value when ask for file.size', () => {
    const photo = { size: 3045 };
    const file = new VideoFile(photo);
    expect(file.size).toBe(photo.size);
  });

  test('should have name equals to datetaken + guid when ask for file.url', () => {
    const photo = { datetaken: '2004-09-04 18:30:19' };
    const file = new VideoFile(photo);
    const name = file.name;
    expect(name).toBe('2004-09-04_40db8d30-fa78-11e8-9dcc-6109579d5771');
  });

  test('should return video download url when asking for file.url', () => {
    const video = { id: 123 };
    const file = new VideoFile(video);
    expect(file.url).toBe('http://www.flickr.com/video_download.gne?id=123');
  });
});
