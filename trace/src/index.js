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

console.log('a :>> ', compute(1, 2));
