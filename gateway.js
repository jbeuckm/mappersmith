'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require('./utils');

var _mappersmith = require('./mappersmith');

var _response = require('./response');

var _response2 = _interopRequireDefault(_response);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Gateway(request) {
  var configs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  this.request = request;
  this.configs = configs;
  this.successCallback = function () {};
  this.failCallback = function () {};
}

Gateway.extends = function (methods) {
  return (0, _utils.assign)({}, Gateway.prototype, methods);
};

Gateway.prototype = {
  options: function options() {
    return this.configs;
  },
  shouldEmulateHTTP: function shouldEmulateHTTP() {
    return this.options().emulateHTTP && /^(delete|put|patch)/i.test(this.request.method());
  },
  call: function call() {
    var _this = this,
        _arguments = arguments;

    var timeStart = (0, _utils.performanceNow)();
    return new _mappersmith.configs.Promise(function (resolve, reject) {
      _this.successCallback = function (response) {
        response.timeElapsed = (0, _utils.performanceNow)() - timeStart;
        resolve(response);
      };

      _this.failCallback = function (response) {
        response.timeElapsed = (0, _utils.performanceNow)() - timeStart;
        reject(response);
      };

      try {
        _this[_this.request.method()].apply(_this, _arguments);
      } catch (e) {
        _this.dispatchClientError(e.message);
      }
    });
  },
  dispatchResponse: function dispatchResponse(response) {
    response.success() ? this.successCallback(response) : this.failCallback(response);
  },
  dispatchClientError: function dispatchClientError(message) {
    this.failCallback(new _response2.default(this.request, 400, message));
  },
  prepareBody: function prepareBody(method, headers) {
    var body = this.request.body();

    if (this.shouldEmulateHTTP()) {
      body = body || {};
      (0, _utils.isPlainObject)(body) && (body._method = method);
      headers['x-http-method-override'] = method;
    }

    var bodyString = (0, _utils.toQueryString)(body);

    if (bodyString) {
      // If it's not simple, let the browser (or the user) set it
      if ((0, _utils.isPlainObject)(body)) {
        headers['content-type'] = 'application/x-www-form-urlencoded;charset=utf-8';
      }
    }

    return bodyString;
  }
};

exports.default = Gateway;