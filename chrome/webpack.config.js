const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    content: ['regenerator-runtime/runtime.js', path.resolve(__dirname, './src/content/index.js')],
    background: ['regenerator-runtime/runtime.js', path.resolve(__dirname, './src/background/index.js')],
  },
  devtool: 'inline-source-map',
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'build'),
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
      {
        test: /\.svg$/,
        type: 'asset/inline',
      },
      {
        test: /\.webp$/,
        type: 'asset/inline',
      },
      {
        test: /\.png$/,
        type: 'asset/inline',
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'chrome/public/manifest.json', to: 'manifest.json' },
        { from: 'chrome/public/options.js', to: 'options.js' },
        { from: 'assets/options.html', to: 'options.html' },
        { from: 'assets/output.css', to: 'styles.css' },
        { from: 'assets/res/logo-16.png', to: 'logo-16.png' },
        { from: 'assets/res/logo-32.png', to: 'logo-32.png' },
        { from: 'assets/res/logo-48.png', to: 'logo-48.png' },
        { from: 'assets/res/logo-128.png', to: 'logo-128.png' },
      ],
    }),
    new CleanWebpackPlugin(),
  ],
};
