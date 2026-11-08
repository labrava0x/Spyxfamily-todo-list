const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        parser: {
          javascript: {
            sourceType: 'module',
          },
        },
      },
    ],
  },
  devtool: 'inline-source-map',
};