var Annotation, Legend, LegendView, _, get_text_height, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Annotation = require("./annotation");

p = require("../../core/properties");

get_text_height = require("../../core/util/text").get_text_height;

LegendView = (function(superClass) {
  extend(LegendView, superClass);

  function LegendView() {
    return LegendView.__super__.constructor.apply(this, arguments);
  }

  LegendView.prototype.initialize = function(options) {
    return LegendView.__super__.initialize.call(this, options);
  };

  LegendView.prototype.compute_legend_bbox = function() {
    var ctx, glyph_height, glyph_width, glyphs, h_range, i, label_height, label_standoff, label_width, legend_height, legend_margin, legend_name, legend_names, legend_padding, legend_spacing, legend_width, len, location, max_label_width, name, ref, v_range, width, x, y;
    legend_names = (function() {
      var i, len, ref, ref1, results;
      ref = this.mget("legends");
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        ref1 = ref[i], legend_name = ref1[0], glyphs = ref1[1];
        results.push(legend_name);
      }
      return results;
    }).call(this);
    glyph_height = this.mget('glyph_height');
    glyph_width = this.mget('glyph_width');
    label_height = this.mget('label_height');
    label_width = this.mget('label_width');
    this.max_label_height = _.max([get_text_height(this.visuals.label_text.font_value()).height, label_height, glyph_height]);
    ctx = this.plot_view.canvas_view.ctx;
    ctx.save();
    this.visuals.label_text.set_value(ctx);
    this.text_widths = {};
    for (i = 0, len = legend_names.length; i < len; i++) {
      name = legend_names[i];
      this.text_widths[name] = _.max([ctx.measureText(name).width, label_width]);
    }
    ctx.restore();
    max_label_width = _.max(_.values(this.text_widths));
    legend_margin = this.mget('legend_margin');
    legend_padding = this.mget('legend_padding');
    legend_spacing = this.mget('legend_spacing');
    label_standoff = this.mget('label_standoff');
    if (this.mget("orientation") === "vertical") {
      legend_height = legend_names.length * this.max_label_height + (legend_names.length - 1) * legend_spacing + 2 * legend_padding;
      legend_width = max_label_width + glyph_width + label_standoff + 2 * legend_padding;
    } else {
      legend_width = 2 * legend_padding + (legend_names.length - 1) * legend_spacing;
      ref = this.text_widths;
      for (name in ref) {
        width = ref[name];
        legend_width += _.max([width, label_width]) + glyph_width + label_standoff;
      }
      legend_height = this.max_label_height + 2 * legend_padding;
    }
    location = this.mget('location');
    h_range = this.plot_view.frame.get('h_range');
    v_range = this.plot_view.frame.get('v_range');
    if (_.isString(location)) {
      switch (location) {
        case 'top_left':
          x = h_range.get('start') + legend_margin;
          y = v_range.get('end') - legend_margin;
          break;
        case 'top_center':
          x = (h_range.get('end') + h_range.get('start')) / 2 - legend_width / 2;
          y = v_range.get('end') - legend_margin;
          break;
        case 'top_right':
          x = h_range.get('end') - legend_margin - legend_width;
          y = v_range.get('end') - legend_margin;
          break;
        case 'right_center':
          x = h_range.get('end') - legend_margin - legend_width;
          y = (v_range.get('end') + v_range.get('start')) / 2 + legend_height / 2;
          break;
        case 'bottom_right':
          x = h_range.get('end') - legend_margin - legend_width;
          y = v_range.get('start') + legend_margin + legend_height;
          break;
        case 'bottom_center':
          x = (h_range.get('end') + h_range.get('start')) / 2 - legend_width / 2;
          y = v_range.get('start') + legend_margin + legend_height;
          break;
        case 'bottom_left':
          x = h_range.get('start') + legend_margin;
          y = v_range.get('start') + legend_margin + legend_height;
          break;
        case 'left_center':
          x = h_range.get('start') + legend_margin;
          y = (v_range.get('end') + v_range.get('start')) / 2 + legend_height / 2;
          break;
        case 'center':
          x = (h_range.get('end') + h_range.get('start')) / 2 - legend_width / 2;
          y = (v_range.get('end') + v_range.get('start')) / 2 + legend_height / 2;
      }
    } else if (_.isArray(location) && location.length === 2) {
      x = location[0], y = location[1];
    }
    x = this.plot_view.canvas.vx_to_sx(x);
    y = this.plot_view.canvas.vy_to_sy(y);
    return {
      x: x,
      y: y,
      width: legend_width,
      height: legend_height
    };
  };

  LegendView.prototype.render = function() {
    var N, bbox, ctx, glyph_height, glyph_width, glyphs, i, idx, j, label_standoff, legend_name, legend_spacing, len, len1, orientation, panel_offset, ref, ref1, renderer, view, x1, x2, xoffset, y1, y2, yoffset;
    if (this.model.legends.length === 0) {
      return;
    }
    bbox = this.compute_legend_bbox();
    glyph_height = this.mget('glyph_height');
    glyph_width = this.mget('glyph_width');
    orientation = this.mget('orientation');
    ctx = this.plot_view.canvas_view.ctx;
    ctx.save();
    if (this.model.panel != null) {
      panel_offset = this._get_panel_offset();
      ctx.translate(panel_offset.x, panel_offset.y);
    }
    ctx.beginPath();
    ctx.rect(bbox.x, bbox.y, bbox.width, bbox.height);
    this.visuals.background_fill.set_value(ctx);
    ctx.fill();
    if (this.visuals.border_line.doit) {
      this.visuals.border_line.set_value(ctx);
      ctx.stroke();
    }
    N = this.mget("legends").length;
    legend_spacing = this.mget('legend_spacing');
    label_standoff = this.mget('label_standoff');
    xoffset = yoffset = this.mget('legend_padding');
    ref = this.mget("legends");
    for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
      ref1 = ref[idx], legend_name = ref1[0], glyphs = ref1[1];
      x1 = bbox.x + xoffset;
      y1 = bbox.y + yoffset;
      x2 = x1 + glyph_width;
      y2 = y1 + glyph_height;
      if (orientation === "vertical") {
        yoffset += this.max_label_height + legend_spacing;
      } else {
        xoffset += this.text_widths[legend_name] + glyph_width + label_standoff + legend_spacing;
      }
      this.visuals.label_text.set_value(ctx);
      ctx.fillText(legend_name, x2 + label_standoff, y1 + this.max_label_height / 2.0);
      for (j = 0, len1 = glyphs.length; j < len1; j++) {
        renderer = glyphs[j];
        view = this.plot_view.renderer_views[renderer.id];
        view.draw_legend(ctx, x1, x2, y1, y2);
      }
    }
    return ctx.restore();
  };

  LegendView.prototype._get_size = function() {
    var bbox, side;
    bbox = this.compute_legend_bbox();
    side = this.model.panel.side;
    if (side === 'above' || side === 'below') {
      return bbox.height;
    }
    if (side === 'left' || side === 'right') {
      return bbox.width;
    }
  };

  LegendView.prototype._get_panel_offset = function() {
    var x, y;
    x = this.model.panel._left._value;
    y = this.model.panel._top._value;
    return {
      x: x,
      y: -y
    };
  };

  return LegendView;

})(Annotation.View);

Legend = (function(superClass) {
  extend(Legend, superClass);

  function Legend() {
    return Legend.__super__.constructor.apply(this, arguments);
  }

  Legend.prototype.default_view = LegendView;

  Legend.prototype.type = 'Legend';

  Legend.mixins(['text:label_', 'line:border_', 'fill:background_']);

  Legend.define({
    legends: [p.Array, []],
    orientation: [p.Orientation, 'vertical'],
    location: [p.Any, 'top_right'],
    label_standoff: [p.Number, 5],
    glyph_height: [p.Number, 20],
    glyph_width: [p.Number, 20],
    label_height: [p.Number, 20],
    label_width: [p.Number, 20],
    legend_margin: [p.Number, 10],
    legend_padding: [p.Number, 10],
    legend_spacing: [p.Number, 3]
  });

  Legend.override({
    border_line_color: "#e5e5e5",
    border_line_alpha: 0.5,
    border_line_width: 1,
    background_fill_color: "#ffffff",
    background_fill_alpha: 0.95,
    label_text_font_size: "10pt",
    label_text_baseline: "middle"
  });

  return Legend;

})(Annotation.Model);

module.exports = {
  Model: Legend,
  View: LegendView
};
