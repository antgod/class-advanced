const acorn = require("acorn");
const MagicString = require("magic-string");
const walk = require("../../lib/ast/walk");
const Scope = require("../../lib/ast/scope");

const IGNORE_GLOBAL_DEPS = ['console', 'log'];

/**
 * 获取AST
 */
function getAst(code) {
  return acorn.parse(code, {
    locations: true, // 索引位置
    ranges: true,
    sourceType: "module",
    ecmaVersion: 7,
  });
}

/**
 * 批量获取AST，并注入源码
 */
function getAsts(codes) {
  return Object.keys(codes).reduce((last, key) => {
    const code = codes[key];
    return { ...last, [key]: {
      ...getAst(code),
      code,
    }};
  }, {});
}

/**
 * 分析AST节点的声明与依赖
 */
function analyse(ast, declarations) {
  // 创建全局作用域
  let scope = new Scope();

  // 遍历当前语法树
  ast.body.forEach((statement) => {
    /**
     * 给作用域内添加变量
     * @param {*} declaration
     */
    function addToScope(declaration) {
      var name = declaration.id.name; // 获取声明的变量名：add
      scope.add(name);
      if (!scope.parent) {
        statement._defines = statement._defines || {};
        statement._defines[name] = true;
      }
    }

    // 作用域链遍历
    // 分析变量定义的
    // 构造作用域链
    walk(statement, {
      enter(node) {
        // 防止空节点和空数组
        if (node === null || node.length === 0) return;
        switch (node.type) {
          // 变量声明
          case "VariableDeclaration":
            // 增加声明
            declarations.push({
              ...node,
              code: ast.code,
              defines: node.declarations.map(declaration => declaration.id.name),
            });
            node.declarations.forEach(addToScope);
            break;
        }
      },
      leave(node) {
        if (node._scope) {
          // 如果此节点离开退回父作用域
          scope = scope.parent;
        }
      },
    });
  });

  ast._scope = scope;

  // 找出外部依赖关系 dependsOn
  ast.body.forEach((statement) => {
    walk(statement, {
      enter(node) {
        if (node._scope) {
          scope = node._scope;
        }
        // 建议性bug_fix，这里过滤掉全局依赖，全局的依赖不要放到depandsOn，否则查找依赖时，会有过滤的麻烦。
        if (node.type === "Identifier" && IGNORE_GLOBAL_DEPS.indexOf(node.name) === -1) {
          // 向上递归
          const definingScope = scope.findDefiningScope(node.name);
          if (!definingScope) {
            statement.dependsOn = statement.dependsOn || [];
            statement.dependsOn.push(node.name);
          }
        }
      },

      leave(node) {
        if (node._scope) scope = scope.parent;
      },
    });
  });
}

/**
 * 组合全部代码片段
 */
function expandAllStatements(ast, declarations) {
  const allStatements = [];
  ast.body.forEach((statement) => {
    // 忽略所有Import语句
    if (statement.type === "ImportDeclaration") {
      return;
    }

    /* Done：Bug1！！:  
    input:
        const codes = {
        index: `
          import { add } from "./add.js";
          console.log(add(2, 4));
          console.log(add1(2, 4));
        `,
        add: `
          export const add = (a, b) => a + b
          export const add1 = (a, b) => a + b
        `,
      };
    out:
      const add = (a, b) => a + b
      const add1 = (a, b) => a + b
      console.log(add(2, 4));
      const add = (a, b) => a + b
      const add1 = (a, b) => a + b
      console.log(add1(2, 4));

    bug_fix:
     declarations是全部依赖声明，所以必须对当前表达式依赖做过滤。修改后正常
    */ 
    const currentDeclaration = declarations.filter(declarations => declarations.defines.indexOf(statement.dependsOn[0]) > -1)
    allStatements.push(
      ...currentDeclaration, 
      { ...statement, code: ast.code },
    );
  });

  return allStatements;
}

/**
 * 把AST代码片段转成编译后源码
 */
function generate(statments) {
   /* Done：Bug2！！:  
    源代码写死了statments与文件的关系，而这种关系不应该写死。否则 generate里的代码会随着输入的代码经常改动。
      let v = statments[0]
      console.log(new MagicString(code.add).snip(v.start, v.end).toString())
      v = statments[1]
      console.log(new MagicString(code.index).snip(v.start, v.end).toString())
    
    bug_fix:
     我在每个statment里注入了源码code，代码如下：
    
      function getAsts(codes) {
        return Object.keys(codes).reduce((last, key) => {
          const code = codes[key];
          return { ...last, [key]: {
            ...getAst(code),
            code,
          }};
        }, {});
      }

     这样，我的statment就可以和源码文件建立映射关系，而不是写死statments[0] 与 code.add的关系

    */ 
  const finalCodes = statments.map(statment => 
    new MagicString(statment.code).snip(statment.start, statment.end).toString(),
  ).join('\n');

  return finalCodes;
}

// 全部打包过程
function bundle(codes) {
  // Parse阶段，生成ast
  const codeAsts = getAsts(codes);

  // 声明
  const declarations = [];

  // Transfer阶段，依次分析每个模块的声明与依赖关系
  Object.keys(codeAsts).forEach(codeAst => {
    analyse(codeAsts[codeAst], declarations);
  });

  const entry = codeAsts.index;

  // 输入入口
  const statments = expandAllStatements(entry, declarations);
  return generate(statments);
}

module.exports = bundle;
