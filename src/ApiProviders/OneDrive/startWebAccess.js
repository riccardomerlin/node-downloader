const { spawn } = require('child_process');

function startWebAccess() {
  return new Promise(async (resolve, reject) => {
    const web = spawn('node', ['./index.js'],
      {
        cwd: './src/ApiProviders/OneDrive/web-access'
      });

    web.stdout.on('data', (data) => {
      console.log(`web-access: ${data}`);
      resolve();
    });

    web.stderr.on('data', (data) => {
      const msg = `web-access error: ${data}`;
      console.log(msg);
      reject(msg);
    });

    web.on('close', (code) => {
      console.log(`web-access process exited with code ${code}`);
    });
  });
}

module.exports = startWebAccess;
