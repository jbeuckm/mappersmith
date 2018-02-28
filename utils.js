'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.toQueryString = toQueryString;
exports.performanceNow = performanceNow;
exports.parseResponseHeaders = parseResponseHeaders;
exports.lowerCaseObjectKeys = lowerCaseObjectKeys;
exports.isPlainObject = isPlainObject;
var _process = void 0,
    getNanoSeconds = void 0,
    loadTime = void 0;
try {
  _process = eval('typeof __TEST_WEB__ === "undefined" && typeof process === "object" ? process : undefined');
} catch (e) {} // eslint-disable-line no-eval

var hasProcessHrtime = function hasProcessHrtime() {
  return typeof _process !== 'undefined' && _process !== null && _process.hrtime;
};

if (hasProcessHrtime()) {
  getNanoSeconds = function getNanoSeconds() {
    var hr = _process.hrtime();
    return hr[0] * 1e9 + hr[1];
  };
  loadTime = getNanoSeconds();
}

var R20 = /%20/g;

var validKeys = function validKeys(entry) {
  return Object.keys(entry).filter(function (key) {
    return entry[key] !== undefined && entry[key] !== null;
  });
};

var buildRecursive = function buildRecursive(key, value, suffix) {
  suffix = suffix || '';
  var isArray = Array.isArray(value);
  var isObject = (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object';

  if (!isArray && !isObject) {
    return encodeURIComponent(key + suffix) + '=' + encodeURIComponent(value);
  }

  if (isArray) {
    return value.map(function (v) {
      return buildRecursive(key, v, suffix + '[]');
    }).join('&');
  }

  return validKeys(value).map(function (k) {
    return buildRecursive(key, value[k], suffix + '[' + k + ']');
  }).join('&');
};

function toQueryString(entry) {
  if (!isPlainObject(entry)) {
    return entry;
  }

  return validKeys(entry).map(function (key) {
    return buildRecursive(key, entry[key]);
  }).join('&').replace(R20, '+');
}

/**
 * Gives time in miliseconds, but with sub-milisecond precision for Browser
 * and Nodejs
 */
function performanceNow() {
  if (hasProcessHrtime()) {
    return (getNanoSeconds() - loadTime) / 1e6;
  }

  return Date.now();
}

/**
 * borrowed from: {@link https://gist.github.com/monsur/706839}
 * XmlHttpRequest's getAllResponseHeaders() method returns a string of response
 * headers according to the format described here:
 * {@link http://www.w3.org/TR/XMLHttpRequest/#the-getallresponseheaders-method}
 * This method parses that string into a user-friendly key/value pair object.
 */
function parseResponseHeaders(headerStr) {
  var headers = {};
  if (!headerStr) {
    return headers;
  }

  var headerPairs = headerStr.split('\r\n');
  for (var i = 0; i < headerPairs.length; i++) {
    var headerPair = headerPairs[i];
    // Can't use split() here because it does the wrong thing
    // if the header value has the string ": " in it.
    var index = headerPair.indexOf(': ');
    if (index > 0) {
      var key = headerPair.substring(0, index).toLowerCase();
      var val = headerPair.substring(index + 2).trim();
      headers[key] = val;
    }
  }
  return headers;
}

function lowerCaseObjectKeys(obj) {
  return Object.keys(obj).reduce(function (target, key) {
    target[key.toLowerCase()] = obj[key];
    return target;
  }, {});
}

var hasOwnProperty = Object.prototype.hasOwnProperty;
var assign = exports.assign = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var key in source) {
      if (hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }
  return target;
};

var toString = Object.prototype.toString;
function isPlainObject(value) {
  return toString.call(value) === '[object Object]' && Object.getPrototypeOf(value) === Object.getPrototypeOf({});
}

/**
 * borrowed from: {@link https://github.com/davidchambers/Base64.js}
 */
var CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
var btoa = exports.btoa = function btoa(input) {
  var output = '';
  var map = CHARS;
  var str = String(input);
  for (
  // initialize result and counter
  var block, charCode, idx = 0;
  // if the next str index does not exist:
  //   change the mapping table to "="
  //   check if d has no fractional digits
  str.charAt(idx | 0) || (map = '=', idx % 1);
  // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
  output += map.charAt(63 & block >> 8 - idx % 1 * 8)) {
    charCode = str.charCodeAt(idx += 3 / 4);
    if (charCode > 0xFF) {
      throw new Error("[Mappersmith] 'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
    }
    block = block << 8 | charCode;
  }
  return output;
};