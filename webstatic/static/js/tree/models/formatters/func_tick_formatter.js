var FuncTickFormatter, TickFormatter, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

p = require("../../core/properties");

TickFormatter = require("../formatters/tick_formatter");

FuncTickFormatter = (function(superClass) {
  extend(FuncTickFormatter, superClass);

  function FuncTickFormatter() {
    return FuncTickFormatter.__super__.constructor.apply(this, arguments);
  }

  FuncTickFormatter.prototype.type = 'FuncTickFormatter';

  FuncTickFormatter.define({
    code: [p.String, ''],
    lang: [p.String, 'javascript']
  });

  FuncTickFormatter.prototype.doFormat = function(ticks) {
    var code, coffee, func;
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
    func = new Function("tick", "var func = " + code + "return func(tick)");
    return _.map(ticks, func);
  };

  return FuncTickFormatter;

})(TickFormatter.Model);

module.exports = {
  Model: FuncTickFormatter
};
