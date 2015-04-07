import { _ } from './azk-core';

var winston = require('winston');

export class Log {
  constructor(configGetKey, t) {
    this._log = new winston.Logger();
    this._getConfig = configGetKey;

    // File log
    if (this._getConfig('paths:log') && this._getConfig('logs_level:file')) {
      this._log.add(winston.transports.File, {
        filename: this._getConfig('paths:log'),
        level: this._getConfig('logs_level:file'),
        colorize: true,
        prettyPrint: true,
        json: false,
      });
    }

    // Console log
    var console_opts = {
      handleExceptions: true,
      colorize: true,
      prettyPrint: true,
      level: this._getConfig('logs_level:console') || 'info'
    };
    if (this._getConfig('env') !== 'test') {
      this._log.add(winston.transports.Console, console_opts);
    }

    _.each(winston.levels, (__, method) => {
      var method_name = `${method}_t`;
      this._log[method_name] = function(...args) {
        return this[method](t(...args));
      };
    }, this);

    this._log.setConsoleLevel = (level) => {
      if (_.isEmpty(this._log.transports)) {
        this._log.add(winston.transports.Console, console_opts);
      } else {
        this._log.remove(winston.transports.Console);
        this._log.add(winston.transports.Console, console_opts);
      }
      console_opts.level = level;
    };
  }

  get log() {
    this._log;
  }
}
