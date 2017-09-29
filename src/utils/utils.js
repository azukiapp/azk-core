import { I18n } from 'i18n-cli';

var { join, basename, dirname } = require('path');
var crypto = require('crypto');
var Q      = require('q');
var _      = require('lodash');
var fs     = require('fs');
var zlib   = require('zlib');

var Utils = {
  __esModule: true,

  get default() { return Utils; },
  get i18n() {    return I18n; },
  get Q() {       return Q; },
  get _() {       return _; },
  // get net() {     return require('azk/utils/net').default; },
  // get docker() {  return require('azk/utils/docker').default; },
  set net(net_utils_instance) {
    this._net_utils_instance = net_utils_instance;
  },
  get net() {
    return this._net_utils_instance;
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
    var file = '';
    var stat = fs.statSync(path);
    if (stat.isFile()) {
      file = basename(path);
      path = dirname(path);
    }

    return Utils.cd(path, function() {
      return join(process.cwd(), file);
    });
  },

  unzip(origin, target) {
    return Utils.defer((done) => {
      try {
        var input  = fs.createReadStream(origin);
        var output = fs.createWriteStream(target);

        output.on('close', () => done.resolve());
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
    return (value || '').replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
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

  dlog (obj, title, depth) {
    var node_utils = require('util');
    var inspect_result = node_utils.inspect(obj, { showHidden:false, colors:true, depth:depth || null });
    console.log('');
    console.log('  >>-->>-------');
    if (title) {
      console.log('  ' + title);
      console.log('  ---->>--->>--');
    }
    console.log(inspect_result);
    console.log('  -------<<--<<');
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
