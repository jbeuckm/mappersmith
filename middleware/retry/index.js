'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _v = require('./v1');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_v).default;
  }
});
Object.defineProperty(exports, 'setRetryConfigs', {
  enumerable: true,
  get: function get() {
    return _v.setRetryConfigs;
  }
});
Object.defineProperty(exports, 'calculateExponentialRetryTime', {
  enumerable: true,
  get: function get() {
    return _v.calculateExponentialRetryTime;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }