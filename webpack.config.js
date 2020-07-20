const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin'); // To resolve baseUrl in tsconfig

module.exports = {
  entry: './src/index.ts',
  mode: 'production',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
    plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.json' })]
  },
  output: {
    filename: 'bundle.js',
    library: 'scc',
    libraryTarget: 'var',
    path: path.resolve(__dirname, 'dist'),
  },
};
