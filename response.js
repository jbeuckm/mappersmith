'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require('./utils');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * @typedef Response
 * @param {Request} originalRequest, for auth it hides the password
 * @param {Integer} responseStatus
 * @param {String} responseData, defaults to null
 * @param {Object} responseHeaders, defaults to an empty object ({})
 */
function Response(originalRequest, responseStatus, responseData, responseHeaders, _timeline) {
  if (originalRequest.requestParams && originalRequest.requestParams.auth) {
    var maskedAuth = (0, _utils.assign)({}, originalRequest.requestParams.auth, { password: '***' });
    this.originalRequest = originalRequest.enhance({ auth: maskedAuth });
  } else {
    this.originalRequest = originalRequest;
  }

  this.responseStatus = responseStatus;
  this.responseData = responseData !== undefined ? responseData : null;
  this.responseHeaders = responseHeaders || {};
  this.timeElapsed = null;

  var completeTimeline = [].concat(_toConsumableArray(this._timeline || []), _toConsumableArray(_timeline || []));
  var gatewayEntry = completeTimeline.find(function (entry) {
    return entry.phase === 'gateway';
  });
  var responseTimeline = completeTimeline.filter(function (entry) {
    return entry.phase === 'response';
  });
  var requestTimeline = this.originalRequest.timeline ? this.originalRequest.timeline() || [] : [];

  this._timeline = [].concat(_toConsumableArray(requestTimeline), [gatewayEntry], _toConsumableArray(responseTimeline)).filter(function (entry) {
    return entry;
  });
}

Response.prototype = {
  /**
   * @return {Request}
   */
  request: function request() {
    return this.originalRequest;
  },


  /**
   * @return {Integer}
   */
  status: function status() {
    // IE sends 1223 instead of 204
    if (this.responseStatus === 1223) {
      return 204;
    }

    return this.responseStatus;
  },


  /**
   * Returns true if status is greater or equal 200 or lower than 400
   *
   * @return {Boolean}
   */
  success: function success() {
    var status = this.status();
    return status >= 200 && status < 400;
  },


  /**
   * Returns an object with the headers. Header names are converted to
   * lowercase
   *
   * @return {Object}
   */
  headers: function headers() {
    return (0, _utils.lowerCaseObjectKeys)(this.responseHeaders);
  },


  /**
   * Utility method to get a header value by name
   *
   * @param {String} name
   *
   * @return {String|Undefined}
   */
  header: function header(name) {
    return this.headers()[name.toLowerCase()];
  },


  /**
   * Returns the original response data
   */
  rawData: function rawData() {
    return this.responseData;
  },


  /**
   * Returns the response data, if "Content-Type" is "application/json"
   * it parses the response and returns an object
   *
   * @return {String|Object}
   */
  data: function data() {
    var data = this.responseData;

    if (this.isContentTypeJSON()) {
      try {
        data = JSON.parse(this.responseData);
      } catch (e) {}
    }

    return data;
  },
  isContentTypeJSON: function isContentTypeJSON() {
    return (/application\/json/.test(this.headers()['content-type'])
    );
  },


  /**
   * Enhances current Response returning a new Response
   *
   * @param {Object} extras
   *   @param {Integer} extras.status - it will replace the current status
   *   @param {String} extras.rawData - it will replace the current rawStatus
   *   @param {Object} extras.headers - it will be merged with current headers
   *
   * @return {Response}
   */
  enhance: function enhance(extras) {
    return new Response(this.request(), extras.status || this.status(), extras.rawData || this.rawData(), (0, _utils.assign)({}, this.headers(), extras.headers), extras._timeline);
  }
};

exports.default = Response;