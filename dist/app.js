(function(modules) { // webpackBootstrap
 	var installedModules = {};
 	function __webpack_require__(moduleId) {
 		if(installedModules[moduleId]) {
 			return installedModules[moduleId].exports;
 		}
 		var module = installedModules[moduleId] = {
 			i: moduleId,
 			l: false,
 			exports: {}
 		};
 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
 		module.l = true;
  
 		return module.exports;
 	}
 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
 })

 ({
 
  "./src/index.js":
(function(module, exports, __webpack_require__) {
  eval(`// 入口文件
const a = __webpack_require__("./src/common/a.js");

__webpack_require__("./src/style/index.less");

console.log(a);`);
  }),
  
  "./src/common/a.js":
(function(module, exports, __webpack_require__) {
  eval(`const b = __webpack_require__("./src/common/b.js");

module.exports = 'a' + b;`);
  }),
  
  "./src/common/b.js":
(function(module, exports, __webpack_require__) {
  eval(`module.exports = 'b';`);
  }),
  
  "./src/style/index.less":
(function(module, exports, __webpack_require__) {
  eval(`let style = document.createElement('style');
style.innerHTML = "body {\\n  background-color: #858585;\\n}\\n";
document.head.appendChild(style);`);
  }),
  
 });