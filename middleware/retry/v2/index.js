'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.calculateExponentialRetryTime = exports.defaultRetryConfigs = undefined;

var _index = require('../../../index');

var _utils = require('../../../utils');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var defaultRetryConfigs = exports.defaultRetryConfigs = {
  headerRetryCount: 'X-Mappersmith-Retry-Count',
  headerRetryTime: 'X-Mappersmith-Retry-Time',
  maxRetryTimeInSecs: 5,
  initialRetryTimeInSecs: 0.1,
  factor: 0.2, // randomization factor
  multiplier: 2, // exponential factor
  retries: 5, // max retries
  validateRetry: function validateRetry(response) {
    return response.responseStatus >= 500;
  } // a function that returns true if the request should be retried


  /**
   * This middleware will automatically retry GET requests up to the configured amount of
   * retries using a randomization function that grows exponentially. The retry count and
   * the time used will be included as a header in the response.
   *
   * The retry time is calculated using the following formula:
   *   retryTime = min(
   *     random(previousRetryTime - randomizedFactor, previousRetryTime + randomizedFactor) * multipler,
   *     maxRetryTime
   *   )
   *
   * Take a look at `calculateExponentialRetryTime` for more information.
   *
   *  @param {Object} retryConfigs
   *   @param {String} retryConfigs.headerRetryCount (default: 'X-Mappersmith-Retry-Count')
   *   @param {String} retryConfigs.headerRetryTime (default: 'X-Mappersmith-Retry-Time')
   *   @param {Number} retryConfigs.maxRetryTimeInSecs (default: 5)
   *   @param {Number} retryConfigs.initialRetryTimeInSecs (default: 1)
   *   @param {Number} retryConfigs.factor (default: 0.2) - randomization factor
   *   @param {Number} retryConfigs.multiplier (default: 2) - exponential factor
   *   @param {Number} retryConfigs.retries (default: 5) - max retries
   */
};
exports.default = function () {
  var customConfigs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return function RetryMiddleware() {
    return {
      request: function request(_request) {
        this.enableRetry = _request.method() === 'get';
        return _request;
      },
      response: function response(next) {
        var retryConfigs = (0, _utils.assign)({}, defaultRetryConfigs, customConfigs);

        if (!this.enableRetry) {
          return next();
        }

        return new _index.configs.Promise(function (resolve, reject) {
          var retryTime = retryConfigs.initialRetryTimeInSecs * 1000;
          retriableRequest(resolve, reject, next)(randomFromRetryTime(retryTime, retryConfigs.factor), 0, retryConfigs);
        });
      }
    };
  };
};

var retriableRequest = function retriableRequest(resolve, reject, next) {
  var retry = function retry(retryTime, retryCount, retryConfigs) {
    var nextRetryTime = calculateExponentialRetryTime(retryTime, retryConfigs);
    var shouldRetry = retryCount < retryConfigs.retries;
    var scheduleRequest = function scheduleRequest() {
      setTimeout(function () {
        return retry(nextRetryTime, retryCount + 1, retryConfigs);
      }, retryTime);
    };

    next().then(function (response) {
      resolve(enhancedResponse(response, retryConfigs.headerRetryCount, retryCount, retryConfigs.headerRetryTime, retryTime));
    }).catch(function (response) {
      shouldRetry && retryConfigs.validateRetry(response) ? scheduleRequest() : reject(enhancedResponse(response, retryConfigs.headerRetryCount, retryCount, retryConfigs.headerRetryTime, retryTime));
    });
  };

  return retry;
};

/**
 * Increases the retry time for each attempt using a randomization function that grows exponentially.
 * The value is limited by `retryConfigs.maxRetryTimeInSecs`.
 * @param {Number} retryTime
 *
 * @return {Number}
 */
var calculateExponentialRetryTime = exports.calculateExponentialRetryTime = function calculateExponentialRetryTime(retryTime, retryConfigs) {
  return Math.min(randomFromRetryTime(retryTime, retryConfigs.factor) * retryConfigs.multiplier, retryConfigs.maxRetryTimeInSecs * 1000);
};

var randomFromRetryTime = function randomFromRetryTime(retryTime, factor) {
  var delta = factor * retryTime;
  return random(retryTime - delta, retryTime + delta);
};

var random = function random(min, max) {
  return Math.random() * (max - min) + min;
};

var enhancedResponse = function enhancedResponse(response, headerRetryCount, retryCount, headerRetryTime, retryTime) {
  var _headers;

  return response.enhance({
    headers: (_headers = {}, _defineProperty(_headers, headerRetryCount, retryCount), _defineProperty(_headers, headerRetryTime, retryTime), _headers)
  });
};