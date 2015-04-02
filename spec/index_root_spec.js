import h from './spec_helper';
var Index = require('../../index');

describe("Index:", function() {

  it("should exists", function() {
    h.expect(Index).to.not.be.undefined;
  });

  //
  //
  describe("_:", function() {

    it("should have lodash", function() {
      h.expect(Index._).to.not.be.undefined;
    });

    it("should lodash be working", function() {
      var _ = Index._;
      var objA = {a: 1};
      var objB = {a: 2, b: 3};
      _.merge( objA, objB );
      h.expect(objA).to.be.deep.eql({a: 2, b: 3});
    });
  });

  //
  //
  describe("async:", function() {

    it("should have async", function() {
      h.expect(Index.async).to.not.be.undefined;
    });

    it("should async be working", function(done) {
      var Q = Index.Q;
      var async = Index.async;

      var a = null;
      async(function* () {
        var a = 1;
        yield Q.delay(10);
        a = 2;
        yield Q.delay(20);
        h.expect(a).to.be.eql(2);
        done();
      });
      h.expect(a).to.be.eql(null);
    });
  });

  //
  //
  describe("ConfigAzk:", function() {

    var ConfigAzk = null;
    var configAzk = null;

    beforeEach(function() {
      ConfigAzk = Index.ConfigAzk;
      configAzk = new ConfigAzk();
    });

    it("should have config", function() {
      h.expect(Index.ConfigAzk).to.not.be.undefined;
    });

    it("should can configure ConfigAzk", function() {
      h.expect(configAzk).to.not.be.undefined;

      var paths_locales = configAzk.getKey('paths:locales');
      h.expect(paths_locales).to.match(/.*azk-core\/shared\/locales/);
    });

    it("should can receive parameters", function() {
      h.expect(configAzk).to.not.be.undefined;

      configAzk.setKey('paths:locales', 'ONONON');
      var paths_locales = configAzk.getKey('paths:locales');
      h.expect(paths_locales).to.eql('ONONON');
    });

  });

  //
  //
  describe("Log:", function() {

    var Log = Index.Log;

    it("should have Log", function() {
      h.expect(Log).to.not.be.undefined;
    });

    it("should configure Log", function() {
      // config
      var ConfigAzk = Index.ConfigAzk;
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
