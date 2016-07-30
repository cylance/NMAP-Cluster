var Marker, SquareX, SquareXView, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Marker = require("./marker");

SquareXView = (function(superClass) {
  extend(SquareXView, superClass);

  function SquareXView() {
    return SquareXView.__super__.constructor.apply(this, arguments);
  }

  SquareXView.prototype._render = function(ctx, indices, arg) {
    var _angle, _size, i, j, len, r, results, sx, sy;
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
        r = _size[i] / 2;
        if (_angle[i]) {
          ctx.rotate(_angle[i]);
        }
        ctx.moveTo(-r, r);
        ctx.lineTo(r, -r);
        ctx.moveTo(-r, -r);
        ctx.lineTo(r, r);
        if (_angle[i]) {
          ctx.rotate(-_angle[i]);
        }
        ctx.stroke();
      }
      results.push(ctx.translate(-sx[i], -sy[i]));
    }
    return results;
  };

  return SquareXView;

})(Marker.View);

SquareX = (function(superClass) {
  extend(SquareX, superClass);

  function SquareX() {
    return SquareX.__super__.constructor.apply(this, arguments);
  }

  SquareX.prototype.default_view = SquareXView;

  SquareX.prototype.type = 'SquareX';

  return SquareX;

})(Marker.Model);

module.exports = {
  Model: SquareX,
  View: SquareXView
};
