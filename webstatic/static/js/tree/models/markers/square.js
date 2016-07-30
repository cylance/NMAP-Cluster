var Marker, Square, SquareView, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Marker = require("./marker");

SquareView = (function(superClass) {
  extend(SquareView, superClass);

  function SquareView() {
    return SquareView.__super__.constructor.apply(this, arguments);
  }

  SquareView.prototype._render = function(ctx, indices, arg) {
    var _angle, _size, i, j, len, results, sx, sy;
    sx = arg.sx, sy = arg.sy, _size = arg._size, _angle = arg._angle;
    results = [];
    for (j = 0, len = indices.length; j < len; j++) {
      i = indices[j];
      if (isNaN(sx[i] + sy[i] + _size[i] + _angle[i])) {
        continue;
      }
      ctx.beginPath();
      ctx.translate(sx[i], sy[i]);
      if (_angle[i]) {
        ctx.rotate(_angle[i]);
      }
      ctx.rect(-_size[i] / 2, -_size[i] / 2, _size[i], _size[i]);
      if (_angle[i]) {
        ctx.rotate(-_angle[i]);
      }
      if (this.visuals.fill.doit) {
        this.visuals.fill.set_vectorize(ctx, i);
        ctx.fill();
      }
      if (this.visuals.line.doit) {
        this.visuals.line.set_vectorize(ctx, i);
        ctx.stroke();
      }
      results.push(ctx.translate(-sx[i], -sy[i]));
    }
    return results;
  };

  return SquareView;

})(Marker.View);

Square = (function(superClass) {
  extend(Square, superClass);

  function Square() {
    return Square.__super__.constructor.apply(this, arguments);
  }

  Square.prototype.default_view = SquareView;

  Square.prototype.type = 'Square';

  return Square;

})(Marker.Model);

module.exports = {
  Model: Square,
  View: SquareView
};
