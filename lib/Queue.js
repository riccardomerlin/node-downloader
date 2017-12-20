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
    
    const totalCount = this.count();
    this.emit('itemsEnqueued', totalCount, items);
  }

  dequeue() {
    const item = this.queue.pop();
    const totalCount = this.count();    
    this.emit('itemDequeued', totalCount);
    return item;
  }

  count() {
    return this.queue.length;
  }

  get isEmpty() {
    return this.queue.length === 0;
  }
}

module.exports = Queue;
