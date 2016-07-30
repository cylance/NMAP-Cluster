var Asterisk, AsteriskView, Marker, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Marker = require("./marker");

AsteriskView = (function(superClass) {
  extend(AsteriskView, superClass);

  function AsteriskView() {
    return AsteriskView.__super__.constructor.apply(this, arguments);
  }

  AsteriskView.prototype._render = function(ctx, indices, arg) {
    var _angle, _size, i, j, len, r, r2, results, sx, sy;
    sx = arg.sx, sy = arg.sy, _size = arg._size, _angle = arg._angle;
    results = [];
    for (j = 0, len = indices.length; j < len; j++) {
      i = indices[j];
      if (isNaN(sx[i] + sy[i] + _size[i] + _angle[i])) {
        continue;
      }
      r = _size[i] / 2;
      r2 = r * 0.65;
      ctx.beginPath();
      ctx.translate(sx[i], sy[i]);
      if (_angle[i]) {
        ctx.rotate(_angle[i]);
      }
      ctx.moveTo(0, r);
      ctx.lineTo(0, -r);
      ctx.moveTo(-r, 0);
      ctx.lineTo(r, 0);
      ctx.moveTo(-r2, r2);
      ctx.lineTo(r2, -r2);
      ctx.moveTo(-r2, -r2);
      ctx.lineTo(r2, r2);
      if (_angle[i]) {
        ctx.rotate(-_angle[i]);
      }
      if (this.visuals.line.doit) {
        this.visuals.line.set_vectorize(ctx, i);
        ctx.stroke();
      }
      results.push(ctx.translate(-sx[i], -sy[i]));
    }
    return results;
  };

  return AsteriskView;

})(Marker.View);

Asterisk = (function(superClass) {
  extend(Asterisk, superClass);

  function Asterisk() {
    return Asterisk.__super__.constructor.apply(this, arguments);
  }

  Asterisk.prototype.default_view = AsteriskView;

  Asterisk.prototype.type = 'Asterisk';

  return Asterisk;

})(Marker.Model);

module.exports = {
  Model: Asterisk,
  View: AsteriskView
};
