const EventEmitter = require('events');

const childProcess = jest.genMockFromModule('child_process');
childProcess.fork = jest.fn().mockImplementation(() => ({
  on: (eventName, callback) => {
    if (!eventName === 'disconnect') return;
    
    if (typeof callback !== 'function') return;

    callback();
  },
  emit: (eventName, callback) => {
    EventEmitter.emit(eventName, callback);
  }
}));


module.exports = childProcess;
