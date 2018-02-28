"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Automatically configure your requests with a default timeout
 *
 * Example:
 * In your manifest:
 * {
 *   middleware: [ TimeoutMiddleware(500) ]
 * }
 *
 * You can still override the default value:
 * client.User.all({ timeout: 100 })
 */
exports.default = function (timeoutValue) {
  return function TimeoutMiddleware() {
    return {
      request: function request(_request) {
        var timeout = _request.timeout();
        return !timeout // Keep the override
        ? _request.enhance({ timeout: timeoutValue }) : _request;
      }
    };
  };
};