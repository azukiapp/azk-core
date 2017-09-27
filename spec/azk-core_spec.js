import * as AzkCore from '../src';
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

  describe('ConfigAzk:', function() {
    var ConfigAzk = null;
    var configAzk = null;

    beforeEach(function() {
      ConfigAzk = AzkCore.ConfigAzk;
      configAzk = new ConfigAzk();
    });

    it('should have config', function() {
      h.expect(AzkCore.ConfigAzk).to.not.be.undefined;
    });

    it('should can configure ConfigAzk', function() {
      h.expect(configAzk).to.not.be.undefined;

      var paths_locales = configAzk.getKey('paths:locales');
      h.expect(paths_locales).to.match(/.*azk-core\/shared\/locales/);
    });

    it('should can receive parameters', function() {
      h.expect(configAzk).to.not.be.undefined;

      configAzk.setKey('paths:locales', 'ONONON');
      var paths_locales = configAzk.getKey('paths:locales');
      h.expect(paths_locales).to.eql('ONONON');
    });
  });

  describe('Log:', function() {
    var Log = AzkCore.Log;

    it('should have Log', function() {
      h.expect(Log).to.not.be.undefined;
    });

    it('should configure Log', function() {
      // config
      var ConfigAzk = AzkCore.ConfigAzk;
      var configAzk = new ConfigAzk();
      var getKey = configAzk.getKey.bind(configAzk);
      var t = configAzk.t.bind(configAzk);

      // log
      var log = new Log(getKey, t);

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
