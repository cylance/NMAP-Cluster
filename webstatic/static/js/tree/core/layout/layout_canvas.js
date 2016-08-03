var EQ, GE, LayoutCanvas, Model, Strength, Variable, _, p, ref,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

ref = require("./solver"), Variable = ref.Variable, EQ = ref.EQ, GE = ref.GE, Strength = ref.Strength;

Model = require("../../model");

p = require("../properties");

LayoutCanvas = (function(superClass) {
  extend(LayoutCanvas, superClass);

  function LayoutCanvas() {
    return LayoutCanvas.__super__.constructor.apply(this, arguments);
  }

  LayoutCanvas.prototype.type = 'LayoutCanvas';

  LayoutCanvas.prototype.initialize = function(attrs, options) {
    LayoutCanvas.__super__.initialize.call(this, attrs, options);
    this._top = new Variable("top " + this.id);
    this._left = new Variable("left " + this.id);
    this._width = new Variable("width " + this.id);
    this._height = new Variable("height " + this.id);
    this._right = new Variable("right " + this.id);
    this._bottom = new Variable("bottom " + this.id);
    this.define_computed_property('height', this._get_var, false);
    this.define_computed_property('width', this._get_var, false);
    this.define_computed_property('right', this._get_var, false);
    this.define_computed_property('left', this._get_var, false);
    this.define_computed_property('top', this._get_var, false);
    return this.define_computed_property('bottom', this._get_var, false);
  };

  LayoutCanvas.internal({
    layout_location: [p.Any]
  });

  LayoutCanvas.prototype.get_edit_variables = function() {
    var editables;
    editables = [];
    editables.push({
      edit_variable: this._top,
      strength: Strength.strong
    });
    editables.push({
      edit_variable: this._left,
      strength: Strength.strong
    });
    editables.push({
      edit_variable: this._width,
      strength: Strength.strong
    });
    editables.push({
      edit_variable: this._height,
      strength: Strength.strong
    });
    return editables;
  };

  LayoutCanvas.prototype.get_constraints = function() {
    return [];
  };

  LayoutCanvas.prototype._get_var = function(prop_name) {
    return this['_' + prop_name].value();
  };

  return LayoutCanvas;

})(Model);

module.exports = {
  Model: LayoutCanvas
};
