process.on('message', () => {
  let sum = 0;
  for (let i = 0; i < 3e9; i++) {
    sum += i;
  }

  process.send(sum);
});
