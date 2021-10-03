const add = (num1, num2) => {
  let b;
  b = {};
  return num1 + num2;
}

const mul = (oldNum, newNum) => {
  return oldNum * add(oldNum, newNum);
}

function compute(num1, num2) {
  return mul(num1, num2);
}

const finalFun = compute;

console.log('a :>> ', finalFun(1, 2));
