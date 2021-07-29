const fs = require('fs');
const path = require('path');
// 转ast
const parser = require('@babel/parser');
// 遍历
const traverse = require('@babel/traverse').default;
// 转换
const babel = require('@babel/core');

// 获得单个文件的依赖
function getModuleInfo(file) {
  const body = fs.readFileSync(file, 'utf-8');
  // 转换ast语法树

  const ast = parser.parse(body, {
    sourceType: 'module',
  });

  const deps = {};

  traverse(ast, {
    ImportDeclaration({ node }) {
      // 当前入口文件目录
      const dirname = path.dirname(file);
      // 依赖文件路径
      const depPath = node.source.value;
      // 计算依赖文件与webpack执行文件的相对路径
      const absPath = path.join(dirname, depPath);
      deps[depPath] = absPath;
    },
  });

  const { code } = babel.transformFromAst(ast, null, {
    presets: ["@babel/preset-env"],
  });

  return {
    file,
    deps,
    code,
  };
}

// Test
// const info = getModuleInfo('./src/index.js');
// console.log('info :>> ', info);

// 依赖收集
const collectDeps = (() => {
  const depsGraph = {};
  const collectDeps = (filePath) => {
    const moduleInfo = getModuleInfo(filePath);
    const { file, deps, code } = moduleInfo;
  
    depsGraph[file] = {
      deps,
      code,
    };
  
    Object.keys(deps).map(key => {
      const depAbsPath = deps[key];
      collectDeps(depAbsPath);
    });
    return depsGraph;
  }
  return collectDeps;
})();

// Test
// const depsGraph = collectDeps('./src/index.js')
// console.log('object :>> ', depsGraph); 

// 计算bundle内容
function computeBundleContent(file) {
  const depsGraph = JSON.stringify(collectDeps(file));
  return `(function (graph) {
    function require(file) {
      var { deps, code } = graph[file];

      function absRequire(relPath) {
        return require(deps[relPath])
      }
      var exports = {};
      (function (require, code) {
        eval(code)
      })(absRequire, code);
      
      return exports
    }
    require('${file}')
  })(${depsGraph})`;
}

// 打bundle
function bundle(entry, output) {
  const bundleContent = computeBundleContent(entry);
  const dir = path.dirname(output);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  fs.writeFileSync(output, bundleContent);
}

// Test
bundle('./src/index.js', './dist/bundle.js');