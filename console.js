const readline = require('readline');
const masterProcess = require('./lib/master');
const toobusy = require('toobusy-js');

process.on('uncaughtException', (error) => {
  console.error(error.message);
  process.exit(999);
});

process.on('unhandledRejection', (error) => {
  throw error; 
});

toobusy.onLag((currentLag) => {
  console.log(`Event loop lag detected! Latency: ${currentLag}ms`);
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
