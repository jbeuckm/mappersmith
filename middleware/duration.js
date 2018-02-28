'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Adds started_at, ended_at and duration headers to the response
 */
var DurationMiddleware = function DurationMiddleware() {
  return {
    request: function request(_request) {
      return _request.enhance({
        headers: { 'X-Started-At': Date.now() }
      });
    },
    response: function response(next) {
      var endedAt = Date.now();

      return next().then(function (response) {
        return response.enhance({
          headers: {
            'X-Started-At': response.request().headers()['x-started-at'],
            'X-Ended-At': endedAt,
            'X-Duration': endedAt - response.request().headers()['x-started-at']
          }
        });
      });
    }
  };
};

exports.default = DurationMiddleware;