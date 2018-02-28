'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var CONTENT_TYPE_JSON = exports.CONTENT_TYPE_JSON = 'application/json;charset=utf-8';

/**
 * Automatically encode your objects into JSON
 *
 * Example:
 * client.User.all({ body: { name: 'bob' } })
 * // => body: {"name":"bob"}
 * // => header: "Content-Type=application/json;charset=utf-8"
 */
var EncodeJsonMiddleware = function EncodeJsonMiddleware() {
  return {
    request: function request(_request) {
      try {
        if (_request.body()) {
          return _request.enhance({
            headers: { 'content-type': CONTENT_TYPE_JSON },
            body: JSON.stringify(_request.body())
          });
        }
      } catch (e) {}
      return _request;
    }
  };
};

exports.default = EncodeJsonMiddleware;