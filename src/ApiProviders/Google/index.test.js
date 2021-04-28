const GoogleApiProvider = require('./index');

describe('GoolgeApiProvider', () => {
  test('Constructor sets accessToken and refreshToken', () => {
    const expectedAccessToken = 'myAccessToken';
    const expectedRefreshToken = 'myRefreshToken';
    const apiProvider = new GoogleApiProvider(expectedAccessToken, expectedRefreshToken);
    expect(apiProvider.accessToken).toBe(expectedAccessToken);
    expect(apiProvider.refreshToken).toBe(expectedRefreshToken);
  });

  describe('getFolderInfo', () => {
    test('returns -1 for totalItems and byteSize', async () => {
      const apiProvider = new GoogleApiProvider();
      const result = await apiProvider.getFolderInfo();
      expect(result.totalItems).toBe(-1);
      expect(result.byteSize).toBe(-1);
    });
  });
});
