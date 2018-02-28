'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _log = require('../middleware/log');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_log).default;
  }
});
Object.defineProperty(exports, 'defaultSuccessLogger', {
  enumerable: true,
  get: function get() {
    return _log.defaultSuccessLogger;
  }
});
Object.defineProperty(exports, 'defaultErrorLogger', {
  enumerable: true,
  get: function get() {
    return _log.defaultErrorLogger;
  }
});
Object.defineProperty(exports, 'setSuccessLogger', {
  enumerable: true,
  get: function get() {
    return _log.setSuccessLogger;
  }
});
Object.defineProperty(exports, 'setErrorLogger', {
  enumerable: true,
  get: function get() {
    return _log.setErrorLogger;
  }
});
Object.defineProperty(exports, 'setLoggerEnabled', {
  enumerable: true,
  get: function get() {
    return _log.setLoggerEnabled;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }