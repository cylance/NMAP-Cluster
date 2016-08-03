var JL, levels, logger, set_log_level;

JL = require("jsnlog").JL;

logger = JL("Bokeh");

logger.setOptions({
  "appenders": [JL.createConsoleAppender('consoleAppender')],
  "level": JL.getInfoLevel()
});

levels = {
  "trace": JL.getTraceLevel(),
  "debug": JL.getDebugLevel(),
  "info": JL.getInfoLevel(),
  "warn": JL.getWarnLevel(),
  "error": JL.getErrorLevel(),
  "fatal": JL.getFatalLevel()
};

set_log_level = function(level) {
  if (!(level in levels)) {
    console.log("Bokeh: Unrecognized logging level '" + level + "' passed to Bokeh.set_log_level, ignoring.");
    console.log("Bokeh: Valid log levels are: " + (Object.keys(levels)));
    return;
  }
  console.log("Bokeh: setting log level to: '" + level + "'");
  logger.setOptions({
    "level": levels[level]
  });
  return null;
};

module.exports = {
  levels: levels,
  logger: logger,
  set_log_level: set_log_level
};
