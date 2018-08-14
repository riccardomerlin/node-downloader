const net = require('net');

class Monitor {
  constructor(displayObject, port) {
    this.displayObject = displayObject || {};
    this.sockets = {};
    this.counter = 0;
    this.serverInit(port);
  }

  broadcast() {
    Object.values(this.sockets).forEach((s) => {
      s.write(JSON.stringify(this.displayObject));
    });
  }

  serverInit(serverPort) {
    const port = serverPort || 8000;

    this.server = net.createServer();
    this.server.on('connection', (socket) => {
      socket.id = this.counter++;

      socket.on('end', () => {
        delete this.sockets[socket.id];
        console.log('Client disconnected');
      });

      this.sockets[socket.id] = socket;
    });

    this.server.listen(port, () =>
      console.log(`Server monitor is active on port ${port}.`)
    );
  }

  updateProperty(propertyName, propertyValue) {
    if (!propertyName) return;

    this.displayObject[propertyName] = propertyValue;
    this.broadcast();
  }
}

module.exports = Monitor;
