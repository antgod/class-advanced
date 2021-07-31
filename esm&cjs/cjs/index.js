const code = `
var counter = 3;
function incCounter() {
  counter++;
};

exports.default = {
  counter: counter,
  incCounter: incCounter,
};
`;

function require(code) {
  let exports = {};
  (function(exports, code) {
    eval(code);
  })(exports, code);
  return exports;
}

var mod = require(code).default;

console.log('counter', mod.counter); // 3
mod.incCounter();
console.log('counter', mod.counter); // 3
