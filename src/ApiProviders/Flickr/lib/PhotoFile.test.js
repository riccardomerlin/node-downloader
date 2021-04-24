const uuidV1 = require('uuid/v1');

const PhotoFile = require('./PhotoFile');

jest.mock('uuid/v1', () => jest.fn().mockImplementation(() => '40db8d30-fa78-11e8-9dcc-6109579d5771'));

describe('PhotoFile tests', () => {
  beforeEach(() => {
    uuidV1.mockClear();
  });

  test('should return photo.id value when ask for file.id', () => {
    const photo = { id: 1000 };
    const file = new PhotoFile(photo);
    expect(file.id).toBe(photo.id);
  });

  test('should return photo.url_o value when ask for file.url', () => {
    const photo = { url_o: 'http://this/is/my/path/to/filename.jpg' };
    const file = new PhotoFile(photo);
    expect(file.url).toBe(photo.url_o);
  });

  test('should return yyyy-MM-dd and last part of url when ask for file.name', () => {
    const photo = {
      url_o: 'http://this/is/my/path/to/filename.jpg',
      datetaken: '2004-09-04 18:30:19'
    };
    const file = new PhotoFile(photo);
    expect(file.name).toBe('2004-09-04_filename.jpg');
  });

  test('should return photo.size value when ask for file.size', () => {
    const photo = { size: 3045 };
    const file = new PhotoFile(photo);
    expect(file.size).toBe(photo.size);
  });

  test('should have name equals to datetaken + guid when url is undefined', () => {
    const photo = { datetaken: '2004-09-04 18:30:19' };
    const file = new PhotoFile(photo);
    const name = file.name;
    expect(name).toBe('2004-09-04_40db8d30-fa78-11e8-9dcc-6109579d5771');
  });
});
