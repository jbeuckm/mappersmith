'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _gateway = require('../gateway');

var _gateway2 = _interopRequireDefault(_gateway);

var _test = require('../test');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Mock(request) {
  _gateway2.default.apply(this, arguments);
}

Mock.prototype = _gateway2.default.extends({
  get: function get() {
    this.callMock();
  },
  head: function head() {
    this.callMock();
  },
  post: function post() {
    this.callMock();
  },
  put: function put() {
    this.callMock();
  },
  patch: function patch() {
    this.callMock();
  },
  delete: function _delete() {
    this.callMock();
  },
  callMock: function callMock(httpMethod) {
    this.dispatchResponse((0, _test.lookupResponse)(this.request));
  }
});

exports.default = Mock;