const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver alias for web platform to handle native-only modules
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native/Libraries/Utilities/codegenNativeCommands': './metro-shim.js',
};

module.exports = config;