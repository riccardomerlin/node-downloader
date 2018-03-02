const UrlComposer = require('./UrlComposer');

describe('Url composer tests', () => {
  test('returns baseUri if path is an empty string', () => {
    const baseUri = 'http://mydomain.com';
    const path = '';
    const result = UrlComposer.compose(baseUri, path);
    expect(result).toBe(baseUri);
  });

  test('returns baseUri if path is undefined', () => {
    const baseUri = 'http://mydomain.com';
    const path = undefined;
    const result = UrlComposer.compose(baseUri, path);
    expect(result).toBe(baseUri);
  });

  test('returns baseUri and path joined with : at the end if path has value', () => {
    const baseUri = 'http://mydomain.com/';
    const path = '/mypath/tofile/';
    const result = UrlComposer.compose(baseUri, path);
    expect(result).toBe('http://mydomain.com:/mypath/tofile:');
  });
});
