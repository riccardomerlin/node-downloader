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

rl.on('line', read);

const args = [];
const prompts = [
  'Download path (current dir): ',
  'Access Token: ',
  'Refresh Token: '
];

prompt();

function read(input) {
  args.push(input);
  prompt();
}

function prompt() {
  if (prompts.length === 0) {
    rl.removeListener('line', read);
    masterProcess(...args);
    return;
  }
  
  rl.setPrompt(prompts.shift());
  rl.prompt();
}
