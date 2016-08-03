var Model, Renderer, Tool, ToolView, _, logger, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Renderer = require("../renderers/renderer");

logger = require("../../core/logging").logger;

p = require("../../core/properties");

Model = require("../../model");

ToolView = (function(superClass) {
  extend(ToolView, superClass);

  function ToolView() {
    return ToolView.__super__.constructor.apply(this, arguments);
  }

  ToolView.prototype.bind_bokeh_events = function() {
    return this.listenTo(this.model, 'change:active', (function(_this) {
      return function() {
        if (_this.mget('active')) {
          return _this.activate();
        } else {
          return _this.deactivate();
        }
      };
    })(this));
  };

  ToolView.prototype.activate = function() {};

  ToolView.prototype.deactivate = function() {};

  return ToolView;

})(Renderer.View);

Tool = (function(superClass) {
  extend(Tool, superClass);

  function Tool() {
    return Tool.__super__.constructor.apply(this, arguments);
  }

  Tool.prototype.initialize = function(attrs, options) {
    Tool.__super__.initialize.call(this, attrs, options);
    return this.define_computed_property('synthetic_renderers', (function() {
      return [];
    }), true);
  };

  Tool.define({
    plot: [p.Instance]
  });

  Tool.internal({
    level: [p.RenderLevel, 'overlay'],
    active: [p.Boolean, false]
  });

  Tool.prototype._check_dims = function(dims, tool_name) {
    var hdim, ref, wdim;
    ref = [false, false], wdim = ref[0], hdim = ref[1];
    if (dims.length === 0) {
      logger.warn(tool_name + " given empty dimensions");
    } else if (dims.length === 1) {
      if (dims[0] !== 'width' && dims[0] !== 'height') {
        logger.warn(tool_name + " given unrecognized dimensions: " + dims);
      }
    } else if (dims.length === 2) {
      if (dims.indexOf('width') < 0 || dims.indexOf('height') < 0) {
        logger.warn(tool_name + " given unrecognized dimensions: " + dims);
      }
    } else {
      logger.warn(tool_name + " given more than two dimensions: " + dims);
    }
    if (dims.indexOf('width') >= 0) {
      wdim = true;
    }
    if (dims.indexOf('height') >= 0) {
      hdim = true;
    }
    return [wdim, hdim];
  };

  Tool.prototype._get_dim_tooltip = function(name, arg) {
    var hdim, wdim;
    wdim = arg[0], hdim = arg[1];
    if (wdim && !hdim) {
      return name + " (x-axis)";
    } else if (hdim && !wdim) {
      return name + " (y-axis)";
    } else {
      return name;
    }
  };

  Tool.prototype._get_dim_limits = function(arg, arg1, frame, dims) {
    var hr, vr, vx0, vx1, vxlim, vy0, vy1, vylim;
    vx0 = arg[0], vy0 = arg[1];
    vx1 = arg1[0], vy1 = arg1[1];
    hr = frame.get('h_range');
    if (dims.indexOf('width') >= 0) {
      vxlim = [_.min([vx0, vx1]), _.max([vx0, vx1])];
      vxlim = [_.max([vxlim[0], hr.get('min')]), _.min([vxlim[1], hr.get('max')])];
    } else {
      vxlim = [hr.get('min'), hr.get('max')];
    }
    vr = frame.get('v_range');
    if (dims.indexOf('height') >= 0) {
      vylim = [_.min([vy0, vy1]), _.max([vy0, vy1])];
      vylim = [_.max([vylim[0], vr.get('min')]), _.min([vylim[1], vr.get('max')])];
    } else {
      vylim = [vr.get('min'), vr.get('max')];
    }
    return [vxlim, vylim];
  };

  return Tool;

})(Model);

module.exports = {
  Model: Tool,
  View: ToolView
};
