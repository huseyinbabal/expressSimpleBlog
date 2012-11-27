/**!
 * @copyright (c) 2011 Observe.it (observe.it) <arnout@observe.com>
 * MIT Licensed
 */

var EventEmitter = require('events').EventEmitter
  , slice = Array.prototype.slice;

/**
 * Default globals
 */

Logger = require('../');
Transport = require('../transports/transport');
Transports = require('../transports/');

/**
 * Fixtures
 */

fixtures = {
    mongodb: 'mongodb://test:test@localhost:27017/myapp'
};

/**
 * Produce a dummy transport that emits events for each called method.
 */

fixtures.transport = function () {
  var EE = new EventEmitter;

  /**
   * A small evented dummy that allows us to listen to different events
   *
   * @api private
   */

  function dummy () {
    EE.emit.apply(EE, ['initialize'].concat(slice.call(arguments)));

    this.close = function close () {
      EE.emit.apply(EE, ['close'].concat(slice.call(arguments)));
    }

    this.write = function write () {
      EE.emit.apply(EE, ['write'].concat(slice.call(arguments)));
    }
  }

  // return the fake transport
  return {
      on: function (name, fn) { EE.on(name, fn) }
    , dummy: dummy
  }
};

/**
 * Produce a dummy stream that emits events for each called method.
 */

fixtures.stream = function () {
  var EE = new EventEmitter;

  /**
   * A small evented dummy that allows us to listen to different events, it
   * needs to be an object.. As streams are seen as objects as well
   *
   * @api private
   */

  var dummy = {
      writable: true

    , end: function close () {
        EE.emit.apply(EE, ['end'].concat(slice.call(arguments)));
      }

    , write: function write () {
        EE.emit.apply(EE, ['write'].concat(slice.call(arguments)));
      }
  };

  // return the fake transport
  return {
      on: function (name, fn) { EE.on(name, fn) }
    , dummy: dummy
  }
};
