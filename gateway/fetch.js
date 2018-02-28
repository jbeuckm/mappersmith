'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _gateway = require('../gateway');

var _gateway2 = _interopRequireDefault(_gateway);

var _response = require('../response');

var _response2 = _interopRequireDefault(_response);

var _mappersmith = require('../mappersmith');

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fetch = _mappersmith.configs.fetch;
// Fetch can be used in nodejs, so it should always use the btoa util


if (!fetch) {
  throw new Error('[Mappersmith] global fetch does not exist, please assign "configs.fetch" to a valid implementation');
}

/**
 * Gateway which uses the "fetch" implementation configured in "configs.fetch".
 * By default "configs.fetch" will receive the global fetch, this gateway doesn't
 * use browser specific code, with a proper "fetch" implementation it can also be
 * used with node.js
 */
function Fetch(request) {
  _gateway2.default.apply(this, arguments);
}

Fetch.prototype = _gateway2.default.extends({
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

    var customHeaders = {};
    var body = this.prepareBody(method, customHeaders);
    var auth = this.request.auth();

    if (auth) {
      var username = auth.username || '';
      var password = auth.password || '';
      customHeaders['authorization'] = 'Basic ' + (0, _utils.btoa)(username + ':' + password);
    }

    var headers = (0, _utils.assign)(customHeaders, this.request.headers());
    var requestMethod = this.shouldEmulateHTTP() ? 'post' : method;
    var init = (0, _utils.assign)({ method: requestMethod, headers: headers, body: body }, this.options());
    var timeout = this.request.timeout();

    var timer = null;
    var canceled = false;

    if (timeout) {
      timer = setTimeout(function () {
        canceled = true;
        _this.dispatchClientError('Timeout (' + timeout + 'ms)');
      }, timeout);
    }

    fetch(this.request.url(), init).then(function (fetchResponse) {
      if (canceled) {
        return;
      }

      clearTimeout(timer);

      var responseData = void 0;
      if (_this.request.isBinary()) {
        if (typeof fetchResponse.buffer === 'function') {
          responseData = fetchResponse.buffer();
        } else {
          responseData = fetchResponse.arrayBuffer();
        }
      } else {
        responseData = fetchResponse.text();
      }

      responseData.then(function (data) {
        _this.dispatchResponse(_this.createResponse(fetchResponse, data));
      });
    }).catch(function (error) {
      if (canceled) {
        return;
      }

      clearTimeout(timer);
      _this.dispatchClientError(error.message);
    });
  },
  createResponse: function createResponse(fetchResponse, data) {
    var status = fetchResponse.status;
    var responseHeaders = {};
    fetchResponse.headers.forEach(function (value, key) {
      responseHeaders[key] = value;
    });

    return new _response2.default(this.request, status, data, responseHeaders);
  }
});

exports.default = Fetch;