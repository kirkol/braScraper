const { writeFile } = require('fs/promises');

const log = async (...str) => {
  try {
    const strs = str.join() + '\n';
    console.log(strs);
    await writeFile('./log.txt', strs, { flag: 'a' });
    if (strs.startsWith('Err'))
      await writeFile('./logErr.txt', `${new Date()} ${strs}`, { flag: 'a' });
  } catch (err) {
    console.log('Something wrong happened with logging', err);
  }
};

module.exports = log;
