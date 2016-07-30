var DataRange, DataRange1d, _, bbox, logger, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

DataRange = require("./data_range");

logger = require("../../core/logging").logger;

p = require("../../core/properties");

bbox = require("../../core/util/bbox");

DataRange1d = (function(superClass) {
  extend(DataRange1d, superClass);

  function DataRange1d() {
    return DataRange1d.__super__.constructor.apply(this, arguments);
  }

  DataRange1d.prototype.type = 'DataRange1d';

  DataRange1d.define({
    start: [p.Number],
    end: [p.Number],
    range_padding: [p.Number, 0.1],
    flipped: [p.Bool, false],
    follow: [p.String],
    follow_interval: [p.Number],
    default_span: [p.Number, 2],
    bounds: [p.Any],
    min_interval: [p.Any],
    max_interval: [p.Any]
  });

  DataRange1d.prototype.initialize = function(attrs, options) {
    DataRange1d.__super__.initialize.call(this, attrs, options);
    this.define_computed_property('min', function() {
      return Math.min(this.get('start'), this.get('end'));
    }, true);
    this.add_dependencies('min', this, ['start', 'end']);
    this.define_computed_property('max', function() {
      return Math.max(this.get('start'), this.get('end'));
    }, true);
    this.add_dependencies('max', this, ['start', 'end']);
    this.plot_bounds = {};
    this.have_updated_interactively = false;
    this._initial_start = this.get('start');
    this._initial_end = this.get('end');
    this._initial_range_padding = this.get('range_padding');
    this._initial_follow = this.get('follow');
    this._initial_follow_interval = this.get('follow_interval');
    return this._initial_default_span = this.get('default_span');
  };

  DataRange1d.prototype.computed_renderers = function() {
    var all_renderers, i, j, len, len1, names, plot, r, ref, renderers, rs;
    names = this.get('names');
    renderers = this.get('renderers');
    if (renderers.length === 0) {
      ref = this.get('plots');
      for (i = 0, len = ref.length; i < len; i++) {
        plot = ref[i];
        all_renderers = plot.get('renderers');
        rs = (function() {
          var j, len1, results;
          results = [];
          for (j = 0, len1 = all_renderers.length; j < len1; j++) {
            r = all_renderers[j];
            if (r.type === "GlyphRenderer") {
              results.push(r);
            }
          }
          return results;
        })();
        renderers = renderers.concat(rs);
      }
    }
    if (names.length > 0) {
      renderers = (function() {
        var j, len1, results;
        results = [];
        for (j = 0, len1 = renderers.length; j < len1; j++) {
          r = renderers[j];
          if (names.indexOf(r.get('name')) >= 0) {
            results.push(r);
          }
        }
        return results;
      })();
    }
    logger.debug("computed " + renderers.length + " renderers for DataRange1d " + this.id);
    for (j = 0, len1 = renderers.length; j < len1; j++) {
      r = renderers[j];
      logger.trace(" - " + r.type + " " + r.id);
    }
    return renderers;
  };

  DataRange1d.prototype._compute_plot_bounds = function(renderers, bounds) {
    var i, len, r, result;
    result = new bbox.empty();
    for (i = 0, len = renderers.length; i < len; i++) {
      r = renderers[i];
      if (bounds[r.id] != null) {
        result = bbox.union(result, bounds[r.id]);
      }
    }
    return result;
  };

  DataRange1d.prototype._compute_min_max = function(plot_bounds, dimension) {
    var k, max, min, overall, ref, v;
    overall = new bbox.empty();
    for (k in plot_bounds) {
      v = plot_bounds[k];
      overall = bbox.union(overall, v);
    }
    ref = overall[dimension], min = ref[0], max = ref[1];
    return [min, max];
  };

  DataRange1d.prototype._compute_range = function(min, max) {
    var center, end, follow_interval, follow_sign, range_padding, ref, ref1, ref2, span, start;
    range_padding = this.get('range_padding');
    if ((range_padding != null) && range_padding > 0) {
      if (max === min) {
        span = this.get('default_span');
      } else {
        span = (max - min) * (1 + range_padding);
      }
      center = (max + min) / 2.0;
      ref = [center - span / 2.0, center + span / 2.0], start = ref[0], end = ref[1];
    } else {
      ref1 = [min, max], start = ref1[0], end = ref1[1];
    }
    follow_sign = +1;
    if (this.get('flipped')) {
      ref2 = [end, start], start = ref2[0], end = ref2[1];
      follow_sign = -1;
    }
    follow_interval = this.get('follow_interval');
    if ((follow_interval != null) && Math.abs(start - end) > follow_interval) {
      if (this.get('follow') === 'start') {
        end = start + follow_sign * follow_interval;
      } else if (this.get('follow') === 'end') {
        start = end - follow_sign * follow_interval;
      }
    }
    return [start, end];
  };

  DataRange1d.prototype.update = function(bounds, dimension, bounds_id) {
    var _end, _start, end, max, min, new_range, ref, ref1, ref2, renderers, start;
    if (this.have_updated_interactively) {
      return;
    }
    renderers = this.computed_renderers();
    this.plot_bounds[bounds_id] = this._compute_plot_bounds(renderers, bounds);
    ref = this._compute_min_max(this.plot_bounds, dimension), min = ref[0], max = ref[1];
    ref1 = this._compute_range(min, max), start = ref1[0], end = ref1[1];
    if (this._initial_start != null) {
      start = this._initial_start;
    }
    if (this._initial_end != null) {
      end = this._initial_end;
    }
    ref2 = [this.get('start'), this.get('end')], _start = ref2[0], _end = ref2[1];
    if (start !== _start || end !== _end) {
      new_range = {};
      if (start !== _start) {
        new_range.start = start;
      }
      if (end !== _end) {
        new_range.end = end;
      }
      this.set(new_range);
    }
    if (this.get('bounds') === 'auto') {
      return this.set('bounds', [start, end]);
    }
  };

  DataRange1d.prototype.reset = function() {
    this.have_updated_interactively = false;
    return this.set({
      range_padding: this._initial_range_padding,
      follow: this._initial_follow,
      follow_interval: this._initial_follow_interval,
      default_span: this._initial_default_span
    });
  };

  return DataRange1d;

})(DataRange.Model);

module.exports = {
  Model: DataRange1d
};
