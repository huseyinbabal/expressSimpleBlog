"use strict";

var EventEmitter = process.EventEmitter;

/**
 * Strict type checking.
 *
 * @param {Mixed} prop
 * @returns {String}
 * @api private
 */

function type (prop) {
  var rs = Object.prototype.toString.call(prop);
  return rs.slice(8, rs.length - 1).toLowerCase();
}

/**
 * The base setup.
 *
 * @constructor
 * @param {Object} options
 * @api private
 */

var Transport = module.exports = function transport (logger, options) {
  var self = this
    , key;

  options = options || {};
  this.name = 'transport';

  // override the defaults, but not the methods and they should also be the
  // exact same type
  for (key in options) {
    if (key in this
      && type(this[key]) !== 'function'
      && type(this[key]) === type(options[key])
    ) {
      this[key] = options[key];
    }
  }

  // should not be overridden by the options
  this.logger = logger;

  // lazy initialize
  if (this.initialize) {
    process.nextTick(function next () {
      self.initialize.call(self, options);
    });
  }
};

Transport.prototype.__proto__ = EventEmitter.prototype;

/**
 * This the function that gets called for each log call and should always be
 * present in a transport.
 *
 * @param {String} type log type
 * @param {String} namespace namespace
 * @param {Array} args arguments
 * @api public
 */

Transport.prototype.write = function write (type, namespace, args) {};

/**
 * The transport needs to be removed
 *
 * @api public
 */

Transport.prototype.close = function close () {};
