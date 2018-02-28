'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var defaultSuccessLogger = exports.defaultSuccessLogger = function defaultSuccessLogger(message) {
  var logger = console.info ? console.info : console.log;
  logger(message);
};

var defaultErrorLogger = exports.defaultErrorLogger = function defaultErrorLogger(message) {
  var logger = console.error ? console.error : console.log;
  logger(message);
};

var isLoggerEnabled = console && console.log;
var successLogger = defaultSuccessLogger;
var errorLogger = defaultErrorLogger;

var setSuccessLogger = exports.setSuccessLogger = function setSuccessLogger(logger) {
  successLogger = logger;
};
var setErrorLogger = exports.setErrorLogger = function setErrorLogger(logger) {
  errorLogger = logger;
};
var setLoggerEnabled = exports.setLoggerEnabled = function setLoggerEnabled(value) {
  isLoggerEnabled = value;
};

var log = function log(request, response) {
  if (isLoggerEnabled) {
    var httpCall = request.method().toUpperCase() + ' ' + request.url();
    var direction = response ? '<-' : '->';
    var isError = response && !response.success();
    var errorLabel = isError ? '(ERROR) ' : '';
    var extra = response ? ' status=' + response.status() + ' \'' + response.rawData() + '\'' : '';
    var logger = isError ? errorLogger : successLogger;

    logger(direction + ' ' + errorLabel + httpCall + extra);
  }

  return response || request;
};

/**
 * Log all requests and responses.
 */
var ConsoleLogMiddleware = function ConsoleLogMiddleware() {
  return {
    request: function request(_request) {
      return log(_request);
    },
    response: function response(next) {
      return next().then(function (response) {
        return log(response.request(), response);
      }).catch(function (response) {
        log(response.request(), response);
        throw response;
      });
    }
  };
};

exports.default = ConsoleLogMiddleware;