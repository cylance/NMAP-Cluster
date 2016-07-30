var CompositeTicker, ContinuousTicker, _, argmin, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

ContinuousTicker = require("./continuous_ticker");

argmin = require("./util").argmin;

p = require("../../core/properties");

CompositeTicker = (function(superClass) {
  extend(CompositeTicker, superClass);

  function CompositeTicker() {
    return CompositeTicker.__super__.constructor.apply(this, arguments);
  }

  CompositeTicker.prototype.type = 'CompositeTicker';

  CompositeTicker.define({
    tickers: [p.Array, []]
  });

  CompositeTicker.prototype.initialize = function(attrs, options) {
    var tickers;
    CompositeTicker.__super__.initialize.call(this, attrs, options);
    tickers = this.get('tickers');
    this.define_computed_property('min_intervals', function() {
      return _.invoke(tickers, 'get_min_interval');
    }, true);
    this.add_dependencies('min_intervals', this, ['tickers']);
    this.define_computed_property('max_intervals', function() {
      return _.invoke(tickers, 'get_max_interval');
    }, true);
    this.add_dependencies('max_intervals', this, ['tickers']);
    this.define_computed_property('min_interval', function() {
      return _.first(this.get('min_intervals'));
    }, true);
    this.add_dependencies('min_interval', this, ['min_intervals']);
    this.define_computed_property('max_interval', function() {
      return _.first(this.get('max_intervals'));
    }, true);
    return this.add_dependencies('max_interval', this, ['max_interval']);
  };

  CompositeTicker.prototype.get_best_ticker = function(data_low, data_high, desired_n_ticks) {
    var best_index, best_ticker, best_ticker_ndx, data_range, errors, ideal_interval, intervals, ticker_ndxs;
    data_range = data_high - data_low;
    ideal_interval = this.get_ideal_interval(data_low, data_high, desired_n_ticks);
    ticker_ndxs = [_.sortedIndex(this.get('min_intervals'), ideal_interval) - 1, _.sortedIndex(this.get('max_intervals'), ideal_interval)];
    intervals = [this.get('min_intervals')[ticker_ndxs[0]], this.get('max_intervals')[ticker_ndxs[1]]];
    errors = intervals.map(function(interval) {
      return Math.abs(desired_n_ticks - (data_range / interval));
    });
    best_index = argmin(errors);
    if (best_index === Infinity) {
      return this.get('tickers')[0];
    }
    best_ticker_ndx = ticker_ndxs[best_index];
    best_ticker = this.get('tickers')[best_ticker_ndx];
    return best_ticker;
  };

  CompositeTicker.prototype.get_interval = function(data_low, data_high, desired_n_ticks) {
    var best_ticker;
    best_ticker = this.get_best_ticker(data_low, data_high, desired_n_ticks);
    return best_ticker.get_interval(data_low, data_high, desired_n_ticks);
  };

  CompositeTicker.prototype.get_ticks_no_defaults = function(data_low, data_high, desired_n_ticks) {
    var best_ticker, ticks;
    best_ticker = this.get_best_ticker(data_low, data_high, desired_n_ticks);
    ticks = best_ticker.get_ticks_no_defaults(data_low, data_high, desired_n_ticks);
    return ticks;
  };

  return CompositeTicker;

})(ContinuousTicker.Model);

module.exports = {
  Model: CompositeTicker
};
