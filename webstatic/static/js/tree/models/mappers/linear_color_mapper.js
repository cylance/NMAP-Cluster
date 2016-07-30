var ColorMapper, LinearColorMapper, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

ColorMapper = require("./color_mapper");

p = require("../../core/properties");

LinearColorMapper = (function(superClass) {
  extend(LinearColorMapper, superClass);

  function LinearColorMapper() {
    return LinearColorMapper.__super__.constructor.apply(this, arguments);
  }

  LinearColorMapper.prototype.type = "LinearColorMapper";

  LinearColorMapper.define({
    high: [p.Number],
    low: [p.Number],
    palette: [p.Any],
    reserve_val: [p.Number],
    reserve_color: [p.Color, '#ffffff']
  });

  LinearColorMapper.prototype.initialize = function(attrs, options) {
    LinearColorMapper.__super__.initialize.call(this, attrs, options);
    this._little_endian = this._is_little_endian();
    this._palette = this._build_palette(this.get('palette'));
    if (this.get('reserve_color') != null) {
      this._reserve_color = parseInt(this.get('reserve_color').slice(1), 16);
      return this._reserve_val = this.get('reserve_val');
    }
  };

  LinearColorMapper.prototype.v_map_screen = function(data) {
    var N, buf, color, d, high, i, j, k, low, offset, ref, ref1, ref2, ref3, scale, value;
    buf = new ArrayBuffer(data.length * 4);
    color = new Uint32Array(buf);
    low = (ref = this.get('low')) != null ? ref : _.min(data);
    high = (ref1 = this.get('high')) != null ? ref1 : _.max(data);
    N = this._palette.length - 1;
    scale = N / (high - low);
    offset = -scale * low;
    if (this._little_endian) {
      for (i = j = 0, ref2 = data.length; 0 <= ref2 ? j < ref2 : j > ref2; i = 0 <= ref2 ? ++j : --j) {
        d = data[i];
        if (d === this._reserve_val) {
          value = this._reserve_color;
        } else {
          if (d > high) {
            d = high;
          }
          if (d < low) {
            d = low;
          }
          value = this._palette[Math.floor(d * scale + offset)];
        }
        color[i] = (0xff << 24) | ((value & 0xff0000) >> 16) | (value & 0xff00) | ((value & 0xff) << 16);
      }
    } else {
      for (i = k = 0, ref3 = data.length; 0 <= ref3 ? k < ref3 : k > ref3; i = 0 <= ref3 ? ++k : --k) {
        d = data[i];
        if (d === this._reserve_val) {
          value = this._reserve_color;
        } else {
          if (d > high) {
            d = high;
          }
          if (d < low) {
            d = low;
          }
          value = this._palette[Math.floor(d * scale + offset)];
        }
        color[i] = (value << 8) | 0xff;
      }
    }
    return buf;
  };

  return LinearColorMapper;

})(ColorMapper.Model);

module.exports = {
  Model: LinearColorMapper
};
