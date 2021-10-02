const KEY = 'key';
const VALUE = 'value';

const collectTraceFragment = (trace, value, { types, path }) => {
  const traceFragment = types.callExpression(
    types.memberExpression(
      types.identifier(trace),
      types.identifier('push')
    ),
    [types.objectExpression([
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
      )
    ])]
  )
  return types.expressionStatement(traceFragment);
}

module.exports = {
  collectTraceFragment,
}