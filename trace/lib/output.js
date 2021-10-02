"use strict";

var my_trace = [];

var add = function add(num1, num2) {
  my_trace.push({
    key: "num2",
    value: num2
  });
  my_trace.push({
    key: "num1",
    value: num1
  });
  return num1 + num2;
};

my_trace.push({
  key: "add",
  value: add
});
console.log('a :>> ', add(1, 2));
console.log(my_trace);