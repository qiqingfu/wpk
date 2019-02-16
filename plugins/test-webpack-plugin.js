class TestWebpackPlugin {
  constructor(options) {
    this.options = options
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('emit', (compilation, callback) => {
      setTimeout(() => {
        console.log('emit')
        console.log(compilation)
        // 通过 callback 再将插件处理后的结果返回给 Webpack编译器
        callback()
      }, 1000)
    })
  }
}

module.exports = TestWebpackPlugin