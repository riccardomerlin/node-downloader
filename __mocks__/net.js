const EventEmitter = require('events');

class MockServer extends EventEmitter {
  createServer() {
    return {
      on: () => { },
      listen: () => { }
    };
  }
}

module.exports = new MockServer();
