'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Sets a request header with the value of a cookie from document.cookie, if it exists
 */
exports.default = function () {
  var cookieName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'csrfToken';
  var headerName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'x-csrf-token';
  return function CsrfMiddleware() {
    return {
      request: function request(_request) {
        if (typeof document === 'undefined') {
          return _request;
        }

        var getCookie = function getCookie(cookieName) {
          var cookieString = new RegExp(cookieName + '[^;]+').exec((document || {}).cookie || '');
          return cookieString ? decodeURIComponent(cookieString.toString().replace(/^[^=]+./, '')) : undefined;
        };

        var csrf = getCookie(cookieName);

        return !csrf ? _request : _request.enhance({
          headers: _defineProperty({}, headerName, csrf)
        });
      }
    };
  };
};