"use strict";

/**!
 * dev/null
 * @copyright (c) 2011 observe.it (observe.it) <arnout@observe.com>
 * mit licensed
 */

var Transport = require('./transport')
  , mongodb = require('mongodb')
  , os = require('os');

var MongoDB = module.exports = function mongo (logger, options) {
  // properties that could be overriden
  this.collection = 'log';
  this.save = false;
  this.reconnect = true;
  this.pool = 10;
  this.url = mongodb.Db.DEFAULT_URL;
  this.machine = os.hostname();
  this.application = process.title || process.pid + ':pid';

  Transport.apply(this, arguments);

  // privates
  this.name = 'mongodb';
  this.queue = [];
  this.connecting = false;
  this.stream = null;
};

/**
 * Inherit from `Transport`.
 */

require('util').inherits(MongoDB, Transport);

/**
 * Fetches the correct collection.
 *
 * @param {Error} err error from the connection
 * @param {MongoDB} db Database
 * @param {String} collection collection
 * @param {Function} fn callback
 * @api private
 */

MongoDB.prototype.collect = function collect(err, db, collection, fn) {
  if (err) return fn.call(db, err, null);

  db.collection(collection, function collection (err, col) {
    fn.call(col, err, db);
  });
};

/**
 * Called once the database opens.
 *
 * @param {Error} err Connection error
 * @param {MongoDB} mongo Mongodb connection stream
 * @api private
 */

MongoDB.prototype.open = function open (err, connection) {
  var self = this;

  if (!err) {
    this.stream = connection;

    // handle uncaught errors, close the connection so we can automatically
    // setup a new one again
    connection.on('error', function uncaughtError (err) {
      self.stream.close();
      self.stream = null;
      self.connecting = false;
    });
  } else {
    this.logger.emit('transport:failed', err);
  }

  // no longer connecting
  this.connecting = false;

  // start the whole collect thingy
  this.queue.splice(0).forEach(function queue (request) {
    self.collect.call(self.stream
      , err
      , self.stream
      , request.collection
      , request.fn
    );
  });
};

/**
 * Fetches a working connection.
 *
 * @param {String} colection
 * @param {Function} fn callback
 * @api private
 */

MongoDB.prototype.allocate = function allocate (collection, fn) {
  // fast case
  if (this.stream)
    return this.collect.call(this.stream, null, this.stream, collection, fn);

  // no stream so we will queue up requests if needed
  var request = {
      collection: collection
    , fn: fn
  };

  // we are already connecting, so push this connection request in the queue
  if (this.connecting) return this.queue.push(request);

  // not connecting, we should probably start one then. :D
  mongodb.connect(this.url, {
      auto_reconnect: this.reconnect
    , poolSize: this.pool
  }, this.open.bind(this));

  // we are opening the connection
  this.connecting = true;
  this.queue.push(request);
};

/**
 * Try to write out the data to the stream.
 *
 * @param {String} type
 * @param {String} namespace
 * @api public
 */

MongoDB.prototype.write = function write (type, namespace, args) {
  var self = this;

  this.allocate(this.collection, function allocate (err, db) {
    var log = {
        type: type
      , machine: self.machine
      , app: self.application
      , stamp: new Date
      , level: self.logger.levels[type]
      , args: args
    };

    // optional logging
    if (namespace && namespace.length) log.namespace = namespace;

    // unable to log, so we emit the to-log object so the user can handle it off
    // them selfs.
    if (err) return self.logger.emit('transport:error', err, log);

    // attempt to add the log to the db
    this.insert(log, { safe: self.safe }, function insert (err) {
      if (err) return self.logger.emit('transport:error', err, log);

      self.logger.emit('transport:write', log);
    });
  });
};

/**
 * Shutdown the transport.
 *
 * @api private
 */

MongoDB.prototype.close = function close () {
  if (!this.stream) return this;

  this.stream.close();
  this.stream = null;
};
