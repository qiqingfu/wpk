const path = require('path')
const fs = require('fs')
const babylon = require('babylon')
const traverse = require('@babel/traverse').default
const generator = require('@babel/generator').default
const types = require('@babel/types')
const ejs = require('ejs')
const {
  SyncHook,
  SyncBailHook,
  AsyncSeriesHook
} = require('tapable')

const {
  isObject
} = require('./util')


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
    this.root = path.resolve(process.cwd(), '..'),  //当前工作目录
    this.compilation = {name: '编译器对象'}
    this.hooks = {
      entryOption: new SyncBailHook('entryOption'),
      afterPlugins: new SyncHook('afterPlugins'),
      afterResolvers: new SyncHook('afterResolvers'),
      beforeRun: new AsyncSeriesHook(['beforeRun']),
      run: new AsyncSeriesHook(['run']),
      beforeCompile: new AsyncSeriesHook(['beforeCompile']),
      compile: new SyncHook('compile'),
      afterCompile: new AsyncSeriesHook(['afterCompile']),
      emit: new AsyncSeriesHook(['emit']), // 在输出打包结果触发的钩子
      afterEmit: new AsyncSeriesHook(['afterEmit']),
      done: new AsyncSeriesHook(['done']), //  编译完成触发的钩子
      failed: new SyncHook('failed'), // 编译失败
    },
    this.plugins = config.plugins
    
    /**
     * 在 安装插件时, Webpack编译器会调用插件实例的 apply方法一次
     * 并且将 Webpack所有的环境配置信息传递作为参数传递给插件 
     * 所以, 在编写一个插件类时, 原型对象上一个要定义 apply方法
     */
    if (Array.isArray(this.plugins) && this.plugins.length > 0) {
      let plugins = this.plugins
      
      plugins.forEach(plugin => {
        // Is it a plugin available?
        if (
          isObject(plugin) &&
          Reflect.has(Reflect.getPrototypeOf(plugin), 'apply')
        ) {
          plugin.apply(this)
        }
        else {
          console.log(`Error: 
          ${ plugin.__proto__.constructor } **** Not an object or no definition apply ****`)
        }
      })
    } else {
      // no plugins
      // console.log('no plugins..')
    }
  }

  run() {
    // 执行, 并创建模块的依赖关系 入口文件的绝对路径
    this.buildModule(path.resolve(this.root, this.entry), true)
    // 产出打包后的文件
    this.emitFile()
  }

  // 根据相对路径, fs读取文件的源代码
  getSource(modulePath) {
    let source = fs.readFileSync(modulePath, 'utf-8')
    
    // 使用 loader 转换源码
    const module = this.config.module || null
    if (module && isObject(module)) {
      if (Reflect.has(module, 'rules')) {
        let rules = module.rules
        for (let rule of rules) {
          let {test, use:usesLoaderPath} = rule
          if (test.test(modulePath)) {
            usesLoaderPath = usesLoaderPath.reverse()
            usesLoaderPath.forEach(loaderPath => {
              let loader = require(loaderPath)
              source = loader(source)
            })
          }
        }
      }
    }
    return source
  }

  // 解析 source 源码
  parse(source, parentPath) {
    const ast = babylon.parse(source)
    const dependencies = []  // 保存依赖的数组
    const that = this

    traverse(ast, {
      CallExpression(p) {
        let node = p.node
        if (node.callee.name === 'require') {
           // 改写 Identifier类型的name
           node.callee.name = '__webpack_require__'
           let moduleName = node.arguments[0].value

           // 为 moduleName 检测后缀名
           moduleName = moduleName + (path.extname(moduleName) ? '' : '.js')
           moduleName = './' + path.join(parentPath, moduleName)
           dependencies.push(moduleName)
           
           node.arguments = [types.stringLiteral(moduleName)]
        }
      }
    })

    // 将 ast数生成代码串
    const sourceCode = generator(ast).code
    return {
      sourceCode,
      dependencies
    }
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

    // 递归解析依赖项
    if (dependencies.length > 0) {
      dependencies.forEach(dep => {
        this.buildModule(path.join(this.root, dep), false)
      })
    }
  }

  emitFile() {
    // 将缓存的数据投射到模版文件,并输出文件
    if (this.config.output && !isObject(this.config.output)) {
      throw new Error('output is not object')
    }
    let output = this.config.output
    if (!Reflect.has(output, 'path')) {
      throw new Error('path 是必填项')
    }
    if (!Reflect.has(output, 'filename')) {
      output['filename'] = 'app.js'
    }
    
    // 输出的路径
    const outPath = path.join(output.path, output.filename)
    const template = this.getSource(path.resolve(__dirname, '..', 'index.ejs'))
    
    // ejs 渲染
    const code = ejs.render(template, {entryId: this.entryId, modules: this.modules})
    this.assets = {}
    this.assets[outPath] = code

    const dirPath = path.resolve(this.root, output.path)
    fs.exists(dirPath, exists => {
      if (!exists) {
        fs.mkdirSync(dirPath)
      }

      // 注册钩子 
      console.time('emitTime')
      this.hooks.emit.callAsync(this.compilation, () => {
        console.log('插件执行结束')
        console.timeEnd('emitTime')
      })

      fs.writeFileSync(outPath, this.assets[outPath])  
    })
  }
}

module.exports = Compiler