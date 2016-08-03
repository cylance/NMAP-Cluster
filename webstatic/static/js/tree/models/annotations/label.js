var Label, LabelView, TextAnnotation, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

TextAnnotation = require("./text_annotation");

p = require("../../core/properties");

LabelView = (function(superClass) {
  extend(LabelView, superClass);

  function LabelView() {
    return LabelView.__super__.constructor.apply(this, arguments);
  }

  LabelView.prototype.initialize = function(options) {
    var name, prop, ref, results;
    LabelView.__super__.initialize.call(this, options);
    this.canvas = this.plot_model.get('canvas');
    this.xmapper = this.plot_view.frame.get('x_mappers')[this.mget("x_range_name")];
    this.ymapper = this.plot_view.frame.get('y_mappers')[this.mget("y_range_name")];
    ref = this.visuals;
    results = [];
    for (name in ref) {
      prop = ref[name];
      results.push(prop.warm_cache(null));
    }
    return results;
  };

  LabelView.prototype._get_size = function() {
    var ctx, height, side, width;
    ctx = this.plot_view.canvas_view.ctx;
    this.visuals.text.set_value(ctx);
    side = this.model.panel.side;
    if (side === "above" || side === "below") {
      height = ctx.measureText(this.mget('text')).ascent;
      return height;
    }
    if (side === 'left' || side === 'right') {
      width = ctx.measureText(this.mget('text')).width;
      return width;
    }
  };

  LabelView.prototype.render = function() {
    var angle, ctx, panel_offset, sx, sy, vx, vy;
    ctx = this.plot_view.canvas_view.ctx;
    switch (this.mget('angle_units')) {
      case "rad":
        angle = -1 * this.mget('angle');
        break;
      case "deg":
        angle = -1 * this.mget('angle') * Math.PI / 180.0;
    }
    if (this.mget('x_units') === "data") {
      vx = this.xmapper.map_to_target(this.mget('x'));
    } else {
      vx = this.mget('x');
    }
    sx = this.canvas.vx_to_sx(vx);
    if (this.mget('y_units') === "data") {
      vy = this.ymapper.map_to_target(this.mget('y'));
    } else {
      vy = this.mget('y');
    }
    sy = this.canvas.vy_to_sy(vy);
    if (this.model.panel != null) {
      panel_offset = this._get_panel_offset();
      sx += panel_offset.x;
      sy += panel_offset.y;
    }
    if (this.mget('render_mode') === 'canvas') {
      return this._canvas_text(ctx, this.mget('text'), sx + this.mget('x_offset'), sy - this.mget('y_offset'), angle);
    } else {
      return this._css_text(ctx, this.mget('text'), sx + this.mget('x_offset'), sy - this.mget('y_offset'), angle);
    }
  };

  return LabelView;

})(TextAnnotation.View);

Label = (function(superClass) {
  extend(Label, superClass);

  function Label() {
    return Label.__super__.constructor.apply(this, arguments);
  }

  Label.prototype.default_view = LabelView;

  Label.prototype.type = 'Label';

  Label.mixins(['text', 'line:border_', 'fill:background_']);

  Label.define({
    x: [p.Number],
    x_units: [p.SpatialUnits, 'data'],
    y: [p.Number],
    y_units: [p.SpatialUnits, 'data'],
    text: [p.String],
    angle: [p.Angle, 0],
    angle_units: [p.AngleUnits, 'rad'],
    x_offset: [p.Number, 0],
    y_offset: [p.Number, 0],
    x_range_name: [p.String, 'default'],
    y_range_name: [p.String, 'default'],
    render_mode: [p.RenderMode, 'canvas']
  });

  Label.override({
    background_fill_color: null,
    border_line_color: null
  });

  return Label;

})(TextAnnotation.Model);

module.exports = {
  Model: Label,
  View: LabelView
};
