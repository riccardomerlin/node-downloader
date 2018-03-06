#!/usr/bin/env node

const readline = require('readline');
const masterProcess = require('./master');
const toobusy = require('toobusy-js');
const ApiProviders = require('./ApiProviders');
const { apiProviderName } = require('./config');

let rl;
let ApiEndpoint;
let currentValue;
const args = [];
const prompts = [
  {
    message: 'Download path',
    default: 'downloads'
  },
  {
    message: 'Access Token'
  },
  {
    message: 'Refresh Token',
  }
];

const apiProviders = new ApiProviders();
apiProviders.get(apiProviderName).then((endpoint) => {
  ApiEndpoint = endpoint;
  main();
});

function main() {
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
  
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.on('line', read);
  
  prompt();
}

function read(input) {
  const value = input.trim();
  args.push(value !== '' ? value : currentValue);
  prompt();
}

function prompt() {
  if (prompts.length === 0) {
    rl.removeListener('line', read);
    masterProcess(ApiEndpoint, ...args);
    return;
  }

  const p = prompts.shift();
  currentValue = p.default;

  rl.setPrompt(`${p.message}${p.default ? ` (${p.default})` : ''}: `);
  rl.prompt();
}
