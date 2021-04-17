const EventEmitter = require('events');
const callApi = require('./callApi');

class Queue extends EventEmitter {
  constructor(endpoint) {
    super();

    this.endpoint = endpoint;
    this.queue = [];
    this.moreItems = false;
    this.started = false;
  }

  get isEmpty() {
    return this.queue.length === 0;
  }

  get hasMoreItems() {
    return this.moreItems;
  }

  async populate(nextLink) {
    let result;
    try {
      result = await callApi(this.endpoint, 'getFiles', nextLink);
    } catch (error) {
      this.emit('error', error);
      await this.populate(nextLink);
      return;
    }

    this.enqueue(result.files);

    if (result.nextLink) {
      this.moreItems = true;
      await this.populate(result.nextLink);
    } else {
      this.moreItems = false;
    }
  }

  enqueue(items) {
    if (!items) {
      return;
    }
    const countBeforeEnqueue = this.count();

    if (Array.isArray(items)) {
      this.queue.push(...items);
    } else {
      this.queue.push(items);
    }

    const totalCount = this.count();
    this.emit('itemsEnqueued', totalCount, items);
    if (!this.started && countBeforeEnqueue === 0) {
      this.started = true;
      this.emit('started', totalCount, items);
    }
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
}

module.exports = Queue;
