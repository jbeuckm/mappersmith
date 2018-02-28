'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _encodeJson = require('../middleware/encode-json');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_encodeJson).default;
  }
});
Object.defineProperty(exports, 'CONTENT_TYPE_JSON', {
  enumerable: true,
  get: function get() {
    return _encodeJson.CONTENT_TYPE_JSON;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }