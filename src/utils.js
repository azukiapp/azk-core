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

  update(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
      Object.getOwnPropertyNames(source).forEach(function(propName) {
        Object.defineProperty(target, propName,
          Object.getOwnPropertyDescriptor(source, propName));
      });
    });
    return target;
  },

  clone(obj) {
    var copy = Object.create(Object.getPrototypeOf(obj));
    this.update(copy, obj);
    return copy;
  },

  qify(klass) {
    if (_.isString(klass)) {
      klass = require(klass);
    }

    var newClass = function(...args) {
      klass.call(this, ...args);
    };

    console.log('\n>>---------\n klass:', klass, '\n>>---------\n');
    console.log('\n>>---------\n klass.__proto__:', klass.__proto__, '\n>>---------\n');
    console.log('\n>>---------\n klass.prototype:', klass.prototype, '\n>>---------\n');
    newClass.prototype = Object.create(klass.prototype);

    _.each(_.functions(klass), (method) => {
      var original = klass.prototype[method];
      newClass.prototype[method] = function(...args) {
        return Q.nbind(original, this)(...args);
      };
    });

    return newClass;
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
  }
};

module.exports = Utils;