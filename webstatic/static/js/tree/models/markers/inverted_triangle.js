var InvertedTriangle, InvertedTriangleView, Marker, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Marker = require("./marker");

InvertedTriangleView = (function(superClass) {
  extend(InvertedTriangleView, superClass);

  function InvertedTriangleView() {
    return InvertedTriangleView.__super__.constructor.apply(this, arguments);
  }

  InvertedTriangleView.prototype._render = function(ctx, indices, arg) {
    var _angle, _size, a, h, i, j, len, r, results, sx, sy;
    sx = arg.sx, sy = arg.sy, _size = arg._size, _angle = arg._angle;
    results = [];
    for (j = 0, len = indices.length; j < len; j++) {
      i = indices[j];
      if (isNaN(sx[i] + sy[i] + _size[i] + _angle[i])) {
        continue;
      }
      a = _size[i] * Math.sqrt(3) / 6;
      r = _size[i] / 2;
      h = _size[i] * Math.sqrt(3) / 2;
      ctx.beginPath();
      ctx.translate(sx[i], sy[i]);
      if (_angle[i]) {
        ctx.rotate(_angle[i]);
      }
      ctx.moveTo(-r, -a);
      ctx.lineTo(r, -a);
      ctx.lineTo(0, -a + h);
      if (_angle[i]) {
        ctx.rotate(-_angle[i]);
      }
      ctx.translate(-sx[i], -sy[i]);
      ctx.closePath();
      if (this.visuals.fill.doit) {
        this.visuals.fill.set_vectorize(ctx, i);
        ctx.fill();
      }
      if (this.visuals.line.doit) {
        this.visuals.line.set_vectorize(ctx, i);
        results.push(ctx.stroke());
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  return InvertedTriangleView;

})(Marker.View);

InvertedTriangle = (function(superClass) {
  extend(InvertedTriangle, superClass);

  function InvertedTriangle() {
    return InvertedTriangle.__super__.constructor.apply(this, arguments);
  }

  InvertedTriangle.prototype.default_view = InvertedTriangleView;

  InvertedTriangle.prototype.type = 'InvertedTriangle';

  return InvertedTriangle;

})(Marker.Model);

module.exports = {
  Model: InvertedTriangle,
  View: InvertedTriangleView
};
