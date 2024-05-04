const { writeFile } = require('fs/promises');
const { resolve } = require('path');

const log = async (...str) => {
  try {
    const strs = str.join() + '\n';
    console.log(strs);
    await writeFile(resolve(process.cwd(), 'log.txt'), strs, { flag: 'a' });
    if (strs.startsWith('Err'))
      await writeFile(
        resolve(process.cwd(), 'logErr.txt'),
        `${new Date()} ${strs}`,
        { flag: 'a' },
      );
  } catch (err) {
    console.log('Something wrong happened with logging', err);
  }
};

module.exports = log;
