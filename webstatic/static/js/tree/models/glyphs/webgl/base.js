var BaseGLGlyph, _, attach_color, attach_float, color, color2rgba, fill_array_with_float, fill_array_with_vec, line_width, visual_prop_is_singular;

_ = require("underscore");

color = require("../../../core/util/color");

color2rgba = color.color2rgba;

BaseGLGlyph = (function() {
  BaseGLGlyph.prototype.GLYPH = '';

  BaseGLGlyph.prototype.VERT = '';

  BaseGLGlyph.prototype.FRAG = '';

  function BaseGLGlyph(gl, glyph) {
    this.gl = gl;
    this.glyph = glyph;
    this.nvertices = 0;
    this.size_changed = false;
    this.data_changed = false;
    this.visuals_changed = false;
    this.init();
  }

  BaseGLGlyph.prototype.set_data_changed = function(n) {
    if (n !== this.nvertices) {
      this.nvertices = n;
      this.size_changed = true;
    }
    return this.data_changed = true;
  };

  BaseGLGlyph.prototype.set_visuals_changed = function() {
    return this.visuals_changed = true;
  };

  return BaseGLGlyph;

})();

line_width = function(width) {
  if (width < 2) {
    width = Math.sqrt(width * 2);
  }
  return width;
};

fill_array_with_float = function(n, val) {
  var a, i, k, ref;
  a = new Float32Array(n);
  for (i = k = 0, ref = n; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
    a[i] = val;
  }
  return a;
};

fill_array_with_vec = function(n, m, val) {
  var a, i, j, k, l, ref, ref1;
  a = new Float32Array(n * m);
  for (i = k = 0, ref = n; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
    for (j = l = 0, ref1 = m; 0 <= ref1 ? l < ref1 : l > ref1; j = 0 <= ref1 ? ++l : --l) {
      a[i * m + j] = val[j];
    }
  }
  return a;
};

visual_prop_is_singular = function(visual, propname) {
  return !_.isUndefined(visual[propname].spec.value);
};

attach_float = function(prog, vbo, att_name, n, visual, name) {
  var a;
  if (!visual.doit) {
    vbo.used = false;
    return prog.set_attribute(att_name, 'float', null, 0);
  } else if (visual_prop_is_singular(visual, name)) {
    vbo.used = false;
    return prog.set_attribute(att_name, 'float', null, visual[name].value());
  } else {
    vbo.used = true;
    a = new Float32Array(visual.cache[name + '_array']);
    vbo.set_size(n * 4);
    vbo.set_data(0, a);
    return prog.set_attribute(att_name, 'float', [vbo, 0, 0]);
  }
};

attach_color = function(prog, vbo, att_name, n, visual, prefix) {
  var a, alphaname, alphas, colorname, colors, i, j, k, l, m, ref, ref1, rgba;
  m = 4;
  colorname = prefix + '_color';
  alphaname = prefix + '_alpha';
  if (!visual.doit) {
    vbo.used = false;
    return prog.set_attribute(att_name, 'vec4', null, [0, 0, 0, 0]);
  } else if (visual_prop_is_singular(visual, colorname) && visual_prop_is_singular(visual, alphaname)) {
    vbo.used = false;
    rgba = color2rgba(visual[colorname].value(), visual[alphaname].value());
    return prog.set_attribute(att_name, 'vec4', null, rgba);
  } else {
    vbo.used = true;
    if (visual_prop_is_singular(visual, colorname)) {
      colors = (function() {
        var k, ref, results;
        results = [];
        for (i = k = 0, ref = n; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
          results.push(visual[colorname].value());
        }
        return results;
      })();
    } else {
      colors = visual.cache[colorname + '_array'];
    }
    if (visual_prop_is_singular(visual, alphaname)) {
      alphas = fill_array_with_float(n, visual[alphaname].value());
    } else {
      alphas = visual.cache[alphaname + '_array'];
    }
    a = new Float32Array(n * m);
    for (i = k = 0, ref = n; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
      rgba = color2rgba(colors[i], alphas[i]);
      for (j = l = 0, ref1 = m; 0 <= ref1 ? l < ref1 : l > ref1; j = 0 <= ref1 ? ++l : --l) {
        a[i * m + j] = rgba[j];
      }
    }
    vbo.set_size(n * m * 4);
    vbo.set_data(0, a);
    return prog.set_attribute(att_name, 'vec4', [vbo, 0, 0]);
  }
};

module.exports = {
  BaseGLGlyph: BaseGLGlyph,
  line_width: line_width,
  attach_float: attach_float,
  attach_color: attach_color,
  color2rgba: color2rgba
};
