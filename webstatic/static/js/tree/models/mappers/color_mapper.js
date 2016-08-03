var ColorMapper, Model, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

Model = require("../../model");

ColorMapper = (function(superClass) {
  extend(ColorMapper, superClass);

  function ColorMapper() {
    return ColorMapper.__super__.constructor.apply(this, arguments);
  }

  ColorMapper.prototype.type = "ColorMapper";

  ColorMapper.prototype.initialize = function(attrs, options) {
    return ColorMapper.__super__.initialize.call(this, attrs, options);
  };

  ColorMapper.prototype.v_map_screen = function(data) {
    return null;
  };

  ColorMapper.prototype._is_little_endian = function() {
    var buf, buf32, buf8, little_endian;
    buf = new ArrayBuffer(4);
    buf8 = new Uint8ClampedArray(buf);
    buf32 = new Uint32Array(buf);
    buf32[1] = 0x0a0b0c0d;
    little_endian = true;
    if (buf8[4] === 0x0a && buf8[5] === 0x0b && buf8[6] === 0x0c && buf8[7] === 0x0d) {
      little_endian = false;
    }
    return little_endian;
  };

  ColorMapper.prototype._build_palette = function(palette) {
    var _convert, i, j, new_palette, ref;
    new_palette = new Uint32Array(palette.length + 1);
    _convert = function(value) {
      if (_.isNumber(value)) {
        return value;
      } else {
        return parseInt(value.slice(1), 16);
      }
    };
    for (i = j = 0, ref = palette.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      new_palette[i] = _convert(palette[i]);
    }
    new_palette[new_palette.length - 1] = _convert(palette[palette.length - 1]);
    return new_palette;
  };

  return ColorMapper;

})(Model);

module.exports = {
  Model: ColorMapper
};
