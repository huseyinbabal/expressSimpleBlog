"use strict";

/**!
 * dev/null
 * @copyright (c) 2011 observe.it (observe.it) <arnout@observe.com>
 * mit licensed
 */

var Transport = require('./transport');

/**
 * A streaming tranport module for the logger, it should work with every node.js
 * stream that uses the standard write interface.
 *
 * Options:
 *
 * - `stream` A node.js compatible stream, defaults to process.stdout
 *
 * @param {Stream} stream
 * @param {Object} options
 * @api public
 */

var Streamer = module.exports = function streamer (logger, options) {
  // properties that could be overriden
  this.stream = process.stdout;

  Transport.apply(this, arguments);

  // set the correct name
  this.name = 'streamer';
};

/**
 * Inherit from `Transport`.
 */

require('util').inherits(Streamer, Transport);

/**
 * Try to write out the data to the stream.
 *
 * @param {String} type
 * @param {String} namespace
 * @api public
 */

Streamer.prototype.write = function write (type, namespace, args) {
  var log = this.logger.stamp()
      + ' '
      + this.logger.prefix[type]
      + (namespace && namespace.length ? (' (' + namespace.join('/') + ') ') : ' ')
      + this.logger.format.apply(this, args)
      + '\n';

  if (this.stream.writable) {
    this.stream.write(log);
    this.logger.emit('transport:write', log);
  } else {
    this.logger.emit('transport:error', new Error('stream not writable'), log);
  }

  return this;
};

/**
 * Shutdown down the transport.
 *
 * @api private
 */

Streamer.prototype.close = function close () {
  // don't close the stdout
  if (this.stream === process.stdout) return this;

  if (this.stream.end) {
    try { this.stream.end(); }
    catch (e) {}
  }
};
