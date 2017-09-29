import { _ } from './azk-core';

var winston = require('winston');

export class Log {
  constructor(config, translate = (...args) => args) {
    this._log = new winston.Logger();
    this.config = config;

    // Configure wiston
    this._conectFile();
    this._conectConsole();
    this._setHelpers(translate);
  }

  // Configure to log in file
  _conectFile() {
    if (this._getConfig('paths:log') && this._getConfig('logs_level:file')) {
      this._log.add(winston.transports.File, {
        filename: this._getConfig('paths:log'),
        level: this._getConfig('logs_level:file'),
        colorize: true,
        prettyPrint: true,
        json: false,
      });
    }
  }

  // Configure to log in console
  _conectConsole() {
    this.console_opts = {
      handleExceptions: true,
      colorize: true,
      prettyPrint: true,
      level: this._getConfig('logs_level:console') || 'info'
    };

    if (this._getConfig('env') !== 'test') {
      this._log.add(winston.transports.Console, this.console_opts);
    }
  }

  _setHelpers(translate) {
    _.each(winston.levels, (__, method) => {
      var method_name = `${method}_t`;
      this._log[method_name] = function(...args) {
        return this[method](translate(...args));
      };
    }, this);

    this._log.setConsoleLevel = (level) => {
      if (_.isEmpty(this._log.transports)) {
        this._log.add(winston.transports.Console, this.console_opts);
      } else {
        this._log.remove(winston.transports.Console);
        this._log.add(winston.transports.Console, this.console_opts);
      }
      this.console_opts.level = level;
    };
  }

  _getConfig(...args) {
    return this.config.get(...args);
  }

  get log() {
    this._log;
  }
}
