# dev/null because logging to dev/null is webscale

Current build status: [![BuildStatus](https://secure.travis-ci.org/observing/devnull.png)](http://travis-ci.org/observing/devnull)

### Introduction

**devnull** is an feature rich logging library for Node.js. It was designed from the ground up to assist you during development and be powerful in production. It works just like the regular `console.log` statements you have in code, it uses the same formatter for logging to the terminal and has the same API. It's basically a cherry on the top :).

### Namespacing

The module automatically adds intelligent namespaces to all your log calls so you can easily track back those log statements in your code without having to remember where you placed them.

### Evented

The logger is build on top of the EventEmitter prototype. This allows you to handle all critical log messages in one central location. You might want to be notified when you application starts emitting critical errors. I know I would.

### Multiple transports

It supports different logging transports. You might want to log to the terminal in production but to MongoDB in production so you have a centralized location of all your logs. Each logger can have multiple transports.

![output preview](http://f.cl.ly/items/2t461h193a2D1t0f0k0q/Screen%20Shot%202011-12-15%20at%2022.29.14.PNG)

The image above is the result of the [example/logging.js](https://github.com/observing/devnull/blob/master/example/logging.js)

## Installation

The module is tested against Node.js 0.4 and 0.6 and can be installed using the Node.js Package Manager, also known as NPM.

```
npm install devnull
```

If you don't have NPM installed on your system you can get it at [http://npmjs.org](http://npmjs.org)

## API

### Initializing your logger

You can either initialize the default logger:

```js
var Logger = require('devnull')
  , logger = new Logger

logger.log('hello world')
logger.info('pew pew')
logger.error('oh noes, something goes terribly wrong')
```

Or configure a customized instance using the options argument:

```js
var Logger = require('devnull')
  , logger = new Logger({ timestamp: false })

logger.log('hello world')
...
```

The following options are available for configuring your customized instance:

- **env** either development of production. Default is based on the isAtty check of the process.stdout.
- **level** Only log statements that are less than this level will be logged. This allows you to filter out debug and log statements in production for example. Default is 8.
- **notification** At what log level should we start emitting events? Default is 1.
- **namespacing** At what log level should we start generating namespaces (uses callsite based stacktraces)? Defaults to 8.
- **timestamp** Should we prepend a timestamp to the log message? Logging is always done asynchronously so it might be that log messages do not appear in order. A timestamp helps you identify the order of the logs. Default is true.
- **pattern** The pattern for the timestamp. Everybody prefers it's own pattern. The pattern is based around the great [140bytes date entry](https://gist.github.com/1005948) but also allows functions to be called directly. Default is the util.log format that Node.js adopted.
- **base** Should the logger be configured with the base transport (log to process.stdout)? Default is true.

### .configure(env, fn)

Configure the module for different environments, it follows the same API as Express.js.

#### Arguments

_env_ (string) environment
_fn_ (function) callback

#### Example

```js
var Logger = require('devnull')
  , logger = new Logger

// runs always
logger.configure(function () {
  logger.log('running on the things')
})

// only runs in production
logger.configure('production', function () {
  logger.log('running in production')
})

logger.configure('development', function () {
  logger.log('running in development')
})
```

### .use(Transport, options)

Adds another transport to the logger. We currently ship 2 different transports inside the module (stream and mongodb).

These transports can be required using `require('devnull/transports/<transportname>')`.

#### Arguments

_Transport_ (Transport) a uninitialized transport instance.
_options_ (object) options for the transport.

#### Example

```js
var Logger = require('devnull')
  , logger = new Logger

// use the stream transport to log to a node.js stream
logger.use(require('devnull/transports/stream'), {
    stream: require('fs').createWriteStream('logger.log')
})

// also exports all transports :)
var transport = require('devnull/transports')

// and add mongodb to production logging
logger.configure('production', function () {
  logger.use(transport.mongodb, {
      url: 'mongodb://test:test@localhost:27017/myapp'
  })
})

logger.warning('hello world')
```

### .remove(Transport)

Removes all transports of that instance.

#### Arguments

_Transport_ (Transport) a transport

#### Example

```js
var Logger = require('devnull')
  , logger = new Logger({ base: false })
  , transports = require('devnull/transports')

logger.use(transports.stream)
logger.remove(transports.stream)
```

### .on(Event, fn)

Because the Logger is build upon the EventEmitter you can also start listening for log messages. This is set to warning levels by default in the configuration options. In addition to listening to the log message you can also listen to the events of the transports. These are prefixed with `transport:`. The following events are emitted:

- All the types (alert, critical etc)

And the transport events:

- `transport:failed(err)` transport failed to initialize
- `transport:error(err, log)` transport failed to write the log due to an error
- `transport:write(log)` transport written the log message

#### Arguments

_event_ (string) event to listen for
_fn_ (function) callback, receives _args_ (array), _stack_ (stack/callsite)

#### Example

```
var Logger = require('devnull')
  , logger = new Logger
  
logger.on('error', function (args, stack) {
 // args = foo bar, 1
 // stack = stack trace that we used to generate the namespace
 email('errors@pew.pew', 'error!', args);
})

logger.error('foo bar', 1)
```

### .ignore(file)

Ignore the output of a given file name, so everything that is logged in that
file is ignored.

#### Arguments

_env_ (string) file

#### Example

```js
var Logger = require('devnull')
  , logger = new Logger

logger.ignore('my_other_module.js');
```

### .unignore(file)

Unignore the file that you ignored above

#### Arguments

_env_ (string) file

#### Example

```js
var Logger = require('devnull')
  , logger = new Logger

logger.ignore('my_other_module.js');
logger.unignore('my_other_module.js');
```

### Logging methods and levels

The logger has the following methods available for logging. The (<number>) is the log level.

- alert (0)
- critical (1)
- error (2)
- warning (3)
- metric (4)
- notice (5)
- info (6)
- log (7)
- debug (8)
