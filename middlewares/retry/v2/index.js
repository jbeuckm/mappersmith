'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _v = require('../../../middleware/retry/v2');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_v).default;
  }
});
Object.defineProperty(exports, 'calculateExponentialRetryTime', {
  enumerable: true,
  get: function get() {
    return _v.calculateExponentialRetryTime;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }