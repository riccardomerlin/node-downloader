const { fork } = require('child_process');
const EventEmitter = require('events');

class ChildProcessPool extends EventEmitter {
  constructor(maxChildProcess) {
    super();
    this.maxChildProcess = maxChildProcess || 1;
    this.childProcessCount = 0;
  }

  tryFork(script) {
    if (!this.canFork()) {
      return null;
    }

    const incrementedCount = ++this.childProcessCount;
    this.emit('childForked', incrementedCount);

    if (this.canFork()) {
      this.emit('canFork');
    }

    const childProcess = fork(script);
    childProcess.on('disconnect', () => {
      const currentProcesses = --this.childProcessCount;
      this.emit('childDisconnected', currentProcesses);
    });
  
    return childProcess;
  }

  canFork() {
    return this.childProcessCount < this.maxChildProcess;
  }
}

module.exports = ChildProcessPool;
