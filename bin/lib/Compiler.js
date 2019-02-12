const path = require('path')
const fs = require('fs')

/**
 * babylon 将源码转换成ast
 * @babel/traverse
 * @babel/types
 * @babel/generator
 */

class Compiler {
  constructor(config) {
    this.config = config,
    // 需要保存入口文件的路径
    this.entryId,
    // 需要保存所有的模块依赖
    this.modules = {},
    this.entry = config.entry,  
    this.root = path.resolve(process.cwd(), '..')  //当前工作目录
  }

  run() {
    // 执行, 并创建模块的依赖关系 入口文件的绝对路径
    this.buildModule(path.resolve(this.root, this.entry), true)

    // 产出打包后的文件
    this.emitFile()
  }

  // 获取源码
  getSource(modulePath) {
    return fs.readFileSync(modulePath, 'utf-8')
  }

  // 解析 source 源码
  parse(source, parentPath) {
    
  }

  buildModule(modulePath, isEntry) {
    // 读取入口文件的内容
    const source = this.getSource(modulePath)
    // 拿到模块的相对路径,作为 moduleId
    const moduleName = './' + path.relative(this.root, modulePath)
    if (isEntry) {
      this.entryId = moduleName
    }

    // 解析需要把 source 源码进行改造,返回一个依赖列表
    const {
      sourceCode,
      dependencies
    } = this.parse(source, path.dirname(moduleName))

    this.modules[moduleName] = sourceCode
  }

  emitFile() {

  }
}

module.exports = Compiler