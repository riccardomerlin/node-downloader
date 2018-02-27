const Queue = require('./Queue');

describe('Queue tests', () => {
  test('queue is empty when the default constructor gets invoked', () => {
    const queue = new Queue();
    expect(queue.isEmpty).toBe(true);
  });

  test('queue has 1 element when passing an item in the constructor', () => {
    const queue = new Queue({ mane: 'item1' });
    expect(queue.count()).toBe(1);
  });

  test('queue has n elements when passing an array of n items in the contructor', () => {
    const queue = new Queue([{ mane: 'item1' }, { name: 'item2' }]);
    expect(queue.count()).toBe(2);
  });

  describe('enqueue method', () => {
    test('queue is empty if no items are enqueued', () => {
      const queue = new Queue();
      queue.enqueue();
      expect(queue.isEmpty).toBe(true);
    });

    test('queue has 1 item if enqueue 1 item', () => {
      const queue = new Queue();
      queue.enqueue({ name: 'item1' });
      expect(queue.count()).toBe(1);
    });

    test('queue has n items if enqueue an array of n items', () => {
      const queue = new Queue();
      queue.enqueue([{ name: 'item1' }, { name: 'item2' }]);
      expect(queue.count()).toBe(2);
    });
  });

  describe('dequeue method', () => {
    test('returns undefined if the queue is empty', () => {
      const queue = new Queue();
      const result = queue.dequeue();
      expect(result).toBe(undefined);
    });

    test('returns item1 if item1 and items2 get inserted in sequence', () => {
      const queue = new Queue();
      queue.enqueue({ name: 'item1' });
      queue.enqueue({ name: 'item2' });
      const result = queue.dequeue();
      expect(result.name).toBe('item1');
    });

    test('returns item1 if item1 and items2 get inserted as array', () => {
      const queue = new Queue([{ name: 'item1' }, { name: 'item2' }]);
      const result = queue.dequeue();
      expect(result.name).toBe('item1');
    });
  });

  describe('itemsEnqueued event', () => {
    test('returns 1 item if 1 item gets enqueued', (done) => {
      const queue = new Queue();
      queue.on('itemsEnqueued', (count, item) => {
        expect(count).toBe(1);        
        expect(item).toBe('myitem');        
        done();
      });

      queue.enqueue('myitem');
    });

    test('returns n items if n items get enqueued', (done) => {
      const queue = new Queue();
      queue.on('itemsEnqueued', (count, items) => {
        expect(count).toBe(2);        
        expect(items.shift()).toBe('myitem');        
        expect(items.shift()).toBe('myseconditem');        
        done();
      });

      queue.enqueue(['myitem', 'myseconditem']);
    });
  });

  describe('itemDequeued event', () => {
    test('returns count 0 after dequeue method is called in an empty queue', (done) => {
      const queue = new Queue();
      queue.on('itemDequeued', (count) => {    
        expect(count).toBe(0);  
        done();
      });

      queue.dequeue();
    });

    test('returns count n-1 after dequeue method is called in a queue that has n items', (done) => {
      const queue = new Queue(['myitem1', 'myitem2', 'myitem3']);
      queue.on('itemDequeued', (count) => {    
        expect(count).toBe(2);  
        done();
      });

      queue.dequeue();
    });
  });
});
