var CartesianFrame, CategoricalMapper, EQ, GE, GridMapper, LayoutCanvas, LinearMapper, LogMapper, Range1d, _, logging, p, ref,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

CategoricalMapper = require("../mappers/categorical_mapper");

GridMapper = require("../mappers/grid_mapper");

LinearMapper = require("../mappers/linear_mapper");

LogMapper = require("../mappers/log_mapper");

Range1d = require("../ranges/range1d");

ref = require("../../core/layout/solver"), EQ = ref.EQ, GE = ref.GE;

LayoutCanvas = require("../../core/layout/layout_canvas");

logging = require("../../core/logging").logging;

p = require("../../core/properties");

CartesianFrame = (function(superClass) {
  extend(CartesianFrame, superClass);

  function CartesianFrame() {
    return CartesianFrame.__super__.constructor.apply(this, arguments);
  }

  CartesianFrame.prototype.type = 'CartesianFrame';

  CartesianFrame.prototype.initialize = function(attrs, options) {
    CartesianFrame.__super__.initialize.call(this, attrs, options);
    this.panel = this;
    this.define_computed_property('x_ranges', function() {
      return this._get_ranges('x');
    }, true);
    this.add_dependencies('x_ranges', this, ['x_range', 'extra_x_ranges']);
    this.define_computed_property('y_ranges', function() {
      return this._get_ranges('y');
    }, true);
    this.add_dependencies('y_ranges', this, ['y_range', 'extra_y_ranges']);
    this.define_computed_property('x_mappers', function() {
      return this._get_mappers('x', this.get('x_ranges'), this.get('h_range'));
    }, true);
    this.add_dependencies('x_ranges', this, ['x_ranges', 'h_range']);
    this.define_computed_property('y_mappers', function() {
      return this._get_mappers('y', this.get('y_ranges'), this.get('v_range'));
    }, true);
    this.add_dependencies('y_ranges', this, ['y_ranges', 'v_range']);
    this.define_computed_property('mapper', function() {
      return new GridMapper.Model({
        domain_mapper: this.get('x_mapper'),
        codomain_mapper: this.get('y_mapper')
      });
    }, true);
    this.add_dependencies('mapper', this, ['x_mapper', 'y_mapper']);
    this._h_range = new Range1d.Model({
      start: this.get('left'),
      end: this.get('left') + this.get('width')
    });
    this.define_computed_property('h_range', (function(_this) {
      return function() {
        _this._h_range.set('start', _this.get('left'));
        _this._h_range.set('end', _this.get('left') + _this.get('width'));
        return _this._h_range;
      };
    })(this), false);
    this.add_dependencies('h_range', this, ['left', 'width']);
    this._v_range = new Range1d.Model({
      start: this.get('bottom'),
      end: this.get('bottom') + this.get('height')
    });
    this.define_computed_property('v_range', (function(_this) {
      return function() {
        _this._v_range.set('start', _this.get('bottom'));
        _this._v_range.set('end', _this.get('bottom') + _this.get('height'));
        return _this._v_range;
      };
    })(this), false);
    this.add_dependencies('v_range', this, ['bottom', 'height']);
    return null;
  };

  CartesianFrame.prototype._doc_attached = function() {
    this.listenTo(this.document.solver(), 'layout_update', this._update_mappers);
    return null;
  };

  CartesianFrame.prototype.contains = function(vx, vy) {
    return vx >= this.get('left') && vx <= this.get('right') && vy >= this.get('bottom') && vy <= this.get('top');
  };

  CartesianFrame.prototype.map_to_screen = function(x, y, canvas, x_name, y_name) {
    var sx, sy, vx, vy;
    if (x_name == null) {
      x_name = 'default';
    }
    if (y_name == null) {
      y_name = 'default';
    }
    vx = this.get('x_mappers')[x_name].v_map_to_target(x);
    sx = canvas.v_vx_to_sx(vx);
    vy = this.get('y_mappers')[y_name].v_map_to_target(y);
    sy = canvas.v_vy_to_sy(vy);
    return [sx, sy];
  };

  CartesianFrame.prototype._get_ranges = function(dim) {
    var extra_ranges, name, range, ranges;
    ranges = {};
    ranges['default'] = this.get(dim + "_range");
    extra_ranges = this.get("extra_" + dim + "_ranges");
    if (extra_ranges != null) {
      for (name in extra_ranges) {
        range = extra_ranges[name];
        ranges[name] = range;
      }
    }
    return ranges;
  };

  CartesianFrame.prototype._get_mappers = function(dim, ranges, frame_range) {
    var mapper_type, mappers, name, range;
    mappers = {};
    for (name in ranges) {
      range = ranges[name];
      if (range.type === "Range1d" || range.type === "DataRange1d") {
        if (this.get(dim + "_mapper_type") === "log") {
          mapper_type = LogMapper.Model;
        } else {
          mapper_type = LinearMapper.Model;
        }
      } else if (range.type === "FactorRange") {
        mapper_type = CategoricalMapper.Model;
      } else {
        logger.warn("unknown range type for range '" + name + "': " + range);
        return null;
      }
      mappers[name] = new mapper_type({
        source_range: range,
        target_range: frame_range
      });
    }
    return mappers;
  };

  CartesianFrame.prototype._update_mappers = function() {
    var mapper, name, ref1, ref2;
    ref1 = this.get('x_mappers');
    for (name in ref1) {
      mapper = ref1[name];
      mapper.set('target_range', this.get('h_range'));
    }
    ref2 = this.get('y_mappers');
    for (name in ref2) {
      mapper = ref2[name];
      mapper.set('target_range', this.get('v_range'));
    }
    return null;
  };

  CartesianFrame.internal({
    extra_x_ranges: [p.Any, {}],
    extra_y_ranges: [p.Any, {}],
    x_range: [p.Instance],
    y_range: [p.Instance],
    x_mapper_type: [p.Any],
    y_mapper_type: [p.Any]
  });

  CartesianFrame.prototype.get_constraints = function() {
    var constraints;
    constraints = [];
    constraints.push(GE(this._top));
    constraints.push(GE(this._bottom));
    constraints.push(GE(this._left));
    constraints.push(GE(this._right));
    constraints.push(GE(this._width));
    constraints.push(GE(this._height));
    constraints.push(EQ(this._left, this._width, [-1, this._right]));
    constraints.push(EQ(this._bottom, this._height, [-1, this._top]));
    return constraints;
  };

  return CartesianFrame;

})(LayoutCanvas.Model);

module.exports = {
  Model: CartesianFrame
};
