/**
 *  手写 webpack 解析入口文件
 */

const path = require('path')

const config = require('../webpack.config')

if (!config) {
  throw new Error('webpack.config.js not found')
}

const Compiler = require('./lib/Compiler.js')
const compiler = new Compiler(config)

compiler.run()