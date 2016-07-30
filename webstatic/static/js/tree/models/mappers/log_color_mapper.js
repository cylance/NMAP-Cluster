var ColorMapper, LogColorMapper, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

ColorMapper = require("./color_mapper");

p = require("../../core/properties");

LogColorMapper = (function(superClass) {
  extend(LogColorMapper, superClass);

  function LogColorMapper() {
    return LogColorMapper.__super__.constructor.apply(this, arguments);
  }

  LogColorMapper.prototype.type = "LogColorMapper";

  LogColorMapper.define({
    high: [p.Number],
    low: [p.Number],
    palette: [p.Any]
  });

  LogColorMapper.prototype.initialize = function(attrs, options) {
    LogColorMapper.__super__.initialize.call(this, attrs, options);
    this._little_endian = this._is_little_endian();
    return this._palette = this._build_palette(this.get('palette'));
  };

  LogColorMapper.prototype.v_map_screen = function(data) {
    var N, buf, color, d, high, i, j, k, log, low, ref, ref1, ref2, ref3, scale, value;
    buf = new ArrayBuffer(data.length * 4);
    color = new Uint32Array(buf);
    low = (ref = this.get('low')) != null ? ref : _.min(data);
    high = (ref1 = this.get('high')) != null ? ref1 : _.max(data);
    N = this._palette.length - 1;
    scale = N / (Math.log1p(high) - Math.log1p(low));
    if (this._little_endian) {
      for (i = j = 0, ref2 = data.length; 0 <= ref2 ? j < ref2 : j > ref2; i = 0 <= ref2 ? ++j : --j) {
        d = data[i];
        if (d > high) {
          d = high;
        } else if (d < low) {
          d = low;
        }
        log = Math.log1p(d) - Math.log1p(low);
        value = this._palette[Math.floor(log * scale)];
        color[i] = (0xff << 24) | ((value & 0xff0000) >> 16) | (value & 0xff00) | ((value & 0xff) << 16);
      }
    } else {
      for (i = k = 0, ref3 = data.length; 0 <= ref3 ? k < ref3 : k > ref3; i = 0 <= ref3 ? ++k : --k) {
        d = data[i];
        if (d > high) {
          d = high;
        } else if (d < low) {
          d = low;
        }
        log = Math.log1p(d) - Math.log1p(low);
        value = this._palette[Math.floor(log * scale)];
        color[i] = (value << 8) | 0xff;
      }
    }
    return buf;
  };

  return LogColorMapper;

})(ColorMapper.Model);

module.exports = {
  Model: LogColorMapper
};
