var $, _, waitForElement;

_ = require("underscore");

$ = require("jquery");

waitForElement = function(el, fn) {
  var handler, interval;
  handler = (function(_this) {
    return function() {
      if ($.contains(document.documentElement, el)) {
        clearInterval(interval);
        return fn();
      }
    };
  })(this);
  return interval = setInterval(handler, 50);
};

module.exports = {
  waitForElement: waitForElement
};
