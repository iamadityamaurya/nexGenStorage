const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const nodeLibs = require('node-libs-react-native');

const config = getDefaultConfig(__dirname);

const randomBytesPath = path.resolve(__dirname, 'src/utils/randombytesPolyfill.js');

config.resolver.extraNodeModules = {
  ...nodeLibs,
  ...config.resolver.extraNodeModules,
  crypto: require.resolve('crypto-browserify'),
  randombytes: randomBytesPath,
  'react-native-randombytes': randomBytesPath,
  path: require.resolve('path-browserify'),
  os: require.resolve('os-browserify/browser'),
  stream: require.resolve('stream-browserify'),
  events: require.resolve('events'),
  buffer: require.resolve('buffer'),
  util: require.resolve('util/'),
  fs: path.resolve(__dirname, 'src/utils/fsMock.js'),
  net: path.resolve(__dirname, 'src/utils/fsMock.js'),
  tls: path.resolve(__dirname, 'src/utils/fsMock.js'),
};

module.exports = config;
