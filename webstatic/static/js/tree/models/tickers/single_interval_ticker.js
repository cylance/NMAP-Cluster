var ContinuousTicker, SingleIntervalTicker, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

ContinuousTicker = require("./continuous_ticker");

p = require("../../core/properties");

SingleIntervalTicker = (function(superClass) {
  extend(SingleIntervalTicker, superClass);

  function SingleIntervalTicker() {
    return SingleIntervalTicker.__super__.constructor.apply(this, arguments);
  }

  SingleIntervalTicker.prototype.type = 'SingleIntervalTicker';

  SingleIntervalTicker.define({
    interval: [p.Number]
  });

  SingleIntervalTicker.prototype.initialize = function(attrs, options) {
    SingleIntervalTicker.__super__.initialize.call(this, attrs, options);
    this.define_computed_property('min_interval', function() {
      return this.get('interval');
    }, true);
    this.add_dependencies('min_interval', this, ['interval']);
    this.define_computed_property('max_interval', function() {
      return this.get('interval');
    }, true);
    return this.add_dependencies('max_interval', this, ['interval']);
  };

  SingleIntervalTicker.prototype.get_interval = function(data_low, data_high, n_desired_ticks) {
    return this.get('interval');
  };

  return SingleIntervalTicker;

})(ContinuousTicker.Model);

module.exports = {
  Model: SingleIntervalTicker
};
