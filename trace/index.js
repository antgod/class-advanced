const fs = require('fs');
const path = require('path');
// 转ast
const parser = require('@babel/parser');
// 遍历
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
// 转换
const babel = require('@babel/core');

const TRACE_NAME = 'TRACE_NAME';
// 业务
const {
  collectTraceFragment,
  createInterceptor,
  findParentPath,
  findfunctionName,
} = require('./util/common');

// 获得单个文件的依赖
function getModuleInfo(file) {
  const types = babel.types;
  const template = babel.template;
  const body = fs.readFileSync(file, 'utf-8');
  // 转换ast语法树

  const ast = parser.parse(body, {
    sourceType: 'module',
    plugins: ['jsx'],
    // presets: ["@babel/preset-react"],
  });

  traverse(ast, {
    Program(path) {
      // const code = `import { eventBus } from '@/utils/event'`;
      // const ast = parser.parse(code, {
      //   sourceType: 'module',
      // });
      // const node = ast.program.body[0];
      // path.insertBefore(node);
    },
    ArrowFunctionExpression(path) {
      const a = path.scope.hasBinding("a");
      const b = path.scope.hasBinding("x");

      const x = types.isIdentifier(path.scope.getBinding('a').identifier);
      const y = types.isIdentifier({ name: 'console' });
      // const x = types.isIdentifier(path.scope.getBinding('a').identifier);
    },
    CallExpression(path) {
    },
    // ArrowFunctionExpression(path) {
    //   debugger
    //   const { node } = path;
    //   const params = node.params || [];
    //   const fn = path.parent.id.name;

    //   // 收集初始化参数
    //   params.slice().reverse().forEach(param => {
    //     const { name } = param;
    //     if (name.indexOf(TRACE_NAME) === -1) {
    //       const fragment = collectTraceFragment(TRACE_NAME, name, { types, type: 'params' }, { fn });
    //       node.body.body.unshift(fragment);
    //     }
    //   });
    // },
    // FunctionDeclaration(path) {
    //   const { node } = path;
    //   const { params } = node;
    //   const { name: fn } = node.id || {};
    //   // 收集初始化参数
    //   params.slice().reverse().forEach(param => {
    //     const { name } = param;
    //     if (name.indexOf(TRACE_NAME) === -1) {
    //       const fragment = collectTraceFragment(TRACE_NAME, name, { types, type: 'params' }, { fn });
    //       node.body.body.unshift(fragment);
    //     }
    //   });
    // },
    // BinaryExpression(path) {
    //   const { node } = path;
    //   const { left, right, operator } = node;
    //   const { name: leftName } = left;
    //   const { name: rightName } = right;

    //   console.log('leftName :>> ', leftName, '==o==', operator, '==r==', rightName );

    //   if (leftName && rightName) {
    //     const fragment = collectTraceFragment(TRACE_NAME, leftName, { types, type: operator }, {});
    //     const finalPath = findParentPath(path, {
    //       types: ['ReturnStatement', 'BinaryExpression', 'CallExpression', 'VariableDeclarator', 'MemberExpression', 'JSXExpressionContainer', 'JSXAttribute', 'JSXOpeningElement', 'JSXElement'],
    //     });
    //     if (finalPath) {
    //       finalPath.insertBefore(fragment);
    //     }
    //   }
    // },
    // AssignmentExpression(path) {
    //   const { node } = path;
    //   const { left, right } = node;
    //   const { name } = left;
    //   const { value, name: rightName } = right;

    //   const fragment = collectTraceFragment(TRACE_NAME, name, { types, type: 'assign' },
    //     undefined, { value: rightName || String(value) });
    //   path.insertBefore(fragment);
    // },
    // BlockStatement(path) {
    //   const body = path.get('body');
    //   const functionName = findfunctionName(path);

    //   const { code } = generate(path.node);
    //   debugger
    //   body.forEach((nodePath, index) => {
    //     if (index === 0) {
    //       const fragment = collectTraceFragment('call', functionName, {
    //         types,
    //       });

    //       nodePath.insertBefore(fragment);
    //     }
    //     const { type } = nodePath;
    //     const fragment = collectTraceFragment('return', functionName, {
    //       types,
    //     });
    //     if (type === 'ReturnStatement') {
    //       nodePath.insertBefore(fragment);
    //     } else if (index === body.length - 1) {
    //       nodePath.insertAfter(fragment);
    //     }
    //   });
    // },
    BlockStatement(path) {
      const body = path.get('body');
      console.log('body :>> ', body);
      body.forEach((nodePath, index) => {
        const { type } = nodePath;
        if (type === 'ReturnStatement') {
          const a = types.identifier('ret');
          debugger
          const vd = types.variableDeclaration('const', [types.variableDeclarator(types.identifier('ret'), nodePath.node.argument)])
          nodePath.replaceWith(vd);

          const returnStatement = template('return ret', {
            sourceType: 'module',
          });
          nodePath.insertAfter(returnStatement());
        }
      });
    },
    // VariableDeclaration(path) {
    //   debugger
    //   // const { node } = path;
    //   // const declarations = node.declarations;
    //   // const name = declarations[0]?.id?.name || '';

    //   // if (name.indexOf(TRACE_NAME) === -1) {
    //   //   const fragment = collectTraceFragment(TRACE_NAME, name, { types, type: 'defined' });
    //   //   path.insertAfter(fragment);
    //   // }
    // },
  });

  const { code } = babel.transformFromAst(ast, null, {
    presets: ['@babel/preset-env'],
  });

  fs.writeFileSync(path.resolve(__dirname, './lib/output.js'), code);
}

// Test
getModuleInfo(path.resolve(__dirname, './src/index.js'));
