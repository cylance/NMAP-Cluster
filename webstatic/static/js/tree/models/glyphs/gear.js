var Bezier, Gear, GearUtils, GearView, Glyph, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Glyph = require("./glyph");

GearUtils = require("gear_utils");

p = require("../../core/properties");

Bezier = require("../../util/bezier");

GearView = (function(superClass) {
  extend(GearView, superClass);

  function GearView() {
    return GearView.__super__.constructor.apply(this, arguments);
  }

  GearView.prototype._index_data = function() {
    return this._xy_index();
  };

  GearView.prototype._map_data = function() {
    return this.smodule = this.sdist(this.renderer.xmapper, this._x, this._module, 'edge');
  };

  GearView.prototype._render = function(ctx, indices, arg) {
    var M, _angle, _internal, _pressure_angle, _shaft_size, _teeth, fn, i, j, k, l, len, pitch_radius, ref, ref1, rim_radius, rot, seq, seq0, shaft_radius, smodule, sx, sy, x, y;
    sx = arg.sx, sy = arg.sy, smodule = arg.smodule, _angle = arg._angle, _teeth = arg._teeth, _pressure_angle = arg._pressure_angle, _shaft_size = arg._shaft_size, _internal = arg._internal;
    for (k = 0, len = indices.length; k < len; k++) {
      i = indices[k];
      if (isNaN(sx[i] + sy[i] + _angle[i] + smodule[i] + _teeth[i] + _pressure_angle[i] + _shaft_size[i] + _internal[i])) {
        continue;
      }
      pitch_radius = smodule[i] * _teeth[i] / 2;
      if (_internal[i]) {
        fn = GearUtils.create_internal_gear_tooth;
      } else {
        fn = GearUtils.create_gear_tooth;
      }
      seq0 = fn(smodule[i], _teeth[i], _pressure_angle[i]);
      ref = seq0.slice(0, 3), M = ref[0], x = ref[1], y = ref[2];
      seq = seq0.slice(3);
      ctx.save();
      ctx.translate(sx[i], sy[i]);
      ctx.rotate(_angle[i]);
      ctx.beginPath();
      rot = 2 * Math.PI / _teeth[i];
      ctx.moveTo(x, y);
      for (j = l = 0, ref1 = _teeth[i]; 0 <= ref1 ? l < ref1 : l > ref1; j = 0 <= ref1 ? ++l : --l) {
        this._render_seq(ctx, seq);
        ctx.rotate(rot);
      }
      ctx.closePath();
      if (_internal[i]) {
        rim_radius = pitch_radius + 2.75 * smodule[i];
        ctx.moveTo(rim_radius, 0);
        ctx.arc(0, 0, rim_radius, 0, 2 * Math.PI, true);
      } else if (_shaft_size[i] > 0) {
        shaft_radius = pitch_radius * _shaft_size[i];
        ctx.moveTo(shaft_radius, 0);
        ctx.arc(0, 0, shaft_radius, 0, 2 * Math.PI, true);
      }
      if (this.visuals.fill.doit) {
        this.visuals.fill.set_vectorize(ctx, i);
        ctx.fill();
      }
      if (this.visuals.line.doit) {
        this.visuals.line.set_vectorize(ctx, i);
        ctx.stroke();
      }
      ctx.restore();
    }
  };

  GearView.prototype._render_seq = function(ctx, seq) {
    var c, cx0, cx1, cy0, cy1, i, k, large_arc, len, px, py, ref, ref1, ref10, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, rx, ry, segments, sweep, x, x_rotation, y;
    i = 0;
    while (i < seq.length) {
      if (_.isString(seq[i])) {
        c = seq[i];
        i += 1;
      }
      switch (c) {
        case "M":
          ref = seq.slice(i, i + 2), x = ref[0], y = ref[1];
          ctx.moveTo(x, y);
          ref1 = [x, y], px = ref1[0], py = ref1[1];
          i += 2;
          break;
        case "L":
          ref2 = seq.slice(i, i + 2), x = ref2[0], y = ref2[1];
          ctx.lineTo(x, y);
          ref3 = [x, y], px = ref3[0], py = ref3[1];
          i += 2;
          break;
        case "C":
          ref4 = seq.slice(i, i + 6), cx0 = ref4[0], cy0 = ref4[1], cx1 = ref4[2], cy1 = ref4[3], x = ref4[4], y = ref4[5];
          ctx.bezierCurveTo(cx0, cy0, cx1, cy1, x, y);
          ref5 = [x, y], px = ref5[0], py = ref5[1];
          i += 6;
          break;
        case "Q":
          ref6 = seq.slice(i, i + 4), cx0 = ref6[0], cy0 = ref6[1], x = ref6[2], y = ref6[3];
          ctx.quadraticCurveTo(cx0, cy0, x, y);
          ref7 = [x, y], px = ref7[0], py = ref7[1];
          i += 4;
          break;
        case "A":
          ref8 = seq.slice(i, i + 7), rx = ref8[0], ry = ref8[1], x_rotation = ref8[2], large_arc = ref8[3], sweep = ref8[4], x = ref8[5], y = ref8[6];
          segments = Bezier.arc_to_bezier(px, py, rx, ry, -x_rotation, large_arc, 1 - sweep, x, y);
          for (k = 0, len = segments.length; k < len; k++) {
            ref9 = segments[k], cx0 = ref9[0], cy0 = ref9[1], cx1 = ref9[2], cy1 = ref9[3], x = ref9[4], y = ref9[5];
            ctx.bezierCurveTo(cx0, cy0, cx1, cy1, x, y);
          }
          ref10 = [x, y], px = ref10[0], py = ref10[1];
          i += 7;
          break;
        default:
          throw new Error("unexpected command: " + c);
      }
    }
  };

  GearView.prototype.draw_legend = function(ctx, x0, x1, y0, y1) {
    return this._generic_area_legend(ctx, x0, x1, y0, y1);
  };

  return GearView;

})(Glyph.View);

Gear = (function(superClass) {
  extend(Gear, superClass);

  function Gear() {
    return Gear.__super__.constructor.apply(this, arguments);
  }

  Gear.prototype.default_view = GearView;

  Gear.prototype.type = 'Gear';

  Gear.coords([['x', 'y']]);

  Gear.mixins(['line', 'fill']);

  Gear.define({
    angle: [p.AngleSpec, 0],
    module: [p.NumberSpec, null],
    pressure_angle: [p.NumberSpec, 20],
    shaft_size: [p.NumberSpec, 0.3],
    teeth: [p.NumberSpec, null],
    internal: [p.NumberSpec, false]
  });

  return Gear;

})(Glyph.Model);

module.exports = {
  Model: Gear,
  View: GearView
};
