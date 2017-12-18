const { fork } = require('child_process');

const array = [];
populateArray(array);
spawnProcess();

let count = 0;
function populateArray(arr) {
  const number = Math.round(Math.random() * 100);
  arr.unshift(number);
  console.log(`${number} added.`);
  setTimeout(() => {
    count++;
    if (count < 50) {
      populateArray(arr);
    } else {
      process.exit();
    }
  }, 500);
}

function spawnProcess() {
  const childProcess = fork('./asynctest-child.js');
  childProcess.on('message', (sum) => {
    console.log('Loop completed.', sum);
    childProcess.disconnect();
    spawnProcess();
  });

  childProcess.send('start');
}
