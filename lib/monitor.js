const net = require('net');

const port = 8000;

class Monitor {
  constructor() {
    this.sockets = {};
    this.server = net.createServer();
    this.counter = 0;
    this.server.on('connection', (socket) => {
      socket.id = this.counter++;

      this.socket.on('end', () => {
        delete this.sockets[socket.id];
        console.log('Client disconnected');
      });

      this.sockets[socket.id] = socket;      
    });
    this.server.listen(port, () => console.log(`Server monitor is active on port ${port}.`));
  }

  broadcast(message) {
    Object.entries(this.sockets).forEach((s) => {
      s.write(message);
    });
  }
}

module.exports = new Monitor();
