/**!
 * dev/null
 * @copyright (c) 2011 observe.it (observe.it) <arnout@observe.com>
 * mit licensed
 */

var MongoDB = require('../transports').mongodb
  , mongodb = require('mongodb')
  , should = require('should')
  , url = fixtures.mongodb

describe('mongodb.transport', function () {
  it('should be an transport instance', function () {
    var mongo = new MongoDB

    mongo.should.be.an.instanceof(Transport)
  })

  it('should have mongodb as name', function () {
    var mongo = new MongoDB

    mongo.name.should.be.a('string')
    mongo.name.should.equal('mongodb')
  })

  it('should have defaults', function () {
    var mongo = new MongoDB

    mongo.collection.should.be.a('string')
    mongo.save.should.be.a('boolean')
    mongo.reconnect.should.be.a('boolean')
    mongo.pool.should.be.a('number')
    mongo.url.should.be.a('string')
  })

  it('should have all required functions', function () {
    var mongo = new MongoDB

    mongo.should.respondTo('collect')
    mongo.should.respondTo('open')
    mongo.should.respondTo('allocate')

    mongo.should.respondTo('write')
    mongo.should.respondTo('close')
  })

  describe('#allocate', function () {
    it('should connect to mongodb', function (next) {
      var mongo = new MongoDB({ url: url })

      mongo.allocate('log', function (err, db) {
        mongo.close()

        should.not.exist(err)

        next()
      })
    })

    it('should have the correct arguments', function (next) {
      var mongo = new MongoDB({ url: url })

      mongo.allocate('log', function (err, db) {
        mongo.close()

        should.not.exist(err)
        should.exist(db)
        should.exist(this)

        next()
      })
    })
  })

  describe('#write', function () {
    it('should not emit failures when writing', function (next) {
      var logger = new Logger({ base: false })

      logger.use(MongoDB, { url: url })

      logger.on('transport:error', function () {
        logger.remove(MongoDB)

        should.fail('should not have errors')
        next()
      })

      logger.on('transport:failure', function () {
        logger.remove(MongoDB)

        should.fail('should not have fail')
        next()
      })

      logger.on('transport:write', function () {
        logger.remove(MongoDB)
        next()
      })

      logger.log('hello world')
    })

    it('should send the correct data', function (next) {
      var logger = new Logger({ base: false })

      logger.use(MongoDB, { url: url })

      logger.on('transport:error', function () {
        logger.remove(MongoDB)

        should.fail('should not have errors')
        next()
      })

      logger.on('transport:failure', function () {
        logger.remove(MongoDB)

        should.fail('should not have fail')
        next()
      })

      logger.on('transport:write', function (log) {
        logger.remove(MongoDB)

        log.type.should.equal('log')
        should.exist(log.stamp) // hard to match against, so make sure it exists
        log.level.should.equal(Logger.levels[log.type])
        Array.isArray(log.args).should.be.true

        next()
      })

      logger.log('hello world')
    })
  })

  describe('#close', function () {
    it('should close and clean up the connection', function (next) {
      var logger = new Logger({ base: false })

      logger.use(MongoDB, { url: url })

      logger.on('transport:error', function () {
        logger.remove(MongoDB)

        should.fail('should not have errors')
        next()
      })

      logger.on('transport:failure', function () {
        logger.remove(MongoDB)

        should.fail('should not have fail')
        next()
      })

      logger.on('transport:write', function () {
        var instance = logger.transports[0]
        logger.remove(MongoDB)

        should.not.exist(instance.stream)
        next()
      })

      logger.log('hello world')
    })
  })
})
