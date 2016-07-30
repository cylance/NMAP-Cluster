var CrosshairTool, CrosshairToolView, InspectTool, Span, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

InspectTool = require("./inspect_tool");

Span = require("../../annotations/span");

p = require("../../../core/properties");

CrosshairToolView = (function(superClass) {
  extend(CrosshairToolView, superClass);

  function CrosshairToolView() {
    return CrosshairToolView.__super__.constructor.apply(this, arguments);
  }

  CrosshairToolView.prototype._move = function(e) {
    var canvas, dim, frame, i, len, ref, results, span, vx, vy;
    if (!this.mget('active')) {
      return;
    }
    frame = this.plot_model.get('frame');
    canvas = this.plot_model.get('canvas');
    vx = canvas.sx_to_vx(e.bokeh.sx);
    vy = canvas.sy_to_vy(e.bokeh.sy);
    ref = this.mget('dimensions');
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      dim = ref[i];
      span = this.mget('spans')[dim];
      if (!frame.contains(vx, vy)) {
        results.push(span.unset('computed_location'));
      } else {
        if (dim === "width") {
          results.push(span.set('computed_location', vy));
        } else {
          results.push(span.set('computed_location', vx));
        }
      }
    }
    return results;
  };

  CrosshairToolView.prototype._move_exit = function(e) {
    var dim, i, len, ref, results, span;
    ref = this.mget('dimensions');
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      dim = ref[i];
      span = this.mget('spans')[dim];
      results.push(span.unset('computed_location'));
    }
    return results;
  };

  return CrosshairToolView;

})(InspectTool.View);

CrosshairTool = (function(superClass) {
  extend(CrosshairTool, superClass);

  function CrosshairTool() {
    return CrosshairTool.__super__.constructor.apply(this, arguments);
  }

  CrosshairTool.prototype.default_view = CrosshairToolView;

  CrosshairTool.prototype.type = "CrosshairTool";

  CrosshairTool.prototype.tool_name = "Crosshair";

  CrosshairTool.define({
    dimensions: [p.Array, ["width", "height"]],
    line_color: [p.Color, 'black'],
    line_width: [p.Number, 1],
    line_alpha: [p.Number, 1.0]
  });

  CrosshairTool.internal({
    location_units: [p.SpatialUnits, "screen"],
    render_mode: [p.RenderMode, "css"],
    spans: [p.Any]
  });

  CrosshairTool.prototype.initialize = function(attrs, options) {
    CrosshairTool.__super__.initialize.call(this, attrs, options);
    this.override_computed_property('tooltip', function() {
      return this._get_dim_tooltip("Crosshair", this._check_dims(this.get('dimensions'), "crosshair tool"));
    }, false);
    this.add_dependencies('tooltip', this, ['dimensions']);
    this.spans = {
      width: new Span.Model({
        for_hover: true,
        dimension: "width",
        render_mode: this.get("render_mode"),
        location_units: this.get("location_units"),
        line_color: this.get("line_color"),
        line_width: this.get('line_width'),
        line_alpha: this.get('line_alpha')
      }),
      height: new Span.Model({
        for_hover: true,
        dimension: "height",
        render_mode: this.get("render_mode"),
        location_units: this.get("location_units"),
        line_color: this.get("line_color"),
        line_width: this.get('line_width'),
        line_alpha: this.get('line_alpha')
      })
    };
    return this.override_computed_property('synthetic_renderers', ((function(_this) {
      return function() {
        return _.values(_this.get("spans"));
      };
    })(this)), true);
  };

  return CrosshairTool;

})(InspectTool.Model);

module.exports = {
  Model: CrosshairTool,
  View: CrosshairToolView
};
