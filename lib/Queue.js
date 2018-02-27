const EventEmitter = require('events');

class Queue extends EventEmitter {
  constructor(items) {
    super();

    this.queue = [];
    this.enqueue(items);
  }

  enqueue(items) {
    if (!items) {
      return;
    }

    if (Array.isArray(items)) {
      this.queue.push(...items);
    } else {
      this.queue.push(items);
    }

    const totalCount = this.count();
    this.emit('itemsEnqueued', totalCount, items);
  }

  dequeue() {
    const item = this.queue.shift();
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
