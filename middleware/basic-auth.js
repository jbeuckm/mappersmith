'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require('../utils');

/**
 * Automatically configure your requests with basic auth
 *
 * Example:
 * In your manifest:
 * {
 *   middleware: [ BasicAuthMiddleware({ username: 'bob', password: 'bob' }) ]
 * }
 *
 * Making the call:
 * client.User.all()
 * // => header: "Authorization: Basic Ym9iOmJvYg=="
 */
exports.default = function (authConfig) {
  return function BasicAuthMiddleware() {
    return {
      request: function request(_request) {
        var auth = _request.auth();
        return !auth // Keep the override
        ? _request.enhance({ auth: (0, _utils.assign)({}, authConfig) }) : _request;
      }
    };
  };
};