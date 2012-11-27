"use strict";

/**!
 * dev/null
 * @copyright (c) 2011 Observe.it (observe.it) <arnout@observe.com>
 * MIT Licensed
 */

var tty = require('tty')
  , colors = require('colors')
  , util = require('util')
  , EventEmitter = process.EventEmitter;

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
 * Detect if can use colors or not.
 *
 * @type {Boolean}
 * @api private
 */

var atty = tty.isatty(process.stdout.fd);

/**
 * The different log levels, in order of importance.
 *
 * @type {Array}
 * @api private
 */

var levels = {
    'alert': 0
  , 'critical': 1
  , 'error': 2
  , 'warning': 3
  , 'metric': 4
  , 'notice': 5
  , 'info': 6
  , 'log': 7
  , 'debug': 8
};

/**
 * Different log methods and it's output format. It's divided by system env. as
 * you don't want your production log files full of color codes, but you do when
 * them during development as they helpful for spotting errors and debug output.
 *
 * @type {Object}
 * @api private
 */

var methods = {
    development: {
        alert:    'alert:   '.red
      , critical: 'critical:'.red
      , error:    'error:   '.red
      , warning:  'warning: '.yellow
      , metric:   'metric:  '.green
      , notice:   'notice:  '.cyan
      , info:     'info:    '.cyan
      , log:      'log:     '.grey
      , debug:    'debug:   '.grey
    }
  , production: {
        alert:    'alert:'
      , critical: 'critical:'
      , error:    'error:'
      , warning:  'warning:'
      , metric:   'metric:'
      , notice:   'notice:'
      , info:     'info:'
      , log:      'log:'
      , debug:    'debug:'
    }
};

/**
 * A easier to understand logger, designed for readablity during development.
 * The logs can be stamped and colored based on the evn.
 *
 * Options:
 *  - `env` either development or production, default is based on isatty.
 *  - `level` log level, defaults to 8.
 *  - `notification` when do start emitting notification errors, defaults to 1.
 *  - `timestamp` do the logs needs to stamped, defaults to true.
 *  - `pattern` pattern for the timestamp, defaults to node's util log format.
 *  - `base` do we need to provide a base transport by default?, default to true.
 *
 * @constructor
 * @param {Object} options options
 * @api public
 */

var Logger = module.exports = function devnull (options) {
  options = options || {};

  // default options
  this.env = atty ? 'development' : 'production';
  this.levels = levels;
  this.level = options.level || Object.keys(this.levels).length;
  this.notification = this.levels.warning;
  this.namespacing = this.levels.debug;

  // output related options
  this.timestamp = true;
  this.base = true;
  this.pattern = '{FullYear}-{Month:2}-{Date:2} {toLocaleTimeString}';

  // override the defaults, but not the methods and they should also be the
  // exact same type
  for (var key in options) {
    if (key in this
      && type(this[key]) !== 'function'
      && type(this[key]) === type(options[key])
    ) {
      this[key] = options[key];
    }
  }

  // set the correct prefx
  this.prefix = methods[this.env];
  this.transports = [];
  this.calls = 0;
  this.silence = {};

  // do we need to supply a default logging library?
  if (this.base) {
    this.use(require('../transports/stream'));
  }
};

Logger.prototype.__proto__ = EventEmitter.prototype;

/**
 * Allow different or multiple transports per enviroument by placing it in
 * a configure function.
 *
 * @param {String} env NODE_ENV result
 * @param {Function} fn callback
 * @api public
 */

Logger.prototype.configure = function configure (env, fn) {
  var envs = 'all'
    , args = [].slice.call(arguments);

  fn = args.pop();

  if (args.length) envs = args;
  if (fn && ('all' === envs || ~envs.indexOf(this.env))) fn.call(this);

  return this;
};

/**
 * Update an setting.
 *
 * @param {String} key the setting to update
 * @param {Mixed} value the new value
 * @api public
 */

Logger.prototype.set = function set (key, value) {
  if (key in this) {
    if (value !== this[key]) this.emit('settings:' + key, value);

    this[key] = value;
  }

  return this;
};

/**
 * Returns the setting for the given key
 *
 * @param {String key
 * @returns {Mixed}
 * @api public
 */

Logger.prototype.get = function get (key) {
  return this[key];
};

/**
 * Check if the setting is enabled.
 *
 * @param {String} key
 * @returns {Boolean}
 */

Logger.prototype.enabled = function enabled (key) {
  return !!this.get(key);
};

/**
 * Check if the setting is disabled.
 *
 * @param {String} key
 * @returns {Boolean}
 * @api public
 */

Logger.prototype.disabled = function disabled (key) {
  return !this.get(key);
};

/**
 * Enables the given setting.
 *
 * @param {String} key
 * @api public
 */

Logger.prototype.enable = function enable (key) {
  return this.set(key, true);
};

/**
 * Disables the given setting.
 *
 * @param {String} key
 * @api public
 */

Logger.prototype.disabled = function disabled (key) {
  return this.set(key, true);
};

/**
 * Allows you to ignore log message from a given file name.
 *
 * @param {String} file
 * @api public
 */

Logger.prototype.ignore = function ignore (file) {
  this.silence[file] = 1;

  return this;
};

/**
 * Stop ignoring the given file name.
 *
 * @api public
 */

Logger.prototype.unignore = function unignore (file) {
  if (file in this.silence) delete this.silence[file];

  return this;
};

/**
 * Returns a list currently ignored files.
 *
 * @returns {Array}
 * @api public
 */

Logger.prototype.ignoring = function ignoring () {
  return Object.keys(this.silence);
};

/**
 * Add more transport methods to the logger.
 *
 * @param {Transport} Transport Transport constructor
 * @param {Object} options configuration for the transport
 * @returns {Logger}
 * @api public
 */

Logger.prototype.use = function use (Transport, options) {
  // prevent duplicates
  if (type(Transport) !== 'function') return this;

  this.transports.push(new Transport(this, options || {}));
  return this;
};


/**
 * Test if a transport is available.
 *
 * @param {Transport} Transport Transport constructor
 * @return {Boolean}
 * @api private
 */

Logger.prototype.has = function has (Transport) {
  if (!Transport) return false;

  var i = this.transports.length
    , source = Transport.toString();

  while (i--) {
    if (this.transports[i].constructor.toString() === source) {
      return this.transports[i];
    }
  }

  return false;
};

/**
 * Remove a transport method from the logger.
 *
 * @param {Transport} Transport Transport constructor
 * @returns {Logger}
 * @api public
 */

Logger.prototype.remove = function remove (Transport) {
  var transport = this.has(Transport)
    , i = this.transports.length;

  // cancel if we don't have a transport
  if (!transport) return this;

  // shutdown the transport
  transport.close();

  // and remove it
  while (i--) {
    if (this.transports[i] === transport) {
      this.transports.splice(i, 1);
    }
  }

  return this;
};

/**
 * The actual method that does the logging, in a fancy pancy format ofcourse.
 *
 * @param {String} type log type
 * @param {Number} level log level
 * @returns {Logger}
 * @api public
 */

Logger.prototype.write = function write (type, level, stack) {
  var args = Array.prototype.slice.call(arguments).slice(3)
    , length = this.transports.length
    , i = 0
    , path
    , filename;

  if (stack) {
    path = stack[0].getFileName();
    filename = path.slice(path.lastIndexOf('/') + 1);

    // silence, silence! ssht!
    if (this.silence[filename]) return this;

  }

  for (; i < length; i++) {
    this.transports[i].write(type, this.namespace(stack, args, filename), args);
  }

  // do we need to emit a event
  if (level <= this.notification && this.listeners(type).length) {
    this.emit(type, args, stack);
  }

  // increase our calls
  ++this.calls;

  return this;
};

/**
 * Generates a timestamp based on the pattern. It's based on the 140bytes gist:
 * https://gist.github.com/1005948.
 *
 * @param {Date} date optional Date instance
 * @returns {String}
 * @api public
 */

Logger.prototype.stamp = function stamp (date) {
  if (!this.timestamp) return '';

  var now = date || new Date;
  return this.pattern.replace(/\{(.+?)(?::(.*?))?\}/g, function (res, method, padding) {
    for (res = now[method in now ? method : 'get' + method]() // exec the getter
      + (/h/.test(method) || '') // increment month by 1
      + ''; // cast to string
      res.length < padding; // while we need padding
      res = 0 + res // padd with zeros
    );

    return res;
  });
};

/**
 * This is a direct port of Node's console.log formatter, I wanted to support
 * the exact same structure so it's easier swap from `console.log` statements to
 * `logger` statements.
 *
 * But I have optimized the code base, removed pointless javascript var
 * declarations, loop optimizations and more.
 *
 * @copyright https://github.com/joyent/node/blob/master/lib/util.js
 * @param {String} f formatting string
 * @returns {String}
 * @api private
 */

var formatRegExp = /%[sdj%]/g;
Logger.prototype.format = function format (f) {
  var args = arguments
    , len = args.length
    , str = []
    , i = 0;

  if (typeof f !== 'string') {
    for (; i < len; i++) {
      str.push(util.inspect(args[i]));
    }
    return str.join(' ');
  }

  i = 1;
  str = f.replace(formatRegExp, function (x) {
    if (i >= len) return x;

    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      case '%%': return '%';
      default:
        return x;
    }
  });

  for (var x = args[i]; i < len; x = args[++i]) {
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + util.inspect(x);
    }
  }

  return str;
};

/**
 * Parses the stacktraces to useful data structures. Simple yet effective. It
 * uses the V8 callsite API to generate the namespaces. Parsing it manually from
 * a regular stack trace gives to much issues.
 *
 * @see http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
 *
 * @param {String} trace the captured stack
 * @param {Mixed} arg first "normal" argument that the logger received
 * @param {String} filename the filename where the log message originates from
 * @returns {String} namespace
 * @api private
 */

Logger.prototype.namespace = function namespace (trace, args, filename) {
  if (!trace || !trace.length) return [];

  var arg = args[0]
    , one, two
    , path = [filename];

  // try to detect if we received a user defined namespace argument or
  if (args.length > 1             // we should have multiple arguments
      && typeof arg === 'string'  // first should be string
      && !~arg.indexOf(' ')       // but not a sentance
      && !~arg.indexOf('%')       // and not a formatting option
  ) {
    path.push(args.shift());
    return path;
  }

  // generate a namespace from the called functions
  one = trace[0].getFunctionName() || trace[0].getMethodName();

  if (one) {
    path.push(one);

    if (trace[1]) {
      two = trace[1].getFunctionName() || trace[1].getMethodName();
      if (two) path.push(two);
    }
  }

  // return the code path
  return path;
};

/**
 * Generate logging methods based on the allowed levels. This allows us to use
 * a more readable syntax like: logger.info('hello world'); We are generating
 * a new Function here so we reduce scope lookups and get a better call stack
 * report.
 *
 * @api private
 */

Object.keys(levels).forEach(function levelr (level) {
  var index = levels[level]
    , capture = [
        'var stack, err, original;'
      , 'if ('+ index +' >= this.level) return this;'
      , 'if ('+ index +' <= this.namespacing) {'
      , '  original = Error.prepareStackTrace;'
      , '  Error.prepareStackTrace = function (idontgiveafuck, trace) { return trace; };'
      , '  err = new Error;'
      , '  Error.captureStackTrace(err, arguments.callee);'
      , '  stack = err.stack;'
      , '  Error.prepareStackTrace = original;'
      , '}'
      , 'return this.write.apply(this, ['
      , '    "'+ level +'"'
      , '  , '+ index
      , '  , stack'
      , '].concat(Array.prototype.slice.call(arguments)));'
    ];

  Logger.prototype[level] = new Function(capture.join(''));
});

/**
 * Start exporting some additional information like log levels etc. Most of the
 * details is already exposed but we might as well, expose all the things.
 */

/**
 * Versioning.
 *
 * @type {String}
 * @api public
 */

Logger.version = '0.0.7';

/**
 * Export the logging methods which are used to prefix the output.
 *
 * @type {Object}
 * @api public
 */

Logger.methods = methods;

/**
 * Log levels, type:level.
 *
 * @type {Object}
 * @api public
 */

Logger.levels = levels;
