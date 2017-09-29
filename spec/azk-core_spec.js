import * as AzkCore from '../src';
import { Config } from '../src';
import h from './spec_helper';

describe('AzkCore interface', function() {
  it('should exists', function() {
    h.expect(AzkCore).to.not.be.undefined;
  });

  describe('_:', function() {
    it('should have lodash', function() {
      h.expect(AzkCore._).to.not.be.undefined;
    });

    it('should lodash be working', function() {
      var _ = AzkCore._;
      var objA = {a: 1};
      var objB = {a: 2, b: 3};
      _.merge( objA, objB );
      h.expect(objA).to.be.deep.eql({a: 2, b: 3});
    });
  });

  describe('Log:', function() {
    var Log = AzkCore.Log;

    it('should have Log', function() {
      h.expect(Log).to.not.be.undefined;
    });

    it('should configure Log', function() {
      var log = new Log(new Config());

      log._log.setConsoleLevel('debug');
      log._log.debug('debug must be visible');
      log._log.info('info');
      log._log.warn('warn');
      log._log.error('error');

      log._log.setConsoleLevel('error');
      log._log.debug('debug');
      log._log.info('info');
      log._log.warn('warn');
      log._log.error('error is alone now');
    });
  });
});
