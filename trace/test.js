const fs = require('fs');
const path = require('path');
// 转ast
const parser = require('@babel/parser');
// 遍历
const traverse = require('@babel/traverse').default;
// 转换
const babel = require('@babel/core');
// 业务
const { TRACE_NAME } = require('./util/constants');
const { collectTraceFragment, createInterceptor, findParentPath } = require('./util/common');

// 获得单个文件的依赖
function getModuleInfo(file) {
  const types = babel.types;
  const body = fs.readFileSync(file, 'utf-8');
  // 转换ast语法树

  const ast = parser.parse(body, {
    sourceType: 'module',
  });

  traverse(ast, {
    BlockStatement(path) {
      const { node } = path;
      const body = path.get('body');
      body.forEach((nodePath, index) => {
        const { type } = nodePath;
        const fragment = collectTraceFragment(TRACE_NAME, findfunName(path), { types, type: 'return' });
        if (type === 'ReturnStatement') {
          nodePath.insertBefore(fragment);
        } else if (index === body.length - 1) {
          nodePath.insertAfter(fragment);
        }
      });
    }
  });

  const { code } = babel.transformFromAst(ast, null, {
    presets: ["@babel/preset-env"],
  });

  fs.writeFileSync(path.resolve(__dirname, './lib/output.js'), code);
};

// Test
getModuleInfo(path.resolve(__dirname, './src/index.js'));
