'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _csrf = require('../middleware/csrf');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_csrf).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }