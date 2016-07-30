var DiamondCross, DiamondCrossView, Marker, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Marker = require("./marker");

DiamondCrossView = (function(superClass) {
  extend(DiamondCrossView, superClass);

  function DiamondCrossView() {
    return DiamondCrossView.__super__.constructor.apply(this, arguments);
  }

  DiamondCrossView.prototype._render = function(ctx, indices, arg) {
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
      ctx.lineTo(r / 1.5, 0);
      ctx.lineTo(0, -r);
      ctx.lineTo(-r / 1.5, 0);
      if (_angle[i]) {
        ctx.rotate(-_angle[i]);
      }
      ctx.closePath();
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
        ctx.moveTo(-r / 1.5, 0);
        ctx.lineTo(r / 1.5, 0);
        if (_angle[i]) {
          ctx.rotate(-_angle[i]);
        }
        ctx.stroke();
      }
      results.push(ctx.translate(-sx[i], -sy[i]));
    }
    return results;
  };

  return DiamondCrossView;

})(Marker.View);

DiamondCross = (function(superClass) {
  extend(DiamondCross, superClass);

  function DiamondCross() {
    return DiamondCross.__super__.constructor.apply(this, arguments);
  }

  DiamondCross.prototype.default_view = DiamondCrossView;

  DiamondCross.prototype.type = 'DiamondCross';

  return DiamondCross;

})(Marker.Model);

module.exports = {
  Model: DiamondCross,
  View: DiamondCrossView
};
