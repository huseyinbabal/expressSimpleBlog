"use strict";

var Logger = require('../')
  , logger = new Logger;

function namespacing () {
  logger.debug('debug message');
  logger.log('logging an array', []);
  logger.info('info message with object', {});
  logger.notice('sending a notice', 1, 2, 3);
  logger.metric('already send', logger.calls, 'logs');
  logger.warning('odear, we are going to break something');
  logger.error('something bad happend');
  logger.critical('oh FUCK the system is melting down');
  logger.alert('call the police!');
}

// used for namespacing the stuff
setTimeout(function showoff () {
  namespacing();
}, 100);

// example for non namespaced stuff
logger.log('hello world');

logger.log('userdefinednamespace', 'one word without spaces is a user namespace');

// listen for emitted errors
logger.on('error', function (args, stack) {
  console.log('There was an error logged at line: ' + (stack
    ? stack[0].getLineNumber()
    : 'unknown'
  ));
});

