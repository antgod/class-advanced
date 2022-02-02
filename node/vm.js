// 用于创建单独虚拟机，隔离执行上下文
// 引入vm模块， 不需要安装，node 自建模块
const vm = require('vm');
const hello = 'yd';
const str = `console.log('${hello}')`;

eval(str);

const func = new Function(str);

func();

vm.runInThisContext(str);

const script = new vm.Script(str);

script.runInThisContext();