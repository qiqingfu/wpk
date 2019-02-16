const path = require('path')
const TextWebpackPlugin = require('./plugins/test-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js'
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          path.resolve(__dirname, 'loaders', 'style-loader.js'),
          path.resolve(__dirname, 'loaders', 'less-loader.js')
        ]
      }
    ]
  },
  plugins: [
    new TextWebpackPlugin()
  ]
}