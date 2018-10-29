const ChildProcessPool = require('./ChildProcessPool');

jest.mock('child_process');

describe('ChildProcessPool tests', () => {
  let childProcessPool;
  beforeEach(() => {
    childProcessPool = new ChildProcessPool();
  });

  test('maxChildProcess should be 1 if no argument passed in the constructor', () => {
    expect(childProcessPool.maxChildProcess).toBe(1);
  });

  test('maxChildProcess should have the value passed in the constructor', () => {
    childProcessPool = new ChildProcessPool(10);
    expect(childProcessPool.maxChildProcess).toBe(10);
  });

  test('childProcessCount should be 0 when the class has been instantiated', () => {
    expect(childProcessPool.childProcessCount).toBe(0);
  });

  describe('tryFork', () => {
    test('should return null if childProcessCount is equal maxChildProcess', () => {
      // arrange
      childProcessPool.childProcessCount = 1;

      // act
      const result = childProcessPool.tryFork();

      // assert
      expect(result).toBeNull();
    });

    test('should return null if childProcessCount is greater than maxChildProcess', () => {
      // arrange
      childProcessPool.childProcessCount = 2;

      // act
      const result = childProcessPool.tryFork();

      // assert
      expect(result).toBeNull();
    });

    test('should increment childProcessCount on childForked event', (done) => {
      // arrange
      childProcessPool.childProcessCount = 0;
      childProcessPool.on('childForked', assert);

      // act
      childProcessPool.tryFork();

      // assert
      function assert(count) {
        expect(childProcessPool.childProcessCount).toBe(1);
        expect(count).toBe(1);
        done();
      }
    });

    test('should decrement childProcessCount on disconnect event', (done) => {
      // arrange
      childProcessPool.childProcessCount = 0;
      childProcessPool.on('childDisconnected', assert);

      // act
      childProcessPool.tryFork();

      // assert
      function assert(count) {
        expect(childProcessPool.childProcessCount).toBe(0);
        expect(count).toBe(0);
        done();
      }
    });

    test('should emit canFork when childProcessCount < maxChildProcess after tryFork is called', (done) => {
      // arrange
      childProcessPool = new ChildProcessPool(2);
      childProcessPool.childProcessCount = 0;
      childProcessPool.on('canFork', assert);

      // act
      childProcessPool.tryFork();

      // assert
      function assert() {
        done();
      }    
    });

    test('should emit 3 events when childProcessCount < maxChildProcess after tryFork is called', () => {
      // arrange
      childProcessPool = new ChildProcessPool(2);
      childProcessPool.childProcessCount = 0;
      childProcessPool.emit = jest.fn().mockReturnValue();

      // act
      childProcessPool.tryFork();

      // assert
      expect(childProcessPool.emit).toHaveBeenCalledTimes(3); 
    });

    test('should emit 2 events when childProcessCount = maxChildProcess after tryFork is called', () => {
      // arrange
      childProcessPool = new ChildProcessPool(1);
      childProcessPool.childProcessCount = 0;
      childProcessPool.emit = jest.fn().mockReturnValue();

      // act
      childProcessPool.tryFork();

      // assert
      expect(childProcessPool.emit).toHaveBeenCalledTimes(2); 
    });

    test('should emit 0 events when childProcessCount > maxChildProcess after tryFork is called', () => {
      // arrange
      childProcessPool = new ChildProcessPool(1);
      childProcessPool.childProcessCount = 1;
      childProcessPool.emit = jest.fn().mockReturnValue();

      // act
      childProcessPool.tryFork();

      // assert
      expect(childProcessPool.emit).toHaveBeenCalledTimes(0); 
    });
  });

  describe('canFork', () => {
    test('should return true when childProcessCount < maxChildProcess', () => {
      childProcessPool = new ChildProcessPool(1);
      childProcessPool.childProcessCount = 0;

      const result = childProcessPool.canFork();

      expect(result).toBe(true);
    });

    test('should return false when childProcessCount = maxChildProcess', () => {
      childProcessPool = new ChildProcessPool(1);
      childProcessPool.childProcessCount = 1;

      const result = childProcessPool.canFork();

      expect(result).toBe(false);
    });

    test('should return false when childProcessCount > maxChildProcess', () => {
      childProcessPool = new ChildProcessPool(1);
      childProcessPool.childProcessCount = 2;

      const result = childProcessPool.canFork();

      expect(result).toBe(false);
    });
  });
});
