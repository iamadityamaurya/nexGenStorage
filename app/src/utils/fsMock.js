const { Buffer } = require('buffer');

module.exports = {
  statSync: () => ({ size: 0, isDirectory: () => false }),
  existsSync: () => false,
  readFileSync: () => Buffer.from(''),
  createReadStream: () => null,
  promises: {
    stat: async () => ({ size: 0, isDirectory: () => false }),
    readFile: async () => Buffer.from(''),
  },
};
