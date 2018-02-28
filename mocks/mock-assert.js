"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @typedef MockAssert
 */
function MockAssert(calls) {
  this.calls = function () {
    return calls;
  };
  this.callsCount = function () {
    return calls.length;
  };
  this.mostRecentCall = function () {
    return calls[calls.length - 1] || null;
  };
}

exports.default = MockAssert;