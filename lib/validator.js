var _ = require('underscore');

module.exports = function(opts) {
  return function(val) {

    if (!val) { return false; }
    if (opts.isEmail && !(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(val))) {
      return false;
    }
    if (opts.isUsername && !(/^[a-zA-Z0-9]{4,20}$/.test(val))) {
      return false;
    }
    if (opts.length && opts.length.min && opts.length.min !== 0 && opts.length.max) {
      if (val.length < opts.length.min || val.length > opts.length.max) { return false; }
    }

    return true;
  };
};
