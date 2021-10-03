const { TRACE_NAME, KEY, VALUE, TYPE, PARAMS, PROPS } = require('./constants');

const collectTraceFragment = (trace, value, { types, type }, params = {}, props = {}) => {
  const traceFragment = types.callExpression(
    types.memberExpression(
      types.identifier(trace),
      types.identifier('push')
    ),
    [types.objectExpression([
      types.objectProperty(
        types.identifier(TYPE),
        types.stringLiteral(type),
        false,
        false,
        null
      ),
      types.objectProperty(
        types.identifier(KEY),
        types.stringLiteral(value),
        false,
        false,
        null
      ),
      types.objectProperty(
        types.identifier(VALUE),
        types.identifier(value),
        false,
        false,
        null
      ),
      types.objectProperty(
        types.identifier(PARAMS),
        types.objectExpression(Object.keys(params).map(key => {
          return types.objectProperty(
            types.identifier(key),
            types.stringLiteral(params[key]),
            false,
            false,
            null
          );
        })),
        false,
        false,
        null
      ),
      types.objectProperty(
        types.identifier(PROPS),
        types.objectExpression(Object.keys(props).map(key => {
          return types.objectProperty(
            types.identifier(key),
            types.identifier(props[key]),
            false,
            false,
            null
          );
        })),
        false,
        false,
        null
      ),
    ])]
  )
  return types.expressionStatement(traceFragment);
};

const createInterceptor = ({ types, body }) => {
  return {
    0: (child) => {
      const o = types.arrayExpression([]);
      const collection = types.variableDeclaration('const', [types.variableDeclarator(types.identifier(TRACE_NAME), o)]);
      child.insertBefore(collection);
    },
    [body.length - 1]: (child) => {
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
};

const findParentPath = (path, { types = []}, child = path) => {
  if (!path) {
    return null;
  }

  if (path && !types.includes(path.type)) {
    return child;
  }
  return findParentPath(path.parentPath, { types }, path);
}

const findfunctionName = (path) => {
  const { parentPath } = path;
  if (parentPath.node.id !== null) {
    return parentPath.node.id.name
  } else if (parentPath.parentPath.node.id){
    return parentPath.parentPath.node.id.name;
  }
  return 'test';
}

module.exports = {
  collectTraceFragment,
  createInterceptor,
  findParentPath,
  findfunctionName,
}