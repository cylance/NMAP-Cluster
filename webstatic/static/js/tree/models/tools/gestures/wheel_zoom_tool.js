var GestureTool, WheelZoomTool, WheelZoomToolView, _, document, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

GestureTool = require("./gesture_tool");

p = require("../../../core/properties");

if (typeof document === "undefined" || document === null) {
  document = {};
}

WheelZoomToolView = (function(superClass) {
  extend(WheelZoomToolView, superClass);

  function WheelZoomToolView() {
    return WheelZoomToolView.__super__.constructor.apply(this, arguments);
  }

  WheelZoomToolView.prototype._pinch = function(e) {
    var delta;
    if (e.scale >= 1) {
      delta = (e.scale - 1) * 20.0;
    } else {
      delta = -20.0 / e.scale;
    }
    e.bokeh.delta = delta;
    return this._scroll(e);
  };

  WheelZoomToolView.prototype._scroll = function(e) {
    var delta, dims, end, factor, frame, h_axis_only, hr, mapper, multiplier, name, ref, ref1, ref2, ref3, ref4, start, sx0, sx1, sy0, sy1, v_axis_only, vr, vx, vx_high, vx_low, vy, vy_high, vy_low, xrs, yrs, zoom_info;
    frame = this.plot_model.get('frame');
    hr = frame.get('h_range');
    vr = frame.get('v_range');
    vx = this.plot_view.canvas.sx_to_vx(e.bokeh.sx);
    vy = this.plot_view.canvas.sy_to_vy(e.bokeh.sy);
    if (vx < hr.get('start') || vx > hr.get('end')) {
      v_axis_only = true;
    }
    if (vy < vr.get('start') || vy > vr.get('end')) {
      h_axis_only = true;
    }
    if (navigator.userAgent.toLowerCase().indexOf("firefox") > -1) {
      multiplier = 20;
    } else {
      multiplier = 1;
    }
    if (((ref = e.originalEvent) != null ? ref.deltaY : void 0) != null) {
      delta = -e.originalEvent.deltaY * multiplier;
    } else {
      delta = e.bokeh.delta;
    }
    factor = this.mget('speed') * delta;
    if (factor > 0.9) {
      factor = 0.9;
    } else if (factor < -0.9) {
      factor = -0.9;
    }
    vx_low = hr.get('start');
    vx_high = hr.get('end');
    vy_low = vr.get('start');
    vy_high = vr.get('end');
    dims = this.mget('dimensions');
    if (dims.indexOf('width') > -1 && !v_axis_only) {
      sx0 = vx_low - (vx_low - vx) * factor;
      sx1 = vx_high - (vx_high - vx) * factor;
    } else {
      sx0 = vx_low;
      sx1 = vx_high;
    }
    if (dims.indexOf('height') > -1 && !h_axis_only) {
      sy0 = vy_low - (vy_low - vy) * factor;
      sy1 = vy_high - (vy_high - vy) * factor;
    } else {
      sy0 = vy_low;
      sy1 = vy_high;
    }
    xrs = {};
    ref1 = frame.get('x_mappers');
    for (name in ref1) {
      mapper = ref1[name];
      ref2 = mapper.v_map_from_target([sx0, sx1], true), start = ref2[0], end = ref2[1];
      xrs[name] = {
        start: start,
        end: end
      };
    }
    yrs = {};
    ref3 = frame.get('y_mappers');
    for (name in ref3) {
      mapper = ref3[name];
      ref4 = mapper.v_map_from_target([sy0, sy1], true), start = ref4[0], end = ref4[1];
      yrs[name] = {
        start: start,
        end: end
      };
    }
    zoom_info = {
      xrs: xrs,
      yrs: yrs,
      factor: factor
    };
    this.plot_view.push_state('wheel_zoom', {
      range: zoom_info
    });
    this.plot_view.update_range(zoom_info, false, true);
    this.plot_view.interactive_timestamp = Date.now();
    return null;
  };

  return WheelZoomToolView;

})(GestureTool.View);

WheelZoomTool = (function(superClass) {
  extend(WheelZoomTool, superClass);

  function WheelZoomTool() {
    return WheelZoomTool.__super__.constructor.apply(this, arguments);
  }

  WheelZoomTool.prototype.default_view = WheelZoomToolView;

  WheelZoomTool.prototype.type = "WheelZoomTool";

  WheelZoomTool.prototype.tool_name = "Wheel Zoom";

  WheelZoomTool.prototype.icon = "bk-tool-icon-wheel-zoom";

  WheelZoomTool.prototype.event_type = 'ontouchstart' in window.document ? 'pinch' : 'scroll';

  WheelZoomTool.prototype.default_order = 10;

  WheelZoomTool.prototype.initialize = function(attrs, options) {
    WheelZoomTool.__super__.initialize.call(this, attrs, options);
    this.override_computed_property('tooltip', function() {
      return this._get_dim_tooltip(this.tool_name, this._check_dims(this.get('dimensions'), "wheel zoom tool"));
    }, false);
    return this.add_dependencies('tooltip', this, ['dimensions']);
  };

  WheelZoomTool.define({
    dimensions: [p.Array, ["width", "height"]]
  });

  WheelZoomTool.internal({
    speed: [p.Number, 1 / 600]
  });

  return WheelZoomTool;

})(GestureTool.Model);

module.exports = {
  Model: WheelZoomTool,
  View: WheelZoomToolView
};
