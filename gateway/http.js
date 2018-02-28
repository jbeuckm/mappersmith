'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _utils = require('../utils');

var _gateway = require('../gateway');

var _gateway2 = _interopRequireDefault(_gateway);

var _response = require('../response');

var _response2 = _interopRequireDefault(_response);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function HTTP(request) {
  _gateway2.default.apply(this, arguments);
}

HTTP.prototype = _gateway2.default.extends({
  get: function get() {
    this.performRequest('get');
  },
  head: function head() {
    this.performRequest('head');
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
  performRequest: function performRequest(method) {
    var _this = this;

    var headers = {};
    var defaults = _url2.default.parse(this.request.url());
    var requestMethod = this.shouldEmulateHTTP() ? 'post' : method;
    var body = this.prepareBody(method, headers);
    var timeout = this.request.timeout();

    this.canceled = false;

    if (body && typeof body.length === 'number') {
      headers['content-length'] = Buffer.byteLength(body);
    }

    var handler = defaults.protocol === 'https:' ? _https2.default : _http2.default;

    var requestParams = (0, _utils.assign)(defaults, {
      method: requestMethod,
      headers: (0, _utils.assign)(headers, this.request.headers())
    });

    var auth = this.request.auth();
    if (auth) {
      var username = auth.username || '';
      var password = auth.password || '';
      requestParams['auth'] = username + ':' + password;
    }

    var httpOptions = this.options().HTTP;

    if (httpOptions.configure) {
      (0, _utils.assign)(requestParams, httpOptions.configure(requestParams));
    }

    var httpRequest = handler.request(requestParams, function (httpResponse) {
      return _this.onResponse(httpResponse);
    });

    httpRequest.on('error', function (e) {
      return _this.onError(e);
    });
    body && httpRequest.write(body);

    if (timeout) {
      httpRequest.setTimeout(timeout, function () {
        _this.canceled = true;
        _this.dispatchClientError('Timeout (' + timeout + 'ms)');
      });
    }

    httpRequest.end();
  },
  onResponse: function onResponse(httpResponse) {
    var _this2 = this;

    var rawData = [];

    if (!this.request.isBinary()) {
      httpResponse.setEncoding('utf8');
    }

    httpResponse.on('data', function (chunk) {
      return rawData.push(chunk);
    }).on('end', function () {
      if (_this2.canceled) {
        return;
      }

      _this2.dispatchResponse(_this2.createResponse(httpResponse, rawData));
    });
  },
  onError: function onError(e) {
    if (this.canceled) {
      return;
    }

    this.dispatchClientError(e.message);
  },
  createResponse: function createResponse(httpResponse, rawData) {
    return new _response2.default(this.request, httpResponse.statusCode, this.request.isBinary() ? Buffer.concat(rawData) : rawData.join(''), httpResponse.headers);
  }
});

exports.default = HTTP;