'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.calculateExponentialRetryTime = exports.setRetryConfigs = undefined;

var _utils = require('../../../utils');

var _v = require('../v2');

var _v2 = _interopRequireDefault(_v);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var retryConfigs = (0, _utils.assign)({}, _v.defaultRetryConfigs);

/**
 * @deprecated The use of setRetryConfigs is deprecated as it sets a global config
    which may cause troubles if you need multiple different configurations.
    Use middleware/retry/v2 instead which supports passing in a configuration object.
 *
 * @param {Object} newConfigs
 *   @param {String} newConfigs.headerRetryCount (default: 'X-Mappersmith-Retry-Count')
 *   @param {String} newConfigs.headerRetryTime (default: 'X-Mappersmith-Retry-Time')
 *   @param {Number} newConfigs.maxRetryTimeInSecs (default: 5)
 *   @param {Number} newConfigs.initialRetryTimeInSecs (default: 1)
 *   @param {Number} newConfigs.factor (default: 0.2) - randomization factor
 *   @param {Number} newConfigs.multiplier (default: 2) - exponential factor
 *   @param {Number} newConfigs.retries (default: 5) - max retries
 */
var setRetryConfigs = exports.setRetryConfigs = function setRetryConfigs(newConfigs) {
  console.warn('The use of setRetryConfigs is deprecated - use RetryMiddleware v2 instead.');
  retryConfigs = (0, _utils.assign)({}, retryConfigs, newConfigs);
};

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
 * Parameters can be configured using the method `setRetryConfigs`.
 */
var RetryMiddleware = (0, _v2.default)(retryConfigs);

exports.default = RetryMiddleware;

/**
 * Increases the retry time for each attempt using a randomization function that grows exponentially.
 * The value is limited by `retryConfigs.maxRetryTimeInSecs`.
 * @param {Number} retryTime
 *
 * @return {Number}
 */

var calculateExponentialRetryTime = exports.calculateExponentialRetryTime = function calculateExponentialRetryTime(retryTime) {
  return Math.min(randomFromRetryTime(retryTime) * retryConfigs.multiplier, retryConfigs.maxRetryTimeInSecs * 1000);
};

var randomFromRetryTime = function randomFromRetryTime(retryTime) {
  var delta = retryConfigs.factor * retryTime;
  return random(retryTime - delta, retryTime + delta);
};

var random = function random(min, max) {
  return Math.random() * (max - min) + min;
};