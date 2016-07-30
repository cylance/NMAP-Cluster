var Backbone, BokehView, Model, Renderer, RendererView, VISUALS, _, _ContextProperties, _Fill, _Line, _Text, array_max, color2rgba, logger, mixins, p, proj4, toProjection,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

proj4 = require("proj4");

toProjection = proj4.defs('GOOGLE');

Backbone = require("backbone");

BokehView = require("../../core/bokeh_view");

color2rgba = require("../../core/util/color").color2rgba;

logger = require("../../core/logging").logger;

p = require("../../core/properties");

mixins = require("../../core/property_mixins");

array_max = require("../../core/util/math").array_max;

Model = require("../../model");

_ContextProperties = (function(superClass) {
  extend(_ContextProperties, superClass);

  function _ContextProperties(attrs, options) {
    var attr, do_spec, j, len, obj, prefix, ref;
    if (attrs.prefix == null) {
      attrs.prefix = "";
    }
    _ContextProperties.__super__.constructor.call(this, attrs, options);
    this.cache = {};
    obj = this.get('obj');
    prefix = this.get('prefix');
    do_spec = obj.properties[prefix + this.do_attr].spec;
    this.doit = !_.isNull(do_spec.value);
    ref = this.attrs;
    for (j = 0, len = ref.length; j < len; j++) {
      attr = ref[j];
      this[attr] = obj.properties[prefix + attr];
    }
  }

  _ContextProperties.prototype.warm_cache = function(source) {
    var attr, j, len, obj, prefix, prop, ref, results;
    ref = this.attrs;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      attr = ref[j];
      obj = this.get('obj');
      prefix = this.get('prefix');
      prop = obj.properties[prefix + attr];
      if (!_.isUndefined(prop.spec.value)) {
        results.push(this.cache[attr] = prop.spec.value);
      } else {
        results.push(this.cache[attr + "_array"] = prop.array(source));
      }
    }
    return results;
  };

  _ContextProperties.prototype.cache_select = function(attr, i) {
    var obj, prefix, prop;
    obj = this.get('obj');
    prefix = this.get('prefix');
    prop = obj.properties[prefix + attr];
    if (!_.isUndefined(prop.spec.value)) {
      return this.cache[attr] = prop.spec.value;
    } else {
      return this.cache[attr] = this.cache[attr + "_array"][i];
    }
  };

  return _ContextProperties;

})(Backbone.Model);

_Line = (function(superClass) {
  extend(_Line, superClass);

  function _Line() {
    return _Line.__super__.constructor.apply(this, arguments);
  }

  _Line.prototype.attrs = _.keys(mixins.line());

  _Line.prototype.do_attr = "line_color";

  _Line.prototype.set_value = function(ctx) {
    ctx.strokeStyle = this.line_color.value();
    ctx.globalAlpha = this.line_alpha.value();
    ctx.lineWidth = this.line_width.value();
    ctx.lineJoin = this.line_join.value();
    ctx.lineCap = this.line_cap.value();
    ctx.setLineDash(this.line_dash.value());
    return ctx.setLineDashOffset(this.line_dash_offset.value());
  };

  _Line.prototype.set_vectorize = function(ctx, i) {
    this.cache_select("line_color", i);
    if (ctx.strokeStyle !== this.cache.line_color) {
      ctx.strokeStyle = this.cache.line_color;
    }
    this.cache_select("line_alpha", i);
    if (ctx.globalAlpha !== this.cache.line_alpha) {
      ctx.globalAlpha = this.cache.line_alpha;
    }
    this.cache_select("line_width", i);
    if (ctx.lineWidth !== this.cache.line_width) {
      ctx.lineWidth = this.cache.line_width;
    }
    this.cache_select("line_join", i);
    if (ctx.lineJoin !== this.cache.line_join) {
      ctx.lineJoin = this.cache.line_join;
    }
    this.cache_select("line_cap", i);
    if (ctx.lineCap !== this.cache.line_cap) {
      ctx.lineCap = this.cache.line_cap;
    }
    this.cache_select("line_dash", i);
    if (ctx.getLineDash() !== this.cache.line_dash) {
      ctx.setLineDash(this.cache.line_dash);
    }
    this.cache_select("line_dash_offset", i);
    if (ctx.getLineDashOffset() !== this.cache.line_dash_offset) {
      return ctx.setLineDashOffset(this.cache.line_dash_offset);
    }
  };

  _Line.prototype.color_value = function() {
    var color;
    color = color2rgba(this.line_color.value(), this.line_alpha.value());
    return "rgba(" + (color[0] * 255) + "," + (color[1] * 255) + "," + (color[2] * 255) + "," + color[3] + ")";
  };

  return _Line;

})(_ContextProperties);

_Fill = (function(superClass) {
  extend(_Fill, superClass);

  function _Fill() {
    return _Fill.__super__.constructor.apply(this, arguments);
  }

  _Fill.prototype.attrs = _.keys(mixins.fill());

  _Fill.prototype.do_attr = "fill_color";

  _Fill.prototype.set_value = function(ctx) {
    ctx.fillStyle = this.fill_color.value();
    return ctx.globalAlpha = this.fill_alpha.value();
  };

  _Fill.prototype.set_vectorize = function(ctx, i) {
    this.cache_select("fill_color", i);
    if (ctx.fillStyle !== this.cache.fill_color) {
      ctx.fillStyle = this.cache.fill_color;
    }
    this.cache_select("fill_alpha", i);
    if (ctx.globalAlpha !== this.cache.fill_alpha) {
      return ctx.globalAlpha = this.cache.fill_alpha;
    }
  };

  _Fill.prototype.color_value = function() {
    var color;
    color = color2rgba(this.fill_color.value(), this.fill_alpha.value());
    return "rgba(" + (color[0] * 255) + "," + (color[1] * 255) + "," + (color[2] * 255) + "," + color[3] + ")";
  };

  return _Fill;

})(_ContextProperties);

_Text = (function(superClass) {
  extend(_Text, superClass);

  function _Text() {
    return _Text.__super__.constructor.apply(this, arguments);
  }

  _Text.prototype.attrs = _.keys(mixins.text());

  _Text.prototype.do_attr = "text_color";

  _Text.prototype.cache_select = function(name, i) {
    var val;
    if (name === "font") {
      val = _Text.__super__.cache_select.call(this, "text_font_style", i) + " " + _Text.__super__.cache_select.call(this, "text_font_size", i) + " " + _Text.__super__.cache_select.call(this, "text_font", i);
      return this.cache.font = val;
    } else {
      return _Text.__super__.cache_select.call(this, name, i);
    }
  };

  _Text.prototype.font_value = function() {
    var font, font_size, font_style;
    font = this.text_font.value();
    font_size = this.text_font_size.value();
    font_style = this.text_font_style.value();
    return font_style + " " + font_size + " " + font;
  };

  _Text.prototype.color_value = function() {
    var color;
    color = color2rgba(this.text_color.value(), this.text_alpha.value());
    return "rgba(" + (color[0] * 255) + "," + (color[1] * 255) + "," + (color[2] * 255) + "," + color[3] + ")";
  };

  _Text.prototype.set_value = function(ctx) {
    ctx.font = this.font_value();
    ctx.fillStyle = this.text_color.value();
    ctx.globalAlpha = this.text_alpha.value();
    ctx.textAlign = this.text_align.value();
    return ctx.textBaseline = this.text_baseline.value();
  };

  _Text.prototype.set_vectorize = function(ctx, i) {
    this.cache_select("font", i);
    if (ctx.font !== this.cache.font) {
      ctx.font = this.cache.font;
    }
    this.cache_select("text_color", i);
    if (ctx.fillStyle !== this.cache.text_color) {
      ctx.fillStyle = this.cache.text_color;
    }
    this.cache_select("text_alpha", i);
    if (ctx.globalAlpha !== this.cache.text_alpha) {
      ctx.globalAlpha = this.cache.text_alpha;
    }
    this.cache_select("text_align", i);
    if (ctx.textAlign !== this.cache.text_align) {
      ctx.textAlign = this.cache.text_align;
    }
    this.cache_select("text_baseline", i);
    if (ctx.textBaseline !== this.cache.text_baseline) {
      return ctx.textBaseline = this.cache.text_baseline;
    }
  };

  return _Text;

})(_ContextProperties);

VISUALS = {
  line: _Line,
  fill: _Fill,
  text: _Text
};

RendererView = (function(superClass) {
  extend(RendererView, superClass);

  function RendererView() {
    return RendererView.__super__.constructor.apply(this, arguments);
  }

  RendererView.prototype.initialize = function(options) {
    var j, len, name, prefix, ref, ref1, results, spec;
    RendererView.__super__.initialize.call(this, options);
    this.plot_model = options.plot_model;
    this.plot_view = options.plot_view;
    this.nohit_warned = {};
    this.visuals = {};
    ref = this.model.mixins;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      spec = ref[j];
      ref1 = spec.split(":"), name = ref1[0], prefix = ref1[1];
      if (prefix == null) {
        prefix = "";
      }
      results.push(this.visuals[prefix + name] = new VISUALS[name]({
        obj: this.model,
        prefix: prefix
      }));
    }
    return results;
  };

  RendererView.prototype.bind_bokeh_events = function() {};

  RendererView.prototype.request_render = function() {
    return this.plot_view.request_render();
  };

  RendererView.prototype.map_data = function() {
    var i, j, k, len, ref, ref1, ref2, ref3, ref4, ref5, ref6, sx, sxname, sy, syname, xname, yname;
    ref = this.model._coords;
    for (j = 0, len = ref.length; j < len; j++) {
      ref1 = ref[j], xname = ref1[0], yname = ref1[1];
      sxname = "s" + xname;
      syname = "s" + yname;
      xname = "_" + xname;
      yname = "_" + yname;
      if (_.isArray((ref2 = this[xname]) != null ? ref2[0] : void 0)) {
        ref3 = [[], []], this[sxname] = ref3[0], this[syname] = ref3[1];
        for (i = k = 0, ref4 = this[xname].length; 0 <= ref4 ? k < ref4 : k > ref4; i = 0 <= ref4 ? ++k : --k) {
          ref5 = this.map_to_screen(this[xname][i], this[yname][i]), sx = ref5[0], sy = ref5[1];
          this[sxname].push(sx);
          this[syname].push(sy);
        }
      } else {
        ref6 = this.map_to_screen(this[xname], this[yname]), this[sxname] = ref6[0], this[syname] = ref6[1];
      }
    }
    return this._map_data();
  };

  RendererView.prototype.project_xy = function(x, y) {
    var i, j, merc_x, merc_x_s, merc_y, merc_y_s, ref, ref1;
    merc_x_s = [];
    merc_y_s = [];
    for (i = j = 0, ref = x.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      ref1 = proj4(toProjection, [x[i], y[i]]), merc_x = ref1[0], merc_y = ref1[1];
      merc_x_s[i] = merc_x;
      merc_y_s[i] = merc_y;
    }
    return [merc_x_s, merc_y_s];
  };

  RendererView.prototype.project_xsys = function(xs, ys) {
    var i, j, merc_x_s, merc_xs_s, merc_y_s, merc_ys_s, ref, ref1;
    merc_xs_s = [];
    merc_ys_s = [];
    for (i = j = 0, ref = xs.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      ref1 = this.project_xy(xs[i], ys[i]), merc_x_s = ref1[0], merc_y_s = ref1[1];
      merc_xs_s[i] = merc_x_s;
      merc_ys_s[i] = merc_y_s;
    }
    return [merc_xs_s, merc_ys_s];
  };

  RendererView.prototype.set_data = function(source) {
    var name, prop, ref, ref1, ref2;
    ref = this.model.properties;
    for (name in ref) {
      prop = ref[name];
      if (!prop.dataspec) {
        continue;
      }
      if ((prop.optional || false) && prop.spec.value === null && (!(name in this.model._set_after_defaults))) {
        continue;
      }
      this["_" + name] = prop.array(source);
      if (prop instanceof p.Distance) {
        this["max_" + name] = array_max(this["_" + name]);
      }
    }
    if (this.plot_model.use_map) {
      if (this._x != null) {
        ref1 = this.project_xy(this._x, this._y), this._x = ref1[0], this._y = ref1[1];
      }
      if (this._xs != null) {
        ref2 = this.project_xsys(this._xs, this._ys), this._xs = ref2[0], this._ys = ref2[1];
      }
    }
    if (this.glglyph != null) {
      this.glglyph.set_data_changed(this._x.length);
    }
    this._set_data();
    return this.index = this._index_data();
  };

  RendererView.prototype.set_visuals = function(source) {
    var name, prop, ref;
    ref = this.visuals;
    for (name in ref) {
      prop = ref[name];
      prop.warm_cache(source);
    }
    if (this.glglyph != null) {
      return this.glglyph.set_visuals_changed();
    }
  };

  RendererView.prototype._set_data = function() {
    return null;
  };

  RendererView.prototype._map_data = function() {
    return null;
  };

  RendererView.prototype._index_data = function() {
    return null;
  };

  RendererView.prototype._mask_data = function(inds) {
    return inds;
  };

  RendererView.prototype._bounds = function(bds) {
    return bds;
  };

  RendererView.prototype.hit_test = function(geometry) {
    var func, result;
    result = null;
    func = "_hit_" + geometry.type;
    if (this[func] != null) {
      result = this[func](geometry);
    } else if (this.nohit_warned[geometry.type] == null) {
      logger.debug("'" + geometry.type + "' selection not available for " + this.model.type);
      this.nohit_warned[geometry.type] = true;
    }
    return result;
  };

  RendererView.prototype.map_to_screen = function(x, y) {
    return this.plot_view.map_to_screen(x, y, this.mget("x_range_name"), this.mget("y_range_name"));
  };

  return RendererView;

})(BokehView);

Renderer = (function(superClass) {
  extend(Renderer, superClass);

  function Renderer() {
    return Renderer.__super__.constructor.apply(this, arguments);
  }

  Renderer.prototype.type = "Renderer";

  Renderer.define({
    level: [p.RenderLevel, null]
  });

  return Renderer;

})(Model);

module.exports = {
  Model: Renderer,
  View: RendererView,
  Visuals: VISUALS
};
