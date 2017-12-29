const net = require('net');

const port = 8000;

class Monitor {
  constructor() {
    this.sockets = {};
    this.port = port;
    this.server = net.createServer();
    this.counter = 0;
    this.server.on('connection', (socket) => {
      socket.id = this.counter++;

      socket.on('end', () => {
        delete this.sockets[socket.id];
        console.log('Client disconnected');
      });

      this.sockets[socket.id] = socket;
    });
    this.server.listen(this.port, () =>
      console.log(`Server monitor is active on port ${this.port}.`)
    );
  }

  broadcast(args) {
    Object.values(this.sockets).forEach((s) => {
      s.write(JSON.stringify(args));
    });
  }
}

module.exports = Monitor;
