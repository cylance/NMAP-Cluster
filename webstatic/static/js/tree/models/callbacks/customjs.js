var CustomJS, Model, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

_ = require("underscore");

p = require("../../core/properties");

Model = require("../../model");

CustomJS = (function(superClass) {
  extend(CustomJS, superClass);

  function CustomJS() {
    return CustomJS.__super__.constructor.apply(this, arguments);
  }

  CustomJS.prototype.type = 'CustomJS';

  CustomJS.define({
    args: [p.Any, {}],
    code: [p.String, ''],
    lang: [p.String, 'javascript']
  });

  CustomJS.prototype.initialize = function(attrs, options) {
    CustomJS.__super__.initialize.call(this, attrs, options);
    this.define_computed_property('values', this._make_values, true);
    this.add_dependencies('values', this, ['args']);
    this.define_computed_property('func', this._make_func, true);
    return this.add_dependencies('func', this, ['args', 'code']);
  };

  CustomJS.prototype.execute = function(cb_obj, cb_data) {
    return this.get('func').apply(null, slice.call(this.get('values')).concat([cb_obj], [cb_data], [require]));
  };

  CustomJS.prototype._make_values = function() {
    return _.values(this.get("args"));
  };

  CustomJS.prototype._make_func = function() {
    var code, coffee;
    code = this.get("code");
    code = (function() {
      switch (this.get("lang")) {
        case "javascript":
          return code;
        case "coffeescript":
          coffee = require("coffee-script");
          return coffee.compile(code, {
            bare: true,
            shiftLine: true
          });
      }
    }).call(this);
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Function, slice.call(_.keys(this.get("args"))).concat(["cb_obj"], ["cb_data"], ["require"], [code]), function(){});
  };

  return CustomJS;

})(Model);

module.exports = {
  Model: CustomJS
};
