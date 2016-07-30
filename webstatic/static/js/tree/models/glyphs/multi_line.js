var Glyph, MultiLine, MultiLineView, _, rbush,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

rbush = require("rbush");

Glyph = require("./glyph");

MultiLineView = (function(superClass) {
  extend(MultiLineView, superClass);

  function MultiLineView() {
    return MultiLineView.__super__.constructor.apply(this, arguments);
  }

  MultiLineView.prototype._index_data = function() {
    var i, index, k, pts, ref, x, xs, y, ys;
    index = rbush();
    pts = [];
    for (i = k = 0, ref = this._xs.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
      xs = (function() {
        var l, len, ref1, results;
        ref1 = this._xs[i];
        results = [];
        for (l = 0, len = ref1.length; l < len; l++) {
          x = ref1[l];
          if (!_.isNaN(x)) {
            results.push(x);
          }
        }
        return results;
      }).call(this);
      ys = (function() {
        var l, len, ref1, results;
        ref1 = this._ys[i];
        results = [];
        for (l = 0, len = ref1.length; l < len; l++) {
          y = ref1[l];
          if (!_.isNaN(y)) {
            results.push(y);
          }
        }
        return results;
      }).call(this);
      if (xs.length === 0) {
        continue;
      }
      pts.push([
        _.min(xs), _.min(ys), _.max(xs), _.max(ys), {
          'i': i
        }
      ]);
    }
    index.load(pts);
    return index;
  };

  MultiLineView.prototype._render = function(ctx, indices, arg) {
    var i, j, k, l, len, ref, ref1, results, sx, sxs, sy, sys;
    sxs = arg.sxs, sys = arg.sys;
    results = [];
    for (k = 0, len = indices.length; k < len; k++) {
      i = indices[k];
      ref = [sxs[i], sys[i]], sx = ref[0], sy = ref[1];
      this.visuals.line.set_vectorize(ctx, i);
      for (j = l = 0, ref1 = sx.length; 0 <= ref1 ? l < ref1 : l > ref1; j = 0 <= ref1 ? ++l : --l) {
        if (j === 0) {
          ctx.beginPath();
          ctx.moveTo(sx[j], sy[j]);
          continue;
        } else if (isNaN(sx[j]) || isNaN(sy[j])) {
          ctx.stroke();
          ctx.beginPath();
          continue;
        } else {
          ctx.lineTo(sx[j], sy[j]);
        }
      }
      results.push(ctx.stroke());
    }
    return results;
  };

  MultiLineView.prototype.draw_legend = function(ctx, x0, x1, y0, y1) {
    return this._generic_line_legend(ctx, x0, x1, y0, y1);
  };

  return MultiLineView;

})(Glyph.View);

MultiLine = (function(superClass) {
  extend(MultiLine, superClass);

  function MultiLine() {
    return MultiLine.__super__.constructor.apply(this, arguments);
  }

  MultiLine.prototype.default_view = MultiLineView;

  MultiLine.prototype.type = 'MultiLine';

  MultiLine.coords([['xs', 'ys']]);

  MultiLine.mixins(['line']);

  return MultiLine;

})(Glyph.Model);

module.exports = {
  Model: MultiLine,
  View: MultiLineView
};
