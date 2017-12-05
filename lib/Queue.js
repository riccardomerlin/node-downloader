const EventEmitter = require('events');

class Queue extends EventEmitter {
  constructor(items) {
    super();

    if (!items) {
      this.queue = [];
    } else if (Array.isArray(items)) {
      this.queue = items;
    } else {
      this.queue = [];
      this.queue.push(items);
    }
  }

  enqueue(items) {
    if (!items) {
      throw new Error('Queue Error: no items to add.');
    }

    if (Array.isArray(items)) {
      this.queue.unshift(...items);
    } else {
      this.queue.unshift(items);
    }
    
    this.emit('itemsReceived', items);
  }

  dequeue() {
    return this.queue.pop();
  }

  count() {
    return this.queue.length;
  }

  get isEmpty() {
    return this.queue.length === 0;
  }
}

module.exports = Queue;
