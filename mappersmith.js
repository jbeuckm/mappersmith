'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setContext = exports.configs = exports.version = undefined;
exports.default = forge;

var _clientBuilder = require('./client-builder');

var _clientBuilder2 = _interopRequireDefault(_clientBuilder);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* global VERSION */
var version = exports.version = '2.18.0';

var configs = exports.configs = {
  context: {},
  middleware: [],
  Promise: typeof Promise === 'function' ? Promise : null,
  fetch: typeof fetch === 'function' ? fetch : null, // eslint-disable-line no-undef

  /**
   * Gateway implementation, it defaults to "lib/gateway/xhr" for browsers and
   * "lib/gateway/http" for node
   */
  gateway: null,
  gatewayConfigs: {
    /**
     * Setting this option will fake PUT, PATCH and DELETE requests with a HTTP POST. It will
     * add "_method" and "X-HTTP-Method-Override" with the original requested method
     * @default false
     */
    emulateHTTP: false,

    XHR: {
      /**
       * Indicates whether or not cross-site Access-Control requests should be made using credentials
       * such as cookies, authorization headers or TLS client certificates.
       * Setting withCredentials has no effect on same-site requests
       *
       * https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
       *
       * @default false
       */
      withCredentials: false,

      /**
       * For aditional configurations to the XMLHttpRequest object.
       * @param {XMLHttpRequest} xhr
       * @default null
       */
      configure: null
    },

    HTTP: {
      /**
       * For aditional configurations to the http/https module
       * For http: https://nodejs.org/api/http.html#http_http_request_options_callback
       * For https: https://nodejs.org/api/https.html#https_https_request_options_callback
       *
       * @param {object} options
       * @default null
       */
      configure: null
    },

    Fetch: {
      /**
       * Indicates whether the user agent should send cookies from the other domain in the case of cross-origin
       * requests. This is similar to XHR’s withCredentials flag, but with three available values (instead of two):
       *
       * "omit": Never send cookies.
       * "same-origin": Only send cookies if the URL is on the same origin as the calling script.
       * "include": Always send cookies, even for cross-origin calls.
       *
       * https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials
       *
       * @default "omit"
       */
      credentials: 'omit'
    }
  }

  /**
   * @param {Object} context
   */
};var setContext = exports.setContext = function setContext(context) {
  configs.context = (0, _utils.assign)(configs.context, context);
};

/**
 * @param {Object} manifest
 */
function forge(manifest) {
  var GatewayClassFactory = function GatewayClassFactory() {
    return configs.gateway;
  };
  return new _clientBuilder2.default(manifest, GatewayClassFactory, configs).build();
}