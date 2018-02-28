'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setErrorHandler = undefined;

var _index = require('../index');

var handler = null;

var setErrorHandler = exports.setErrorHandler = function setErrorHandler(errorHandler) {
  handler = errorHandler;
};

/**
 * Provides a catch-all function for all requests. If the catch-all
 * function returns `true` it prevents the original promise to continue.
 */
var GlobalErrorHandlerMiddleware = function GlobalErrorHandlerMiddleware() {
  return {
    response: function response(next) {
      return new _index.configs.Promise(function (resolve, reject) {
        next().then(function (response) {
          return resolve(response);
        }).catch(function (response) {
          var proceed = true;
          handler && (proceed = !(handler(response) === true));
          proceed && reject(response);
        });
      });
    }
  };
};

exports.default = GlobalErrorHandlerMiddleware;