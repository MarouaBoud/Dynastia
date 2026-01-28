const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Block Node.js adapter from axios
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Block Node.js built-in modules
  const nodeBuiltins = [
    'crypto', 'stream', 'http', 'https', 'http2', 'url', 'zlib',
    'assert', 'buffer', 'util', 'net', 'tls', 'fs', 'path', 'os',
    'dns', 'child_process', 'cluster', 'dgram', 'readline', 'repl',
    'tty', 'v8', 'vm', 'process', 'events', 'timers', 'string_decoder',
    'querystring', 'punycode'
  ];

  if (nodeBuiltins.includes(moduleName)) {
    return {
      filePath: require.resolve('./empty-module.js'),
      type: 'sourceFile',
    };
  }

  // Block follow-redirects (axios Node.js dependency)
  if (moduleName === 'follow-redirects') {
    return {
      filePath: require.resolve('./empty-module.js'),
      type: 'sourceFile',
    };
  }

  // Block proxy-from-env (axios Node.js dependency)
  if (moduleName === 'proxy-from-env') {
    return {
      filePath: require.resolve('./empty-module.js'),
      type: 'sourceFile',
    };
  }

  // Block form-data (axios Node.js dependency)
  if (moduleName === 'form-data') {
    return {
      filePath: require.resolve('./empty-module.js'),
      type: 'sourceFile',
    };
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
