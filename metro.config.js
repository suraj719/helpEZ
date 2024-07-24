const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.resolver.sourceExts.push('cjs');

// Additional server configuration
defaultConfig.server = {
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      if (req.url.startsWith('/hot')) {
        req.url = req.url.replace('/hot', '');
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = defaultConfig;