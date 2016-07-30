var CategoricalMapper, Glyph, GlyphView, Model, Renderer, _, bbox, bokehgl, p, rbush,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

rbush = require("rbush");

CategoricalMapper = require("../mappers/categorical_mapper");

Renderer = require("../renderers/renderer");

p = require("../../core/properties");

bbox = require("../../core/util/bbox");

Model = require("../../model");

bokehgl = require("./webgl/main");

GlyphView = (function(superClass) {
  extend(GlyphView, superClass);

  function GlyphView() {
    return GlyphView.__super__.constructor.apply(this, arguments);
  }

  GlyphView.prototype.initialize = function(options) {
    var Cls, ctx, ref;
    GlyphView.__super__.initialize.call(this, options);
    this.renderer = options.renderer;
    if (((ref = this.renderer) != null ? ref.plot_view : void 0) != null) {
      ctx = this.renderer.plot_view.canvas_view.ctx;
      if (ctx.glcanvas != null) {
        Cls = bokehgl[this.model.type + 'GLGlyph'];
        if (Cls) {
          return this.glglyph = new Cls(ctx.glcanvas.gl, this);
        }
      }
    }
  };

  GlyphView.prototype.render = function(ctx, indices, data) {
    if (this.mget("visible")) {
      ctx.beginPath();
      if (this.glglyph != null) {
        if (this._render_gl(ctx, indices, data)) {
          return;
        }
      }
      this._render(ctx, indices, data);
    }
  };

  GlyphView.prototype._render_gl = function(ctx, indices, mainglyph) {
    var dx, dy, ref, ref1, ref2, sx, sy, trans, wx, wy;
    wx = wy = 1;
    ref = this.renderer.map_to_screen([0 * wx, 1 * wx, 2 * wx], [0 * wy, 1 * wy, 2 * wy]), dx = ref[0], dy = ref[1];
    wx = 100 / Math.min(Math.max(Math.abs(dx[1] - dx[0]), 1e-12), 1e12);
    wy = 100 / Math.min(Math.max(Math.abs(dy[1] - dy[0]), 1e-12), 1e12);
    ref1 = this.renderer.map_to_screen([0 * wx, 1 * wx, 2 * wx], [0 * wy, 1 * wy, 2 * wy]), dx = ref1[0], dy = ref1[1];
    if (Math.abs((dx[1] - dx[0]) - (dx[2] - dx[1])) > 1e-6 || Math.abs((dy[1] - dy[0]) - (dy[2] - dy[1])) > 1e-6) {
      return false;
    }
    ref2 = [(dx[1] - dx[0]) / wx, (dy[1] - dy[0]) / wy], sx = ref2[0], sy = ref2[1];
    trans = {
      pixel_ratio: ctx.pixel_ratio,
      width: ctx.glcanvas.width,
      height: ctx.glcanvas.height,
      dx: dx[0] / sx,
      dy: dy[0] / sy,
      sx: sx,
      sy: sy
    };
    this.glglyph.draw(indices, mainglyph, trans);
    return true;
  };

  GlyphView.prototype.bounds = function() {
    var bb;
    if (this.index == null) {
      return bbox.empty();
    }
    bb = this.index.data.bbox;
    return this._bounds([[bb[0], bb[2]], [bb[1], bb[3]]]);
  };

  GlyphView.prototype.get_anchor_point = function(anchor, i, arg) {
    var sx, sy;
    sx = arg[0], sy = arg[1];
    switch (anchor) {
      case "center":
        return {
          x: this.scx(i, sx, sy),
          y: this.scy(i, sx, sy)
        };
      default:
        return null;
    }
  };

  GlyphView.prototype.scx = function(i) {
    return this.sx[i];
  };

  GlyphView.prototype.scy = function(i) {
    return this.sy[i];
  };

  GlyphView.prototype._xy_index = function() {
    var i, index, j, pts, ref, x, xx, y, yy;
    index = rbush();
    pts = [];
    if (this.renderer.xmapper instanceof CategoricalMapper.Model) {
      xx = this.renderer.xmapper.v_map_to_target(this._x, true);
    } else {
      xx = this._x;
    }
    if (this.renderer.ymapper instanceof CategoricalMapper.Model) {
      yy = this.renderer.ymapper.v_map_to_target(this._y, true);
    } else {
      yy = this._y;
    }
    for (i = j = 0, ref = xx.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      x = xx[i];
      if (isNaN(x) || !isFinite(x)) {
        continue;
      }
      y = yy[i];
      if (isNaN(y) || !isFinite(y)) {
        continue;
      }
      pts.push([
        x, y, x, y, {
          'i': i
        }
      ]);
    }
    index.load(pts);
    return index;
  };

  GlyphView.prototype.sdist = function(mapper, pts, spans, pts_location, dilate) {
    var d, halfspan, i, pt0, pt1, spt0, spt1;
    if (pts_location == null) {
      pts_location = "edge";
    }
    if (dilate == null) {
      dilate = false;
    }
    if (_.isString(pts[0])) {
      pts = mapper.v_map_to_target(pts);
    }
    if (pts_location === 'center') {
      halfspan = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = spans.length; j < len; j++) {
          d = spans[j];
          results.push(d / 2);
        }
        return results;
      })();
      pt0 = (function() {
        var j, ref, results;
        results = [];
        for (i = j = 0, ref = pts.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          results.push(pts[i] - halfspan[i]);
        }
        return results;
      })();
      pt1 = (function() {
        var j, ref, results;
        results = [];
        for (i = j = 0, ref = pts.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          results.push(pts[i] + halfspan[i]);
        }
        return results;
      })();
    } else {
      pt0 = pts;
      pt1 = (function() {
        var j, ref, results;
        results = [];
        for (i = j = 0, ref = pt0.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          results.push(pt0[i] + spans[i]);
        }
        return results;
      })();
    }
    spt0 = mapper.v_map_to_target(pt0);
    spt1 = mapper.v_map_to_target(pt1);
    if (dilate) {
      return (function() {
        var j, ref, results;
        results = [];
        for (i = j = 0, ref = spt0.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          results.push(Math.ceil(Math.abs(spt1[i] - spt0[i])));
        }
        return results;
      })();
    } else {
      return (function() {
        var j, ref, results;
        results = [];
        for (i = j = 0, ref = spt0.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          results.push(Math.abs(spt1[i] - spt0[i]));
        }
        return results;
      })();
    }
  };

  GlyphView.prototype.get_reference_point = function() {
    return void 0;
  };

  GlyphView.prototype.draw_legend = function(ctx, x0, x1, y0, y1) {
    return null;
  };

  GlyphView.prototype._generic_line_legend = function(ctx, x0, x1, y0, y1) {
    var ref, reference_point;
    reference_point = (ref = this.get_reference_point()) != null ? ref : 0;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x0, (y0 + y1) / 2);
    ctx.lineTo(x1, (y0 + y1) / 2);
    if (this.visuals.line.doit) {
      this.visuals.line.set_vectorize(ctx, reference_point);
      ctx.stroke();
    }
    return ctx.restore();
  };

  GlyphView.prototype._generic_area_legend = function(ctx, x0, x1, y0, y1) {
    var dh, dw, h, indices, ref, reference_point, sx0, sx1, sy0, sy1, w;
    reference_point = (ref = this.get_reference_point()) != null ? ref : 0;
    indices = [reference_point];
    w = Math.abs(x1 - x0);
    dw = w * 0.1;
    h = Math.abs(y1 - y0);
    dh = h * 0.1;
    sx0 = x0 + dw;
    sx1 = x1 - dw;
    sy0 = y0 + dh;
    sy1 = y1 - dh;
    if (this.visuals.fill.doit) {
      this.visuals.fill.set_vectorize(ctx, reference_point);
      ctx.fillRect(sx0, sy0, sx1 - sx0, sy1 - sy0);
    }
    if (this.visuals.line.doit) {
      ctx.beginPath();
      ctx.rect(sx0, sy0, sx1 - sx0, sy1 - sy0);
      this.visuals.line.set_vectorize(ctx, reference_point);
      return ctx.stroke();
    }
  };

  return GlyphView;

})(Renderer.View);

Glyph = (function(superClass) {
  extend(Glyph, superClass);

  function Glyph() {
    return Glyph.__super__.constructor.apply(this, arguments);
  }

  Glyph.define({
    visible: [p.Bool, true]
  });

  Glyph.internal({
    x_range_name: [p.String, 'default'],
    y_range_name: [p.String, 'default']
  });

  return Glyph;

})(Model);

module.exports = {
  Model: Glyph,
  View: GlyphView
};
