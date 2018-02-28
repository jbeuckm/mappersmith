'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _retry = require('../../middleware/retry');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_retry).default;
  }
});
Object.defineProperty(exports, 'setRetryConfigs', {
  enumerable: true,
  get: function get() {
    return _retry.setRetryConfigs;
  }
});
Object.defineProperty(exports, 'calculateExponentialRetryTime', {
  enumerable: true,
  get: function get() {
    return _retry.calculateExponentialRetryTime;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }