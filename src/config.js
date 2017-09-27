import { _, envs, i18n, mergeConfig } from './utils/utils';
var path = require('path');
var src_folder = path.resolve(__dirname);

export class Dynamic {
  constructor(key) { this.key = key; }
}

export class ConfigAzk {
  constructor(options_given) {
    this._t = null;
    this._options = {
      '*': {
        paths: {
          // /azk-core/lib/../shared/locales
          locales: path.resolve(src_folder, '..', 'shared', 'locales')
        },
        agent: {
          portrange_start: 12000,
          dns: {
            ip  : new Dynamic('agent:balancer:ip'),
            port: envs('AZK_DNS_PORT', '53'),
            global: [],
            nameservers  : [],
            defaultserver: ['8.8.8.8', '8.8.4.4'],
          },
        }
      },
    };

    if (options_given) {
      _.merge(this._options, options_given);
    }

    mergeConfig(this._options);
  }

  getKey(key) {
    if (key == 'env') {
      return envs('NODE_ENV', 'production');
    }

    var keys   = key.split(':');
    var buffer = this._options[envs('NODE_ENV', 'production')] || this._options['*'];

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

  setKey(key, value) {
    if (key == 'env') {
      process.env.NODE_ENV = value;
    } else {
      var keys   = [envs('NODE_ENV', 'production'), ...key.split(':')];
      var buffer = {};
      buffer[keys.pop()] = value;

      while ((key = keys.pop())) {
        var inner_buffer  = {};
        inner_buffer[key] = buffer;
        buffer = inner_buffer;
      }

      // Check env exist
      if (!this._options[envs('NODE_ENV', 'production')]) {
        this._options[envs('NODE_ENV', 'production')] = _.cloneDeep(this._options['*']);
      }

      _.merge(this._options, buffer);
    }
    return value;
  }

  get t() {
    if (!this._t) {
      this._t = new i18n({
        path: path.join(this.getKey('paths:locales')),
        locale: this.getKey('locale'),
      }).t;
    }
    return this._t;
  }

}
