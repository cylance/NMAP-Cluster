var CircleCross, CircleCrossView, Marker, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Marker = require("./marker");

CircleCrossView = (function(superClass) {
  extend(CircleCrossView, superClass);

  function CircleCrossView() {
    return CircleCrossView.__super__.constructor.apply(this, arguments);
  }

  CircleCrossView.prototype._render = function(ctx, indices, arg) {
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
      ctx.arc(0, 0, r, 0, 2 * Math.PI, false);
      if (this.visuals.fill.doit) {
        this.visuals.fill.set_vectorize(ctx, i);
        ctx.fill();
      }
      if (this.visuals.line.doit) {
        this.visuals.line.set_vectorize(ctx, i);
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
        ctx.stroke();
      }
      results.push(ctx.translate(-sx[i], -sy[i]));
    }
    return results;
  };

  return CircleCrossView;

})(Marker.View);

CircleCross = (function(superClass) {
  extend(CircleCross, superClass);

  function CircleCross() {
    return CircleCross.__super__.constructor.apply(this, arguments);
  }

  CircleCross.prototype.default_view = CircleCrossView;

  CircleCross.prototype.type = 'CircleCross';

  return CircleCross;

})(Marker.Model);

module.exports = {
  Model: CircleCross,
  View: CircleCrossView
};
