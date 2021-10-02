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
    Program(path) {
      const body = path.get("body");

      body.forEach((child, index) => {
        const interceptor = createInterceptor({ types, body });
        if (typeof interceptor[index] === 'function') {
          interceptor[index](child);
        }
      })
    },
    ArrowFunctionExpression(path) {
      const { node } = path;
      const params = node.params || [];
      const fn = path.parent.id.name;

      // 收集初始化参数
      params.slice().reverse().forEach(param => {
        const { name } = param;
        if (name.indexOf(TRACE_NAME) === -1) {
          const fragment = collectTraceFragment(TRACE_NAME, name, { types, type: 'params' }, { fn });
          node.body.body.unshift(fragment);
        }
      });
    },
    FunctionDeclaration(path) {
      const { node } = path;
      const { params } = node;
      const { name: fn } = node.id || {};
      // 收集初始化参数
      params.slice().reverse().forEach(param => {
        const { name } = param;
        if (name.indexOf(TRACE_NAME) === -1) {
          const fragment = collectTraceFragment(TRACE_NAME, name, { types, type: 'params' }, { fn });
          node.body.body.unshift(fragment);
        }
      });
    },
    BinaryExpression(path) {
      const { node } = path;
      const { left, right, operator } = node;
      const { name: leftName } = left;
      const { name: rightName } = right;
      const randomNumber = Math.floor(Math.random() * 100) + "";
      if (leftName) {
        const fragment = collectTraceFragment(TRACE_NAME, leftName, { types, type: operator }, { version: randomNumber });
        const finalPath = findParentPath(path, { types: ['ReturnStatement', 'ReturnStatement', 'BinaryExpression', 'CallExpression'] });
        finalPath.insertBefore(fragment);
      }

      if (rightName) {
        const fragment = collectTraceFragment(TRACE_NAME, rightName, { types, type: operator }, { version: randomNumber });
        const finalPath = findParentPath(path, { types: ['ReturnStatement', 'ReturnStatement', 'BinaryExpression', 'CallExpression'] });
        finalPath.insertBefore(fragment);
      }
    },
    AssignmentExpression(path) {
      const { node } = path;
      const { left, right } = node;
      const { name } = left;
      const { value, name: rightName } = right;

      const fragment = collectTraceFragment(TRACE_NAME, name, { types, type: 'assign' }, 
        undefined, { value: rightName || String(value) });
      path.insertBefore(fragment);
    },
    CallExpression(path) {
      const { node } = path;
      const { name, object } = node.callee;
      if (object) {

      } else if (name) {
        const finalPath = findParentPath(path, { types: ['ReturnStatement', 'ReturnStatement', 'BinaryExpression', 'CallExpression'] });
        if (finalPath) {
          const fragment = collectTraceFragment(TRACE_NAME, name, { types, type: 'call' });
          finalPath.insertBefore(fragment);
        }
      }
    },
    // VariableDeclaration(path) {
    //   const { node } = path;
    //   const declarations = node.declarations;
    //   const name = declarations[0]?.id?.name || '';

    //   if (name.indexOf(TRACE_NAME) === -1) {
    //     const fragment = collectTraceFragment(TRACE_NAME, name, { types, type: 'defined' });
    //     path.insertAfter(fragment);
    //   }
    // },
  });

  const { code } = babel.transformFromAst(ast, null, {
    presets: ["@babel/preset-env"],
  });

  fs.writeFileSync(path.resolve(__dirname, './lib/output.js'), code);
};

// Test
getModuleInfo(path.resolve(__dirname, './src/index.js'));
