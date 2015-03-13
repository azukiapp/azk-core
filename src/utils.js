import { i18n } from './i18n';

var { join, basename, dirname } = require('path');
var crypto = require('crypto');
var Q      = require('q');
var _      = require('lodash');
var fs     = require('fs');
var zlib   = require('zlib');

var Utils = {
  __esModule: true,

  get default() { return Utils; },
  get i18n() {    return i18n; },
  get Q() {       return Q; },
  get _() {       return _; },
  get net() {     return require('azk/utils/net').default; },
  get docker() {  return require('azk/utils/docker').default; },

  envs(key, defaultValue = null) {
    return process.env[key] || (_.isFunction(defaultValue) ? defaultValue() : defaultValue);
  },

  mergeConfig(options) {
    _.each(options, (values, key) => {
      if (key != '*') {
        options[key] = _.merge({}, options['*'], values);
      }
    });
    return options;
  },

  cd(target, func) {
    var result, old = process.cwd();

    process.chdir(target);
    result = func();
    process.chdir(old);

    return result;
  },

  resolve(...path) {
    path = join(...path);

    // Remove file from path
    var file = "";
    var stat = fs.statSync(path);
    if (stat.isFile()) {
      file = basename(path);
      path = dirname(path);
    }

    return Utils.cd(path, function() {
      return join(process.cwd(), file);
    });
  },

  defer(func) {
    return Q.Promise((resolve, reject, notify) => {
      setImmediate(() => {
        var result;

        try {
          resolve = _.extend(resolve, { resolve: resolve, reject: reject, notify: notify });
          result = func(resolve, reject, notify);
        } catch (e) {
          return reject(e);
        }

        if (Q.isPromise(result)) {
          result.progress(notify).then(resolve, reject);
        } else if (typeof(result) != "undefined") {
          resolve(result);
        }
      });
    });
  },

  async(obj, func, ...args) {
    return Utils.defer((_resolve, _reject, notify) => {
      if (typeof obj == "function") {
        [func, obj] = [obj, null];
      }

      if (typeof obj == "object") {
        func = func.bind(obj);
      }

      return Q.async(func).apply(func, [...args].concat(notify));
    });
  },

  qify(Klass) {
    if (_.isString(Klass)) {
      Klass = require(Klass);
    }

    var NewClass = function(...args) {
      Klass.call(this, ...args);
    };

    NewClass.prototype = Object.create(Klass.prototype);

    _.each(_.methods(Klass.prototype), (method) => {
      var original = Klass.prototype[method];
      NewClass.prototype[method] = function(...args) {
        return Q.nbind(original, this)(...args);
      };
    });

    return NewClass;
  },

  qifyModule(mod) {
    var newMod = _.clone(mod);

    _.each(_.methods(mod), (method) => {
      var original = mod[method];
      newMod[method] = function(...args) {
        return Q.nbind(original, this)(...args);
      };
    });

    return newMod;
  },

  unzip(origin, target) {
    return Utils.defer((done) => {
      try {
        var input  = fs.createReadStream(origin);
        var output = fs.createWriteStream(target);

        output.on("close", () => done.resolve());
        input.pipe(zlib.createGunzip()).pipe(output);
      } catch (err) {
        done.reject(err);
      }
    });
  },

  deepExtend(origin, target) {
    target = _.clone(target);

    _.each(origin, (value, key) => {
      if (!_.has(target, key) || typeof(target[key]) != typeof(value)) {
        target[key] = value;
      } else if (_.isObject(target[key]) && _.isObject(value)) {
        target[key] = Utils.deepExtend(value, target[key]);
      }
    });

    return target;
  },

  calculateHash(string) {
    var shasum = crypto.createHash('sha1');
    shasum.update(string);
    return shasum.digest('hex');
  },

  escapeRegExp(value) {
    return (value || "").replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
  },

  template(template_string, data) {
    var options = { interpolate: /(?:(?:[#|$]{|<%)[=|-]?)([\s\S]+?)(?:}|%>)/g };
    var compiled = _.template(template_string, options);
    return compiled(data);
  },

  isBlank (obj) {
    return _.isNull(obj) ||
           _.isUndefined(obj) ||
           obj === false;
  },

  get lazy_require() {
    return (obj, loads) => {
      var _ = this._;
      _.each(loads, (func, getter) => {
        if (!_.isFunction(func)) {
          var opts = func;

          // Only name module support
          if (_.isString(opts)) {
            opts = [opts];
          } else if (_.isEmpty(opts[1])) {
            opts[1] = getter;
          }

          // Require function
          func = () => {
            var mod = require(opts[0]);
            return _.isEmpty(opts[1]) ? mod : mod[opts[1]];
          };
        }
        obj.__defineGetter__(getter, func);
      });
    };
  },

};

module.exports = Utils;
