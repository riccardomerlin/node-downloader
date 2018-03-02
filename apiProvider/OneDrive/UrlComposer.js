const urlJoin = require('proper-url-join');

class UrlComposer {
  static compose(baseUri, path) {
    return `${typeof path === 'undefined' || path.trim() === ''
      ? urlJoin(baseUri)
      : `${urlJoin(baseUri)}:${urlJoin(path)}:`}`;
  }
}

module.exports = UrlComposer;
