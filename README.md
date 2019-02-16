## wpk 简易的 webpack 模块打包 

 - 模块引用解析
 - 简单的loader解析 
 - 简单的plugin解析

## Test 

```
	git clone 
	npm install
	cd bin 
	node webpack-cli
``` 

## Hook 
Webpack 编译时的钩子类, 应用 `tapable`核心库实现发布订阅模式。  

```javascript
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
```

## Realization
