'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mockAssert = require('./mock-assert');

var _mockAssert2 = _interopRequireDefault(_mockAssert);

var _response = require('../response');

var _response2 = _interopRequireDefault(_response);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @param {number} id
 * @param {object} props
 *   @param {string} props.method
 *   @param {string|function} props.url
 *   @param {string|function} props.body - request body
 *   @param {object} props.response
 *     @param {string} props.response.body
 *     @param {object} props.response.headers
 *     @param {integer} props.response.status
 */
function MockRequest(id, props) {
  this.id = id;

  this.method = props.method || 'get';
  this.urlFunction = typeof props.url === 'function';
  this.url = props.url;
  this.bodyFunction = typeof props.body === 'function';
  this.body = this.bodyFunction ? props.body : (0, _utils.toQueryString)(props.body);
  this.responseData = props.response.body;
  this.responseHeaders = props.response.headers || {};
  this.responseStatus = props.response.status || 200;

  this.calls = [];

  if ((0, _utils.isPlainObject)(this.responseData)) {
    this.responseData = JSON.stringify(this.responseData);
    if (!this.responseHeaders['content-type']) {
      this.responseHeaders['content-type'] = 'application/json';
    }
  }
}

MockRequest.prototype = {
  /**
   * @return {Response}
   */
  call: function call(request) {
    this.calls.push(request);
    return new _response2.default(request, this.responseStatus, this.responseData, this.responseHeaders);
  },


  /**
   * @return {MockAssert}
   */
  assertObject: function assertObject() {
    return new _mockAssert2.default(this.calls);
  },


  /**
   * Checks if the request matches with the mock HTTP method, URL and body
   *
   * @return {boolean}
   */
  isExactMatch: function isExactMatch(request) {
    var bodyMatch = this.bodyFunction ? this.body(request.body()) : this.body === (0, _utils.toQueryString)(request.body());

    var urlMatch = this.urlFunction ? this.url(request.url(), request.params()) : this.url === request.url();

    return this.method === request.method() && urlMatch && bodyMatch;
  },


  /**
   * Checks if the request partially matches the mock HTTP method and URL
   *
   * @return {boolean}
   */
  isPartialMatch: function isPartialMatch(request) {
    return new RegExp(this.method).test(request.method()) && new RegExp(this.url).test(request.url());
  },


  /**
   * @return {MockRequest}
   */
  toMockRequest: function toMockRequest() {
    return this;
  }
};

exports.default = MockRequest;