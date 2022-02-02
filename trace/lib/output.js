"use strict";

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var Home = function Home() {
  var a = 1;
  var b = 2;
  var ret = <Tag key={a} color={PROJECT_COLOR[(a + b) % 4]}>
      1
    </Tag>;
  return ret;
};

Home();