var Cross, CrossView, Marker, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Marker = require("./marker");

CrossView = (function(superClass) {
  extend(CrossView, superClass);

  function CrossView() {
    return CrossView.__super__.constructor.apply(this, arguments);
  }

  CrossView.prototype._render = function(ctx, indices, arg) {
    var _angle, _size, i, j, len, r, results, sx, sy;
    sx = arg.sx, sy = arg.sy, _size = arg._size, _angle = arg._angle;
    results = [];
    for (j = 0, len = indices.length; j < len; j++) {
      i = indices[j];
      if (isNaN(sx[i] + sy[i] + _size[i] + _angle[i])) {
        continue;
      }
      r = _size[i] / 2;
      ctx.beginPath();
      ctx.translate(sx[i], sy[i]);
      if (_angle[i]) {
        ctx.rotate(_angle[i]);
      }
      ctx.moveTo(0, r);
      ctx.lineTo(0, -r);
      ctx.moveTo(-r, 0);
      ctx.lineTo(r, 0);
      if (_angle[i]) {
        ctx.rotate(-_angle[i]);
      }
      if (this.visuals.line.doit) {
        this.visuals.line.set_vectorize(ctx, i);
        if (_angle[i]) {
          ctx.rotate(_angle[i]);
        }
        ctx.stroke();
        if (_angle[i]) {
          ctx.rotate(-_angle[i]);
        }
      }
      results.push(ctx.translate(-sx[i], -sy[i]));
    }
    return results;
  };

  return CrossView;

})(Marker.View);

Cross = (function(superClass) {
  extend(Cross, superClass);

  function Cross() {
    return Cross.__super__.constructor.apply(this, arguments);
  }

  Cross.prototype.default_view = CrossView;

  Cross.prototype.type = 'Cross';

  return Cross;

})(Marker.Model);

module.exports = {
  Model: Cross,
  View: CrossView
};
