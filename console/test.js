// https://www.toutiao.com/a7004990643898532384/?log_from=93f902670723a8_1631507750728

// 变量的正确打印方法
const variableX = 42;
console.log({ variableX }); // { variableX: 42 }

// 其他打印
console.warn('this is an warn message');
console.debug('nothing to see here - please move along');
console.error('I\'m sorry Dave, I\'m afraid I can\'t do that');
const obj = {
  propA: 1,
  propB: 2,
  propC: 3
};

// 打印对象
console.table( obj );

// 占位符
console.log(
  'The answer to %s is %d.',
  'life, the universe and everything',
  42
);

// 风格
console.log(
  '%cOK, things are really bad now!',
  `
  font-size: 2em;
  padding: 0.5em 2em;
  margin: 1em 0;
  color: yellow;
  background-color: red;
  border-radius: 50%;
  `
);

// 分组

// 查看事件绑定
getEventListeners(document.body)

// 复制
copy( document.documentElement )

// 分组
console.group('iloop');

for (let i = 3; i > 0; i--) {

  console.log(i);

  // start collapsed log group
  console.groupCollapsed('jloop');

  for (let j = 97; j < 100; j++) {
    console.log(j);
  }

  // end log group (jloop)
  console.groupEnd();
}

// 调试函数与监控函数运行参数
function say(name) { 
  console.log({ name })
}

monitor(say)
debug(say)