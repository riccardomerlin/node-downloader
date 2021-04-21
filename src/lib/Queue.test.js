// jest mocks have to be declared first
jest.mock('./callApi.js');

const callApi = require('./callApi');
const Queue = require('./Queue');

describe('Queue', () => {
  let queue;
  beforeEach(() => {
    queue = new Queue();
    callApi.mockClear();
  });

  test('is empty when the default constructor gets invoked', () => {
    expect(queue.isEmpty).toBe(true);
  });

  describe('hasMoreItems', () => {
    test('returns moreItems value', () => {
      queue.moreItems = true;
      const result = queue.hasMoreItems;
      expect(result).toBe(true);
    });
  });

  describe('populate', () => {
    test('calls callApi once', async () => {
      // arrange
      callApi.mockImplementationOnce(async () => Promise.resolve({}));

      // act
      try {
        await queue.populate();
      } catch (error) {
        // noop
      } finally {
        // assert
        expect(callApi).toHaveBeenCalledTimes(1);
      }
    });

    test('calls enqueue once', async () => {
      // arrange
      callApi.mockImplementationOnce(async () => Promise.resolve({}));
      const enqueue = jest.spyOn(queue, 'enqueue');

      // act
      try {
        await queue.populate();
      } catch (error) {
        // noop
      } finally {
        // assert
        expect(queue.enqueue).toHaveBeenCalledTimes(1);
        enqueue.mockRestore();
      }
    });
    test('emit stop after 3 recursive calls when persistent error in callApi', async (done) => {
      callApi
        .mockImplementation(async () => Promise.reject('myError1'));
      queue.on('error', assert);

      // act
      try {
        await queue.populate('link');
      } catch (error) {
        // noop
      }

      // assert
      function assert(errorMessage) {
        expect(callApi).toHaveBeenCalledTimes(4); // first time + 3 retries
        expect(errorMessage).toBe('myError1');
        done();
      }
    });

    test('hasMoreItems returns false if no nextLink is returned by callApi', async () => {
      // arrange
      callApi.mockImplementationOnce(async () => Promise.resolve({}));

      // act
      try {
        await queue.populate();
      } catch (error) {
        // noop
      } finally {
        // assert
        expect(queue.hasMoreItems).toBe(false);
      }
    });

    test('hasMoreItems returns true if nextLink is returned by callApi', async () => {
      // arrange
      callApi.mockImplementationOnce(() => Promise.resolve({ nextLink: 'aaa' }));

      // act
      try {
        await queue.populate();
      } catch (error) {
        // noop
      } finally {
        // assert
        expect(queue.hasMoreItems).toBe(true);
      }
    });
  });

  describe('enqueue method', () => {
    test('queue is empty if no items are enqueued', () => {
      queue.enqueue();
      expect(queue.isEmpty).toBe(true);
    });

    test('queue has 1 item if enqueue 1 item', () => {
      queue.enqueue({ name: 'item1' });
      expect(queue.count()).toBe(1);
    });

    test('queue has n items if enqueue an array of n items', () => {
      queue.queue = [{ name: 'item1' }, { name: 'item2' }];
      expect(queue.count()).toBe(2);
    });

    test('enqueue emit "started" with count and items arguments if not yet started and queue is empty', (done) => {
      queue.on('started', assert);

      queue.enqueue('item1');

      function assert(count, items) {
        expect(count).toBe(1);
        expect(items).toBe('item1');
        done();
      }
    });
  });

  describe('dequeue method', () => {
    test('returns undefined if the queue is empty', () => {
      const result = queue.dequeue();
      expect(result).toBe(undefined);
    });

    test('returns item1 if item1 and items2 get inserted in sequence', () => {
      queue.enqueue({ name: 'item1' });
      queue.enqueue({ name: 'item2' });
      const result = queue.dequeue();
      expect(result.name).toBe('item1');
    });

    test('returns item1 if item1 and items2 get inserted as array', () => {
      queue.enqueue([{ name: 'item1' }, { name: 'item2' }]);
      const result = queue.dequeue();
      expect(result.name).toBe('item1');
    });
  });

  describe('itemsEnqueued event', () => {
    test('returns 1 item if 1 item gets enqueued', (done) => {
      queue.on('itemsEnqueued', (count, item) => {
        expect(count).toBe(1);
        expect(item).toBe('myitem');
        done();
      });

      queue.enqueue('myitem');
    });

    test('returns n items if n items get enqueued', (done) => {
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
      queue.on('itemDequeued', (count) => {
        expect(count).toBe(0);
        done();
      });

      queue.dequeue();
    });

    test('returns count n-1 after dequeue method is called in a queue that has n items', (done) => {
      queue.on('itemDequeued', (count) => {
        expect(count).toBe(2);
        done();
      });
      queue.queue = ['myitem1', 'myitem2', 'myitem3'];

      queue.dequeue();
    });
  });
});
