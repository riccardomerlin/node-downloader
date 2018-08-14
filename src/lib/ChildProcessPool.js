const { fork } = require('child_process');
const EventEmitter = require('events');

class ChildProcessPool extends EventEmitter {
  constructor(maxChildProcess) {
    super();
    this.maxChildProcess = maxChildProcess || 1;
    this.childProcessCount = 0;
  }

  tryFork(script) {
    const count = this.childProcessCount;
    if (count >= this.maxChildProcess) {
      return null;
    }

    const incrementedCount = ++this.childProcessCount;
    this.emit('childForked', incrementedCount);
    
    const childProcess = fork(script);
    childProcess.on('disconnect', () => {
      const currentProcesses = --this.childProcessCount;
      this.emit('childDisconnected', currentProcesses);
    });
  
    return childProcess;
  }
}

module.exports = ChildProcessPool;
