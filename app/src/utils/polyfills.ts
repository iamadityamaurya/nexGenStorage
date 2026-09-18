import 'react-native-get-random-values';
import { Buffer } from 'buffer';
// @ts-ignore
import process from 'process';
import randomBytes from './randombytesPolyfill';

const globalObj: any = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : {});

// Polyfill global Buffer
if (typeof globalObj.Buffer === 'undefined') {
  globalObj.Buffer = Buffer;
}

// Polyfill global process
if (typeof globalObj.process === 'undefined') {
  globalObj.process = process;
} else {
  const bProcess = process;
  for (const p in bProcess) {
    if (!(p in globalObj.process)) {
      globalObj.process[p] = (bProcess as any)[p];
    }
  }
}

// Polyfill EventEmitter if needed
if (typeof globalObj.EventEmitter === 'undefined') {
  const { EventEmitter } = require('events');
  globalObj.EventEmitter = EventEmitter;
}

// Ensure crypto object with randomBytes is present globally
if (typeof globalObj.crypto === 'undefined') {
  globalObj.crypto = {};
}
if (typeof globalObj.crypto.randomBytes === 'undefined') {
  globalObj.crypto.randomBytes = randomBytes;
}

export {};
