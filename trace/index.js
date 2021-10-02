const fs = require('fs');
const path = require('path');
// 转ast
const parser = require('@babel/parser');
// 遍历
const traverse = require('@babel/traverse').default;
// 转换
const babel = require('@babel/core');
// 业务
const { TRACE_PREFIX, TRACE_NAME } = require('./constants');
const { collectTraceFragment } = require('./util/fragment');

const createInterceptor = ({ types }) => {
  return {
    0: () => {
      const o = types.arrayExpression([]);
      const collection = types.variableDeclaration('const', [types.variableDeclarator(types.identifier(TRACE_NAME), o)]);
      child.insertBefore(collection);
    },
    [body.length - 1]: () => {
      const traceFragment = types.callExpression(
        types.memberExpression(
          types.identifier('console'),
          types.identifier('log')
        ),
        [types.identifier(TRACE_NAME)]
      )
      const collection = types.expressionStatement(traceFragment);
      child.insertAfter(collection);
    }
  }
}

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
        const interceptor = createInterceptor({ types });
        if (typeof interceptor[index] === 'function') {
          interceptor[index]();
        }
      })
    },
    ArrowFunctionExpression(path) {
      const { node } = path;
      const params = node.params;
      params.forEach(param => {
        const { name } = param;
        if (name.indexOf(TRACE_NAME) === -1) {
          const fragment = collectTraceFragment(TRACE_NAME, name, { types, path });
          node.body.body.unshift(fragment);
        }
      });
    },

    VariableDeclaration(path) {
      const { node } = path;
      const declarations = node.declarations;
      const name = declarations[0].id.name;

      if (name.indexOf(TRACE_NAME) === -1) {
        const fragment = collectTraceFragment(TRACE_NAME, name, { types, path });
        path.insertAfter(fragment);
      }
    },
    // CallExpression({ node }) {
    // },
  });

  const { code } = babel.transformFromAst(ast, null, {
    presets: ["@babel/preset-env"],
  });

  fs.writeFileSync('./lib/output.js', code);
};

// Test
getModuleInfo('./src/index.js');
