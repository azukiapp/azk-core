import _ from 'lodash';

const EnvVarName = 'NODE_ENV';
const DefaultEnv = 'production';

export class Dynamic {
  constructor(key) { this.key = key; }
}

export class Config {
  constructor(options = {'*': {}}) {
    this._options = this._mergeConfig(options);
  }

  static dynamic(key) {
    return new Dynamic(key);
  }

  static getEnv(key, defaultValue = null, envs = process.env) {
    if (_.isUndefined(envs[key])) {
      return (_.isFunction(defaultValue) ? defaultValue() : defaultValue);
    }

    return this._parse(envs[key]);
  }

  static getEnvArray(key, defaultValue = undefined, envs = process.env) {
    const value = this.getEnv(key, defaultValue, envs);
    return (!value || _.isEmpty(value))
      ? defaultValue
      : _.map(value.split(','), v => this._parse(v.trim()));
  }

  get(key) {
    if (key == 'env') {
      return this.constructor.getEnv(EnvVarName, DefaultEnv);
    }

    var keys   = key.split(':');
    var buffer = this._options[this.constructor.getEnv(EnvVarName, DefaultEnv)] || this._options['*'];

    for (var i = 0; i < keys.length; i++) {
      buffer = buffer[keys[i]];
      if (!buffer) {
        break;
      }
    }

    if (buffer instanceof Dynamic) {
      throw new Error(`Config ${buffer.key} to be set by configure`);
    }

    return _.clone(buffer);
  }

  set(key, value) {
    if (key == 'env') {
      process.env[EnvVarName] = value;
    } else {
      var keys   = [this.constructor.getEnv(EnvVarName, DefaultEnv), ...key.split(':')];
      var buffer = {};
      buffer[keys.pop()] = value;

      while ((key = keys.pop())) {
        var inner_buffer  = {};
        inner_buffer[key] = buffer;
        buffer = inner_buffer;
      }

      // Check env exist
      if (!this._options[this.constructor.getEnv(EnvVarName, DefaultEnv)]) {
        this._options[this.constructor.getEnv(EnvVarName, DefaultEnv)] = _.cloneDeep(this._options['*']);
      }

      _.merge(this._options, buffer);
    }
    return value;
  }

  static _parse(value) {
    switch (value) {
      case 'undefined':
        return undefined;
      case 'null':
        return null;
      case 'false':
        return false;
      case 'true':
        return true;
      default:
        return value;
    }
  }

  _mergeConfig(options) {
    return _.mapValues(options, (values, key) => {
      if (key != '*') {
        return _.merge({}, options['*'], values);
      }
      return values;
    });
  }
}
