const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    index: './src/index/index.js',           // WISE page script
    yuri: './src/yuri/yuri.js',             // SSS Yuri page script
    operations: './src/operations/operations.js' // Calendar, Board, Comms Hub script
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  devServer: {
    static: './dist',
  },
  plugins: [
    // Page 1: WISE Headquarters
    new HtmlWebpackPlugin({
      template: './src/index/index.html',
      filename: 'index.html',
      chunks: ['index'],
    }),
    // Page 2: SSS Yuri Bureau
    new HtmlWebpackPlugin({
      template: './src/yuri/yuri.html',
      filename: 'yuri.html',
      chunks: ['yuri'],
    }),
    // Page 3: Central Operations Hub (Calendar, Board, Comms)
    new HtmlWebpackPlugin({
      template: './src/operations/operations.html',
      filename: 'operations.html',
      chunks: ['operations'],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};