'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _manifest = require('./manifest');

var _manifest2 = _interopRequireDefault(_manifest);

var _request = require('./request');

var _request2 = _interopRequireDefault(_request);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * @typedef ClientBuilder
 * @param {Object} manifest - manifest definition with at least the `resources` key
 * @param {Function} GatewayClassFactory - factory function that returns a gateway class
 */
function ClientBuilder(manifest, GatewayClassFactory, configs) {
  if (!manifest) {
    throw new Error('[Mappersmith] invalid manifest (' + manifest + ')');
  }

  if (!GatewayClassFactory || !GatewayClassFactory()) {
    throw new Error('[Mappersmith] gateway class not configured (configs.gateway)');
  }

  this.Promise = configs.Promise;
  this.manifest = new _manifest2.default(manifest, configs);
  this.GatewayClassFactory = GatewayClassFactory;
}

var getMiddlewareName = function getMiddlewareName(middleware) {
  return middleware.__middlewareName;
};

ClientBuilder.prototype = {
  build: function build() {
    var _this = this;

    var client = { _manifest: this.manifest };

    this.manifest.eachResource(function (name, methods) {
      client[name] = _this.buildResource(name, methods);
    });

    return client;
  },
  buildResource: function buildResource(resourceName, methods) {
    var _this2 = this;

    return methods.reduce(function (resource, method) {
      return (0, _utils.assign)(resource, _defineProperty({}, method.name, function (requestParams) {
        var request = new _request2.default(method.descriptor, requestParams);
        return _this2.invokeMiddlewares(resourceName, method.name, request);
      }));
    }, {});
  },
  invokeMiddlewares: function invokeMiddlewares(resourceName, resourceMethod, initialRequest) {
    var _this3 = this;

    var middleware = this.manifest.createMiddleware({ resourceName: resourceName, resourceMethod: resourceMethod });
    var GatewayClass = this.GatewayClassFactory();
    var gatewayConfigs = this.manifest.gatewayConfigs;
    var chainRequestPhase = function chainRequestPhase(requestPromise, middleware) {
      var start = new Date();
      return requestPromise.then(function (request) {
        return middleware.request(request);
      }).then(function (request) {
        return _this3.Promise.resolve(request);
      }).then(function (request) {
        var end = new Date();
        var duration = end.getTime() - start.getTime();

        if (request && request.enhance) {
          return request.enhance({
            _timeline: [].concat(_toConsumableArray(request.timeline() || []), [{
              phase: 'request',
              name: getMiddlewareName(middleware),
              duration: duration,
              invokedAt: start.toISOString(),
              completedAt: end.toISOString()
            }])
          });
        }

        return request;
      });
    };
    var chainResponsePhase = function chainResponsePhase(next, middleware) {
      return function () {
        var start = new Date();
        return middleware.response(next).then(function (response) {
          var end = new Date();
          var duration = end.getTime() - start.getTime();
          var timelineEntry = [].concat(_toConsumableArray(response ? response._timeline || [] : []), [{
            phase: 'response',
            name: getMiddlewareName(middleware),
            status: 'success',
            duration: duration,
            invokedAt: start.toISOString(),
            completedAt: end.toISOString()
          }]);

          if (response && response.enhance) {
            return response.enhance({ _timeline: timelineEntry });
          }

          if ((typeof response === 'undefined' ? 'undefined' : _typeof(response)) === 'object') {
            response._timeline = timelineEntry;
          }

          return response;
        }).catch(function (response) {
          var end = new Date();
          var duration = end.getTime() - start.getTime();
          var timelineEntry = [].concat(_toConsumableArray(response ? response._timeline || [] : []), [{
            phase: 'response',
            name: getMiddlewareName(middleware),
            status: 'failure',
            duration: duration,
            invokedAt: start.toISOString(),
            completedAt: end.toISOString()
          }]);

          if (response && response.enhance) {
            throw response.enhance({ _timeline: timelineEntry });
          }

          if ((typeof response === 'undefined' ? 'undefined' : _typeof(response)) === 'object') {
            response._timeline = timelineEntry;
          }

          throw response;
        });
      };
    };

    return new this.Promise(function (resolve, reject) {
      return middleware.reduce(chainRequestPhase, _this3.Promise.resolve(initialRequest)).then(function (finalRequest) {
        var callGateway = function callGateway() {
          var start = new Date();
          return new GatewayClass(finalRequest, gatewayConfigs).call().then(function (response) {
            var end = new Date();
            var duration = end.getTime() - start.getTime();
            var timelineEntry = [].concat(_toConsumableArray(response ? response._timeline || [] : []), [{
              phase: 'gateway',
              name: 'HTTP request',
              status: 'success',
              duration: duration,
              invokedAt: start.toISOString(),
              completedAt: end.toISOString()
            }]);

            if (response && response.enhance) {
              return response.enhance({ _timeline: timelineEntry });
            }

            if ((typeof response === 'undefined' ? 'undefined' : _typeof(response)) === 'object') {
              response._timeline = timelineEntry;
            }

            return response;
          }).catch(function (response) {
            var end = new Date();
            var duration = end.getTime() - start.getTime();
            var timelineEntry = [].concat(_toConsumableArray(response ? response._timeline || [] : []), [{
              phase: 'gateway',
              name: 'HTTP request',
              status: 'failure',
              duration: duration,
              invokedAt: start.toISOString(),
              completedAt: end.toISOString()
            }]);

            if (response && response.enhance) {
              throw response.enhance({ _timeline: timelineEntry });
            }

            if ((typeof response === 'undefined' ? 'undefined' : _typeof(response)) === 'object') {
              response._timeline = timelineEntry;
            }

            throw response;
          });
        };
        var execute = middleware.reduce(chainResponsePhase, callGateway);

        return execute().then(function (response) {
          return resolve(response);
        });
      }).catch(reject);
    });
  }
};

exports.default = ClientBuilder;