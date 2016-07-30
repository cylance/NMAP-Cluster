var FactorRange, Range, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Range = require("./range");

p = require("../../core/properties");

FactorRange = (function(superClass) {
  extend(FactorRange, superClass);

  function FactorRange() {
    return FactorRange.__super__.constructor.apply(this, arguments);
  }

  FactorRange.prototype.type = 'FactorRange';

  FactorRange.define({
    offset: [p.Number, 0],
    factors: [p.Array, []],
    bounds: [p.Any],
    min_interval: [p.Any],
    max_interval: [p.Any]
  });

  FactorRange.internal({
    _bounds_as_factors: [p.Any],
    start: [p.Number],
    end: [p.Number]
  });

  FactorRange.prototype.initialize = function(attrs, options) {
    FactorRange.__super__.initialize.call(this, attrs, options);
    if ((this.get('bounds') != null) && this.get('bounds') !== 'auto') {
      this.set('_bounds_as_factors', this.get('bounds'));
    } else {
      this.set('_bounds_as_factors', this.get('factors'));
    }
    this._init();
    this.define_computed_property('min', function() {
      return this.get('start');
    }, false);
    this.add_dependencies('min', this, ['factors', 'offset']);
    this.define_computed_property('max', function() {
      return this.get('end');
    }, false);
    this.add_dependencies('max', this, ['factors', 'offset']);
    this.listenTo(this, 'change:factors', this._update_factors);
    return this.listenTo(this, 'change:offset', this._init);
  };

  FactorRange.prototype.reset = function() {
    return this._init();
  };

  FactorRange.prototype._update_factors = function() {
    this.set('_bounds_as_factors', this.get('factors'));
    return this._init();
  };

  FactorRange.prototype._init = function() {
    var end, factors, start;
    factors = this.get('factors');
    if ((this.get('bounds') != null) && this.get('bounds') !== 'auto') {
      factors = this.get('_bounds_as_factors');
      this.set('factors', factors);
    }
    start = 0.5 + this.get('offset');
    end = factors.length + start;
    this.set('start', start);
    this.set('end', end);
    if (this.get('bounds') != null) {
      return this.set('bounds', [start, end]);
    }
  };

  return FactorRange;

})(Range.Model);

module.exports = {
  Model: FactorRange
};
