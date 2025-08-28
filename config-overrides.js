const path = require('path');

module.exports = function override(config, env) {
  // Add source-map-loader configuration
  config.module.rules.push({
    test: /\.(js|mjs|jsx|ts|tsx)$/,
    enforce: 'pre',
    use: ['source-map-loader'],
    exclude: /node_modules\/dag-jose/,
  });

  // Add resolve fallbacks
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "assert": require.resolve("assert/"),
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "os": require.resolve("os-browserify/browser"),
    "url": require.resolve("url/")
  };

  return config;
}; 