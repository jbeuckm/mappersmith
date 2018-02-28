'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _globalErrorHandler = require('../middleware/global-error-handler');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_globalErrorHandler).default;
  }
});
Object.defineProperty(exports, 'setErrorHandler', {
  enumerable: true,
  get: function get() {
    return _globalErrorHandler.setErrorHandler;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }