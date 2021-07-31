(function (graph) {
    function require(file) {
      var { deps, code } = graph[file];

      function absRequire(relPath) {
        console.log('入口文件', file, '依赖文件', relPath, '依赖列表', deps);
        // ./src/index.js {./add.js: "src/add.js", ./reduce.js: "src/reduce.js"} ./add.js
        // 确保require执行时，返回依赖文件的exports
        return require(deps[relPath])
      }
      var exports = {};
      (function (require, code) {
        // 第一次执行入口处: index.js代码，执行require时，递归调用require函数。
        eval(code);
      })(absRequire, code);
      
      // require函数返回依赖文件的exports。
      return exports
    }

    // 1. 传入入口处代码
    require('./src/index.js')
  })({"./src/index.js":{"deps":{"./add.js":"src/add.js","./reduce.js":"src/reduce.js"},"code":"\"use strict\";\n\nvar _add = _interopRequireDefault(require(\"./add.js\"));\n\nvar _reduce = _interopRequireDefault(require(\"./reduce.js\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n\nconsole.log('3 + 3', (0, _add[\"default\"])(3, 3));\nconsole.log('3 - 3', (0, _reduce[\"default\"])(3, 3));"},"src/add.js":{"deps":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\n\nvar _default = function _default(a, b) {\n  return a + b;\n};\n\nexports[\"default\"] = _default;"},"src/reduce.js":{"deps":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\n\nvar _default = function _default(num1, num2) {\n  return num1 - num2;\n};\n\nexports[\"default\"] = _default;"}})