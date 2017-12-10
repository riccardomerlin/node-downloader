const readline = require('readline');
const masterProcess = require('./lib/master');

process.on('uncaughtException', (error) => {
  console.error(error.message);
  process.exit(1);
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const args = {
  downloadPath: '',
  accessToken: '',
  refreshToken: ''
};

let inputCount = 0;
rl.setPrompt('Download path (current dir): ');
rl.prompt();

rl.on('line', getInput);

function getInput(input) {
  inputCount++;
  switch (inputCount) {
    case 1:
      args.downloadPath = input || './downloads';
      rl.setPrompt('Access Token: ');
      break;
    case 2:
      args.accessToken = input;
      rl.setPrompt('Refresh Token: ');
      break;
    default:
      args.refreshToken = input;
      rl.removeListener('line', getInput);
      masterProcess(args);
      return;
  }

  rl.prompt();
}
