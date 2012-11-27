/*globals it:true, describe:true, Transport:true, fixtures:true, Logger:true */
/**!
 * dev/null
 * @copyright (c) 2011 observe.it (observe.it) <arnout@observe.com>
 * mit licensed
 */

var Stream = require('../transports').stream;

describe('streamer.transport', function () {
  "use strict";

  it('should be an transport instance', function () {
    var streamy = new Stream();

    streamy.should.be.an.instanceof(Transport);
  });

  it('should have streamer as name', function () {
    var streamy = new Stream();

    streamy.name.should.be.a('string');
    streamy.name.should.equal('streamer');
  });

  it('should have all required functions', function () {
    var streamy = new Stream();

    streamy.should.respondTo('write');
    streamy.should.respondTo('close');
  });

  it('should work with different streams', function () {
    var writeStream = require('fs').createWriteStream('stream.log')
      , streamy = new Stream(null, {
            stream: writeStream
        });

    streamy.stream.should.equal(writeStream);
  });

  it('should default to stdout', function () {
    var streamy = new Stream();

    streamy.stream.should.equal(process.stdout);
  });

  describe("#write", function () {
    it('should trigger the write method of a stream', function () {
      var stream = fixtures.stream()
        , logger = new Logger({ base: false })
        , asserts = 0;

      logger.use(Stream, { stream: stream.dummy });
      stream.on('write', function (str) {
        ++asserts;
      });

      logger.log('testing testing');
      asserts.should.equal(1);
    });

    it('should write to writable streams', function () {
      var stream = fixtures.stream()
        , logger = new Logger({ base: false })
        , asserts = 0;

      stream.dummy.writable = false;

      logger.use(Stream, { stream: stream.dummy });
      stream.on('write', function (str) {
        ++asserts;
      });

      logger.log('testing testing');
      asserts.should.equal(0);
    });
  });

  describe('#close', function () {
    it('should trigger the end method of a stream', function () {
      var stream = fixtures.stream()
        , logger = new Logger({ base: false })
        , asserts = 0;

      logger.use(Stream, { stream: stream.dummy });
      stream.on('end', function (str) {
        ++asserts;
      });

      logger.remove(Stream);

      asserts.should.equal(1);
    });
  });
});
