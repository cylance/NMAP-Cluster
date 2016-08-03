var DEFAULT_DATETIME_FORMATS, DatetimeTickFormatter, SPrintf, TickFormatter, _, _array, _strftime, _us, logger, p, tz,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

SPrintf = require("sprintf");

tz = require("timezone");

TickFormatter = require("./tick_formatter");

logger = require("../../core/logging").logger;

p = require("../../core/properties");

_us = function(t) {
  return Math.round(((t / 1000) % 1) * 1000000);
};

_array = function(t) {
  return tz(t, "%Y %m %d %H %M %S").split(/\s+/).map(function(e) {
    return parseInt(e, 10);
  });
};

_strftime = function(t, format) {
  var microsecond_replacement_string;
  if (_.isFunction(format)) {
    return format(t);
  } else {
    microsecond_replacement_string = SPrintf.sprintf("$1%06d", _us(t));
    format = format.replace(/((^|[^%])(%%)*)%f/, microsecond_replacement_string);
    if (format.indexOf("%") === -1) {
      return format;
    }
    return tz(t, format);
  }
};

DEFAULT_DATETIME_FORMATS = {
  'microseconds': ['%fus'],
  'milliseconds': ['%3Nms', '%S.%3Ns'],
  'seconds': ['%Ss'],
  'minsec': [':%M:%S'],
  'minutes': [':%M', '%Mm'],
  'hourmin': ['%H:%M'],
  'hours': ['%Hh', '%H:%M'],
  'days': ['%m/%d', '%a%d'],
  'months': ['%m/%Y', '%b%y'],
  'years': ['%Y']
};

DatetimeTickFormatter = (function(superClass) {
  extend(DatetimeTickFormatter, superClass);

  function DatetimeTickFormatter() {
    return DatetimeTickFormatter.__super__.constructor.apply(this, arguments);
  }

  DatetimeTickFormatter.prototype.type = 'DatetimeTickFormatter';

  DatetimeTickFormatter.define({
    formats: [p.Any, DEFAULT_DATETIME_FORMATS]
  });

  DatetimeTickFormatter.prototype.format_order = ['microseconds', 'milliseconds', 'seconds', 'minsec', 'minutes', 'hourmin', 'hours', 'days', 'months', 'years'];

  DatetimeTickFormatter.prototype.strip_leading_zeros = true;

  DatetimeTickFormatter.prototype.initialize = function(attrs, options) {
    DatetimeTickFormatter.__super__.initialize.call(this, attrs, options);
    return this._update_width_formats();
  };

  DatetimeTickFormatter.prototype._update_width_formats = function() {
    var fmt_name, fmt_string, fmt_strings, now, ref, results, sizes, sorted;
    now = tz(new Date());
    this._width_formats = {};
    ref = this.formats;
    results = [];
    for (fmt_name in ref) {
      fmt_strings = ref[fmt_name];
      sizes = (function() {
        var j, len, results1;
        results1 = [];
        for (j = 0, len = fmt_strings.length; j < len; j++) {
          fmt_string = fmt_strings[j];
          results1.push(_strftime(now, fmt_string).length);
        }
        return results1;
      })();
      sorted = _.sortBy(_.zip(sizes, fmt_strings), function(arg) {
        var fmt, size;
        size = arg[0], fmt = arg[1];
        return size;
      });
      results.push(this._width_formats[fmt_name] = _.zip.apply(_, sorted));
    }
    return results;
  };

  DatetimeTickFormatter.prototype._get_resolution_str = function(resolution_secs, span_secs) {
    var adjusted_resolution_secs, str;
    adjusted_resolution_secs = resolution_secs * 1.1;
    if (adjusted_resolution_secs < 1e-3) {
      str = "microseconds";
    } else if (adjusted_resolution_secs < 1.0) {
      str = "milliseconds";
    } else if (adjusted_resolution_secs < 60) {
      if (span_secs >= 60) {
        str = "minsec";
      } else {
        str = "seconds";
      }
    } else if (adjusted_resolution_secs < 3600) {
      if (span_secs >= 3600) {
        str = "hourmin";
      } else {
        str = "minutes";
      }
    } else if (adjusted_resolution_secs < 24 * 3600) {
      str = "hours";
    } else if (adjusted_resolution_secs < 31 * 24 * 3600) {
      str = "days";
    } else if (adjusted_resolution_secs < 365 * 24 * 3600) {
      str = "months";
    } else {
      str = "years";
    }
    return str;
  };

  DatetimeTickFormatter.prototype.doFormat = function(ticks, num_labels, char_width, fill_ratio, ticker) {
    var error, error1, fmt, format, formats, good_formats, hybrid_handled, i, j, k, l, labels, len, len1, next_format, next_ndx, r, ref, ref1, ref2, resol, resol_ndx, s, span, ss, t, time_tuple_ndx_for_resol, tm, widths;
    if (num_labels == null) {
      num_labels = null;
    }
    if (char_width == null) {
      char_width = null;
    }
    if (fill_ratio == null) {
      fill_ratio = 0.3;
    }
    if (ticker == null) {
      ticker = null;
    }
    if (ticks.length === 0) {
      return [];
    }
    span = Math.abs(ticks[ticks.length - 1] - ticks[0]) / 1000.0;
    if (ticker) {
      r = ticker.resolution;
    } else {
      r = span / (ticks.length - 1);
    }
    resol = this._get_resolution_str(r, span);
    ref = this._width_formats[resol], widths = ref[0], formats = ref[1];
    format = formats[0];
    if (char_width) {
      good_formats = [];
      for (i = j = 0, ref1 = widths.length; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
        if (widths[i] * ticks.length < fill_ratio * char_width) {
          good_formats.push(this._width_formats[i]);
        }
      }
      if (good_formats.length > 0) {
        format = _.last(good_formats);
      }
    }
    labels = [];
    resol_ndx = this.format_order.indexOf(resol);
    time_tuple_ndx_for_resol = {};
    ref2 = this.format_order;
    for (k = 0, len = ref2.length; k < len; k++) {
      fmt = ref2[k];
      time_tuple_ndx_for_resol[fmt] = 0;
    }
    time_tuple_ndx_for_resol["seconds"] = 5;
    time_tuple_ndx_for_resol["minsec"] = 4;
    time_tuple_ndx_for_resol["minutes"] = 4;
    time_tuple_ndx_for_resol["hourmin"] = 3;
    time_tuple_ndx_for_resol["hours"] = 3;
    for (l = 0, len1 = ticks.length; l < len1; l++) {
      t = ticks[l];
      try {
        tm = _array(t);
        s = _strftime(t, format);
      } catch (error1) {
        error = error1;
        logger.warn("unable to format tick for timestamp value " + t);
        logger.warn(" - " + error);
        labels.push("ERR");
        continue;
      }
      hybrid_handled = false;
      next_ndx = resol_ndx;
      while (tm[time_tuple_ndx_for_resol[this.format_order[next_ndx]]] === 0) {
        next_ndx += 1;
        if (next_ndx === this.format_order.length) {
          break;
        }
        if ((resol === "minsec" || resol === "hourmin") && !hybrid_handled) {
          if ((resol === "minsec" && tm[4] === 0 && tm[5] !== 0) || (resol === "hourmin" && tm[3] === 0 && tm[4] !== 0)) {
            next_format = this._width_formats[this.format_order[resol_ndx - 1]][1][0];
            s = _strftime(t, next_format);
            break;
          } else {
            hybrid_handled = true;
          }
        }
        next_format = this._width_formats[this.format_order[next_ndx]][1][0];
        s = _strftime(t, next_format);
      }
      if (this.strip_leading_zeros) {
        ss = s.replace(/^0+/g, "");
        if (ss !== s && isNaN(parseInt(ss))) {
          ss = '0' + ss;
        }
        labels.push(ss);
      } else {
        labels.push(s);
      }
    }
    return labels;
  };

  return DatetimeTickFormatter;

})(TickFormatter.Model);

module.exports = {
  Model: DatetimeTickFormatter
};
