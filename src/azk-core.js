import { Q, _, defer, async, isBlank, lazy_require } from './utils/utils';

Q.longStackSupport = true;

var _log = null;

module.exports = {
  __esModule: true,

  get Q() {  return Q; },
  get _() {  return _; },
  get lazy_require() {  return lazy_require; },

  // Promise helpers
  get defer() { return defer; },
  get async() { return async; },

  // Internals alias
  get os() {      return require('os'); },
  get path() {    return require('path'); },
  get fs() {      return require('fs-extra'); },
  get Utils() {   return require('./utils/utils'); },
  get isBlank() { return isBlank; },

  get log() {
    if (!_log) {
      _log = require('./log').log;
    }
    return _log;
  },

};
