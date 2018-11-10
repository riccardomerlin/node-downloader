const { spawn } = require('child_process');

function runWebServer() {
  return new Promise(async (resolve, reject) => {
    const web = spawn('node', ['./webServer.js'],
      {
        cwd: './src/ApiProviders/Flickr/WebServer/',
        stdio: ['pipe', 'pipe', 'pipe', 'ipc']
      });

    web.stdout.on('data', (data) => {
      console.log(`${data}`);
      resolve(web);
    });

    web.stderr.on('data', (data) => {
      console.log(`${data}`);
      reject(`web-access error: ${data}`);
    });

    web.on('close', (code) => {
      console.log(`Fickr web server process exited with code ${code}.`);
    });
  });
}

module.exports = {
  run: runWebServer
};
