'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _methodDescriptor = require('./method-descriptor');

var _methodDescriptor2 = _interopRequireDefault(_methodDescriptor);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * @typedef Manifest
 * @param {Object} obj
 *   @param {String} obj.host
 *   @param {Object} obj.gatewayConfigs - default: base values from mappersmith
 *   @param {Object} obj.ignoreGlobalMiddleware - default: false
 *   @param {Object} obj.resources - default: {}
 *   @param {Array}  obj.middleware or obj.middlewares - default: []
 * @param {Object} globalConfigs
 */
function Manifest(obj, _ref) {
  var _ref$gatewayConfigs = _ref.gatewayConfigs,
      gatewayConfigs = _ref$gatewayConfigs === undefined ? null : _ref$gatewayConfigs,
      _ref$middleware = _ref.middleware,
      middleware = _ref$middleware === undefined ? [] : _ref$middleware,
      _ref$context = _ref.context,
      context = _ref$context === undefined ? {} : _ref$context;

  this.host = obj.host;
  this.clientId = obj.clientId || null;
  this.gatewayConfigs = (0, _utils.assign)({}, gatewayConfigs, obj.gatewayConfigs);
  this.resources = obj.resources || {};
  this.context = context;

  var clientMiddleware = obj.middleware || obj.middlewares || [];

  // TODO: deprecate obj.middlewares in favor of obj.middleware
  if (obj.ignoreGlobalMiddleware) {
    this.middleware = clientMiddleware;
  } else {
    this.middleware = [].concat(_toConsumableArray(clientMiddleware), _toConsumableArray(middleware));
  }
}

Manifest.prototype = {
  eachResource: function eachResource(callback) {
    var _this = this;

    Object.keys(this.resources).forEach(function (resourceName) {
      var methods = _this.eachMethod(resourceName, function (methodName) {
        return {
          name: methodName,
          descriptor: _this.createMethodDescriptor(resourceName, methodName)
        };
      });

      callback(resourceName, methods);
    });
  },
  eachMethod: function eachMethod(resourceName, callback) {
    return Object.keys(this.resources[resourceName]).map(callback);
  },
  createMethodDescriptor: function createMethodDescriptor(resourceName, methodName) {
    var definition = this.resources[resourceName][methodName];

    if (!definition || !definition.path) {
      throw new Error('[Mappersmith] path is undefined for resource "' + resourceName + '" method "' + methodName + '"');
    }

    return new _methodDescriptor2.default((0, _utils.assign)({ host: this.host }, definition));
  },


  /**
   * @param {Object} args
   *   @param {String|Null} args.clientId
   *   @param {String} args.resourceName
   *   @param {String} args.resourceMethod
   *   @param {Object} args.context
   *   @param {Boolean} args.mockRequest
   *
   * @return {Array<Object>}
   */
  createMiddleware: function createMiddleware() {
    var _this2 = this;

    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var createInstance = function createInstance(middlewareFactory) {
      return (0, _utils.assign)({
        __middlewareName: middlewareFactory.name || middlewareFactory.toString(),
        request: function request(_request) {
          return _request;
        },
        response: function response(next) {
          return next();
        }
      }, middlewareFactory((0, _utils.assign)(args, { clientId: _this2.clientId, context: (0, _utils.assign)({}, _this2.context) })));
    };

    return this.middleware.map(createInstance);
  }
};

exports.default = Manifest;