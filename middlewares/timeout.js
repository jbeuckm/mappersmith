'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _timeout = require('../middleware/timeout');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_timeout).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }