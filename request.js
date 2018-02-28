'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require('./utils');

var REGEXP_DYNAMIC_SEGMENT = new RegExp('{([^}]+)}');

/**
 * @typedef Request
 * @param {MethodDescriptor} methodDescriptor
 * @param {Object} requestParams, defaults to an empty object ({})
 */
function Request(methodDescriptor, requestParams) {
  this.methodDescriptor = methodDescriptor;
  this.requestParams = requestParams || {};
}

Request.prototype = {
  timeline: function timeline() {
    return this.requestParams._timeline;
  },


  /**
   * @return {Object}
   */
  params: function params() {
    var _this = this;

    var params = (0, _utils.assign)({}, this.methodDescriptor.params, this.requestParams);

    var isParam = function isParam(key) {
      return key !== _this.methodDescriptor.headersAttr && key !== _this.methodDescriptor.bodyAttr && key !== _this.methodDescriptor.authAttr && key !== _this.methodDescriptor.timeoutAttr && key !== '_timeline';
    };

    return Object.keys(params).reduce(function (obj, key) {
      if (isParam(key)) {
        obj[key] = params[key];
      }
      return obj;
    }, {});
  },


  /**
   * Returns the HTTP method in lowercase
   *
   * @return {String}
   */
  method: function method() {
    return this.methodDescriptor.method.toLowerCase();
  },


  /**
   * Returns host name without trailing slash
   * Example: http://example.org
   *
   * @return {String}
   */
  host: function host() {
    return (this.methodDescriptor.host || '').replace(/\/$/, '');
  },


  /**
   * Returns path with parameters and leading slash.
   * Example: /some/path?param1=true
   *
   * @throws {Error} if any dynamic segment is missing.
   * Example:
   * Imagine the path '/some/{name}', the error will be similar to:
   * '[Mappersmith] required parameter missing (name), "/some/{name}" cannot be resolved'
   *
   * @return {String}
   */
  path: function path() {
    var path = this.methodDescriptor.path;

    if (this.methodDescriptor.path[0] !== '/') {
      path = '/' + this.methodDescriptor.path;
    }

    var params = this.params();
    Object.keys(params).forEach(function (key) {
      var value = params[key];
      var pattern = '{' + key + '}';

      if (new RegExp(pattern).test(path)) {
        path = path.replace('{' + key + '}', value);
        delete params[key];
      }
    });

    var missingDynamicSegmentMatch = path.match(REGEXP_DYNAMIC_SEGMENT);
    if (missingDynamicSegmentMatch) {
      throw new Error('[Mappersmith] required parameter missing (' + missingDynamicSegmentMatch[1] + '), "' + path + '" cannot be resolved');
    }

    var queryString = (0, _utils.toQueryString)(params);
    if (queryString.length !== 0) {
      path += '?' + queryString;
    }

    return path;
  },


  /**
   * Returns the full URL
   * Example: http://example.org/some/path?param1=true
   *
   * @return {String}
   */
  url: function url() {
    return '' + this.host() + this.path();
  },


  /**
   * Returns an object with the headers. Header names are converted to
   * lowercase
   *
   * @return {Object}
   */
  headers: function headers() {
    return (0, _utils.lowerCaseObjectKeys)((0, _utils.assign)({}, this.methodDescriptor.headers, this.requestParams[this.methodDescriptor.headersAttr]));
  },
  body: function body() {
    return this.requestParams[this.methodDescriptor.bodyAttr];
  },
  auth: function auth() {
    return this.requestParams[this.methodDescriptor.authAttr];
  },
  timeout: function timeout() {
    return this.requestParams[this.methodDescriptor.timeoutAttr];
  },


  /**
   * Enhances current request returning a new Request
   * @param {Object} extras
   *   @param {Object} extras.params - it will be merged with current params
   *   @param {Object} extras.headers - it will be merged with current headers
   *   @param {String|Object} extras.body - it will replace the current body
   *   @param {Object} extras.auth - it will replace the current auth
   *   @param {Number} extras.timeout - it will replace the current timeout
   */
  enhance: function enhance(extras) {
    var headerKey = this.methodDescriptor.headersAttr;
    var bodyKey = this.methodDescriptor.bodyAttr;
    var authKey = this.methodDescriptor.authAttr;
    var timeoutKey = this.methodDescriptor.timeoutAttr;
    var requestParams = (0, _utils.assign)({}, this.requestParams, extras.params);

    requestParams[headerKey] = (0, _utils.assign)({}, this.requestParams[headerKey], extras.headers);
    extras.body && (requestParams[bodyKey] = extras.body);
    extras.auth && (requestParams[authKey] = extras.auth);
    extras.timeout && (requestParams[timeoutKey] = extras.timeout);

    requestParams._timeline = extras._timeline || [];
    return new Request(this.methodDescriptor, requestParams);
  },


  /**
   * Is the request expecting a binary response?
   *
   * @return {Boolean}
   */
  isBinary: function isBinary() {
    return this.methodDescriptor.binary;
  }
};

exports.default = Request;