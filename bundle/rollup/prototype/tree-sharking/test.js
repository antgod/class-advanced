const bundle = require('./index');

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

console.log('========最终生成代码========');
console.log(bundle(codes));
