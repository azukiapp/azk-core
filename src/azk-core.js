import { get as config, set as set_config }  from './config';
import { Q, _, i18n, defer, async, isBlank, lazy_require } from './utils';

Q.longStackSupport = true;

// Default i18n method
var _t   = null;
var _log = null;

module.exports = {
  __esModule: true,

  get version() {
    return require('package.json').version;
  },
  get Q() {  return Q; },
  get _() {  return _; },
  get lazy_require() {  return lazy_require; },
  get t() {
    if (!_t) {
      _t = new i18n({
        path: this.path.join(this.config('paths:azk_root'), 'shared', 'locales'),
        locale: config('locale'),
      }).t;
    }
    return _t;
  },

  // Config options
  get config() { return config; },
  get set_config() { return set_config; },

  // Promise helpers
  get defer() { return defer; },
  get async() { return async; },

  // Internals alias
  get os() {      return require('os'); },
  get path() {    return require('path'); },
  get fs() {      return require('fs-extra'); },
  get utils() {   return require('./utils'); },
  get isBlank() { return isBlank; },

  get log() {
    if (!_log) {
      _log = require('azk/utils/log').log;
    }
    return _log;
  },
};
