'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _gateway = require('../gateway');

var _gateway2 = _interopRequireDefault(_gateway);

var _response = require('../response');

var _response2 = _interopRequireDefault(_response);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var toBase64 = window.btoa || _utils.btoa;

function XHR(request) {
  _gateway2.default.apply(this, arguments);
}

XHR.prototype = _gateway2.default.extends({
  get: function get() {
    var xmlHttpRequest = this.createXHR();
    xmlHttpRequest.open('GET', this.request.url(), true);
    this.setHeaders(xmlHttpRequest, {});
    this.configureTimeout(xmlHttpRequest);
    this.configureBinary(xmlHttpRequest);
    xmlHttpRequest.send();
  },
  head: function head() {
    var xmlHttpRequest = this.createXHR();
    xmlHttpRequest.open('HEAD', this.request.url(), true);
    this.setHeaders(xmlHttpRequest, {});
    this.configureTimeout(xmlHttpRequest);
    this.configureBinary(xmlHttpRequest);
    xmlHttpRequest.send();
  },
  post: function post() {
    this.performRequest('post');
  },
  put: function put() {
    this.performRequest('put');
  },
  patch: function patch() {
    this.performRequest('patch');
  },
  delete: function _delete() {
    this.performRequest('delete');
  },
  configureBinary: function configureBinary(xmlHttpRequest) {
    if (this.request.isBinary()) {
      xmlHttpRequest.responseType = 'blob';
    }
  },
  configureTimeout: function configureTimeout(xmlHttpRequest) {
    var _this = this;

    this.canceled = false;
    this.timer = null;

    var timeout = this.request.timeout();

    if (timeout) {
      xmlHttpRequest.timeout = timeout;
      xmlHttpRequest.addEventListener('timeout', function () {
        _this.canceled = true;
        clearTimeout(_this.timer);
        _this.dispatchClientError('Timeout (' + timeout + 'ms)');
      });

      // PhantomJS doesn't support timeout for XMLHttpRequest
      this.timer = setTimeout(function () {
        _this.canceled = true;
        _this.dispatchClientError('Timeout (' + timeout + 'ms)');
      }, timeout + 1);
    }
  },
  configureCallbacks: function configureCallbacks(xmlHttpRequest) {
    var _this2 = this;

    xmlHttpRequest.addEventListener('load', function () {
      if (_this2.canceled) {
        return;
      }

      clearTimeout(_this2.timer);
      _this2.dispatchResponse(_this2.createResponse(xmlHttpRequest));
    });

    xmlHttpRequest.addEventListener('error', function () {
      if (_this2.canceled) {
        return;
      }

      clearTimeout(_this2.timer);
      _this2.dispatchClientError('Network error');
    });

    var xhrOptions = this.options().XHR;
    if (xhrOptions.withCredentials) {
      xmlHttpRequest.withCredentials = true;
    }

    if (xhrOptions.configure) {
      xhrOptions.configure(xmlHttpRequest);
    }
  },
  performRequest: function performRequest(method) {
    var requestMethod = this.shouldEmulateHTTP() ? 'post' : method;
    var xmlHttpRequest = this.createXHR();
    xmlHttpRequest.open(requestMethod.toUpperCase(), this.request.url(), true);

    var customHeaders = {};
    var body = this.prepareBody(method, customHeaders);
    this.setHeaders(xmlHttpRequest, customHeaders);
    this.configureTimeout(xmlHttpRequest);
    this.configureBinary(xmlHttpRequest);

    var args = [];
    body && args.push(body);

    xmlHttpRequest.send.apply(xmlHttpRequest, args);
  },
  createResponse: function createResponse(xmlHttpRequest) {
    var status = xmlHttpRequest.status;
    var data = this.request.isBinary() ? xmlHttpRequest.response : xmlHttpRequest.responseText;
    var responseHeaders = (0, _utils.parseResponseHeaders)(xmlHttpRequest.getAllResponseHeaders());
    return new _response2.default(this.request, status, data, responseHeaders);
  },
  setHeaders: function setHeaders(xmlHttpRequest, customHeaders) {
    var auth = this.request.auth();
    if (auth) {
      var username = auth.username || '';
      var password = auth.password || '';
      customHeaders['authorization'] = 'Basic ' + toBase64(username + ':' + password);
    }

    var headers = (0, _utils.assign)(customHeaders, this.request.headers());
    Object.keys(headers).forEach(function (headerName) {
      xmlHttpRequest.setRequestHeader(headerName, headers[headerName]);
    });
  },
  createXHR: function createXHR() {
    var xmlHttpRequest = new XMLHttpRequest(); // eslint-disable-line no-undef
    this.configureCallbacks(xmlHttpRequest);
    return xmlHttpRequest;
  }
});

exports.default = XHR;