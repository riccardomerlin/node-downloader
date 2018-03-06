const { spawn } = require('child_process');

function startWebAccess() {
  return new Promise(async (resolve, reject) => {
    const web = spawn('node', ['./index.js'],
      {
        cwd: './src/ApiProviders/OneDrive/web-access'
      });

    web.stdout.on('data', (data) => {
      console.log(`${data}`);
      resolve();
    });

    web.stderr.on('data', (data) => {
      console.log(`${data}`);
      reject(`web-access error: ${data}`);
    });

    web.on('close', (code) => {
      console.log(`web-access process exited with code ${code}.`);
    });
  });
}

module.exports = startWebAccess;
