const { Buffer } = require('buffer');

function randomBytes(size, cb) {
  const rawBytes = new Uint8Array(size);
  const cryptoObj = typeof globalThis !== 'undefined' && globalThis.crypto
    ? globalThis.crypto
    : (typeof window !== 'undefined' && window.crypto ? window.crypto : null);

  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    cryptoObj.getRandomValues(rawBytes);
  } else {
    // Fallback pseudo-random
    for (let i = 0; i < size; i++) {
      rawBytes[i] = Math.floor(Math.random() * 256);
    }
  }

  const buf = Buffer.from(rawBytes.buffer, rawBytes.byteOffset, rawBytes.byteLength);

  if (typeof cb === 'function') {
    if (typeof process !== 'undefined' && typeof process.nextTick === 'function') {
      process.nextTick(() => cb(null, buf));
    } else {
      setTimeout(() => cb(null, buf), 0);
    }
    return;
  }

  return buf;
}

randomBytes.randomBytes = randomBytes;
randomBytes.seedSJCL = (cb) => { if (cb) cb(); };

module.exports = randomBytes;
module.exports.default = randomBytes;
