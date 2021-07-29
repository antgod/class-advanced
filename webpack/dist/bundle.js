(function (graph) {
    function require(file) {
      var { deps, code } = graph[file];

      function absRequire(relPath) {
        return require(deps[relPath])
      }
      var exports = {};
      (function (require, code) {
        eval(code)
      })(absRequire, code)
      return exports
    }
    require('./src/index.js')
  })({"./src/index.js":{"deps":{"./add.js":"src/add.js"},"code":"\"use strict\";\n\nvar _add = _interopRequireDefault(require(\"./add.js\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n\nconsole.log('输出', (0, _add[\"default\"])(3, 3));"},"src/add.js":{"deps":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\n\nvar _default = function _default(a, b) {\n  return a + b;\n};\n\nexports[\"default\"] = _default;"}})