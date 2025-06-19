module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
    ],
    plugins: [
      '@babel/plugin-transform-export-namespace-from',
      ['module-resolver',
      {
        root: ['./'],
        alias: {
        },
      }],
      'react-native-reanimated/plugin',
    ],
  };
};
