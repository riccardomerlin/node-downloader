const { fork } = require('child_process');
const EventEmitter = require('events');

class ChildProcessPool extends EventEmitter {
  constructor(maxChildProcess) {
    super();
    this.maxChildProcess = maxChildProcess;
    this.childProcessCount = 0;
  }

  tryFork(script) {
    const count = this.childProcessCount;
    if (count >= this.maxChildProcess) {
      return null;
    }

    ++this.childProcessCount;
    const childProcess = fork(script);
    childProcess.on('disconnect', () => {
      const currentProcesses = --this.childProcessCount;
      this.emit('childDisconnected', currentProcesses);
    });
  
    return childProcess;
  }
}

module.exports = ChildProcessPool;
