const Monitor = require('./Monitor');

jest.mock('net');

describe('Monitor tests', () => {
  let monitor;
  beforeEach(() => {
    monitor = new Monitor();
  });

  test('displayObject should be {} if call the empty contructor', () => {
    expect(monitor.displayObject).toMatchObject({});
  });

  test('counter should be 0 when Monitor gets created', () => {
    monitor = new Monitor({ a: 'a', b: 'b' });
    expect(monitor.counter).toBe(0);
  });

  test('sockets should be {} when Monitor gets created', () => {
    expect(monitor.sockets).toMatchObject({});
  });

  describe('updateProperty', () => {
    test('should add property "newProp" to displayObject', () => {
      monitor.updateProperty('newProp');
      expect(monitor.displayObject).toHaveProperty('newProp');
    });

    test('should have property newProp with value "newPropValue"', () => {
      monitor.updateProperty('newProp', 'newPropValue');
      expect(monitor.displayObject.newProp).toBe('newPropValue');
    });

    test('should not call broadcast() if not propety specified', () => {
      // arrange
      const broadcastSpy = jest.spyOn(monitor, 'broadcast');

      // act 
      monitor.updateProperty();

      // assert
      expect(broadcastSpy).not.toHaveBeenCalled();

      broadcastSpy.mockRestore();
    });

    test('should call broadcast() if property specified', () => {
      // arrange
      const broadcastSpy = jest.spyOn(monitor, 'broadcast');

      // act 
      monitor.updateProperty('newProp');

      // assert
      expect(broadcastSpy).toHaveBeenCalledTimes(1);

      broadcastSpy.mockRestore();
    });

    test('should not add undefined property to displayObject', () => {
      monitor.updateProperty();
      expect(monitor.displayObject).not.toHaveProperty('undefined');
    });

    test('should not add null property to displayObject', () => {
      monitor.updateProperty(null);
      expect(monitor.displayObject).not.toHaveProperty('null');
    });
  });

  describe('broadcast', () => {
    test('should call socket.write() for each socket', () => {
      // arrange
      const mockSocket = {
        write: () => { }
      };
      monitor.sockets = {
        1: mockSocket,
        2: mockSocket,
        3: mockSocket
      };
      const socketWriteSpy = jest.spyOn(mockSocket, 'write');

      // act 
      monitor.broadcast();

      // assert
      expect(socketWriteSpy).toHaveBeenCalledTimes(3);

      socketWriteSpy.mockRestore();
    });
  });
});
