var Bokeh, _, logging;

_ = require("underscore");

Bokeh = {};

Bokeh.require = require;

Bokeh.version = '0.12.0';

Bokeh._ = require("underscore");

Bokeh.$ = require("jquery");

Bokeh.Backbone = require("backbone");

Bokeh.Backbone.$ = Bokeh.$;

logging = require("./core/logging");

Bokeh.logger = logging.logger;

Bokeh.set_log_level = logging.set_log_level;

Bokeh.index = require("./base").index;

Bokeh.embed = require("./embed");

Bokeh.Models = require("./base").Models;

_.extend(Bokeh, require("./api"));

Bokeh.Bokeh = Bokeh;

module.exports = Bokeh;
