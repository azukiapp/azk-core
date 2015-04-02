import h from './spec_helper';
import { ConfigAzk } from '../../index';

describe("azk config module", function() {

  var configAzk, config, get, set, env;

  beforeEach(function () {
    // get ConfigAzk
    configAzk = new ConfigAzk({
      '*': {
        newOption: 'ABC'
      }
    });

    config = configAzk.getKey.bind(configAzk);
    get    = configAzk.getKey.bind(configAzk);
    set    = configAzk.setKey.bind(configAzk);

    // Not change env in test
    env = config('env');
  });

  afterEach(() => set('env', env));

  describe("set call", function() {
    it("should set a env key", function() {
      set('env', 'production');
      h.expect(get('env')).to.equal('production');
    });

    it("should merge options", function() {
      h.expect(get('newOption')).to.equal('ABC');
    });

    it("should defines an arbitrary key", function() {
      set('env', 'test_set');
      set('any:foo', 'bar');
      h.expect(get('any:foo')).to.equal('bar');
    });

    it("should merge a not defined env with a global", function() {
      var default_root = get('paths:azk_root');
      var default_data = get('paths:data');

      set('env', 'not_seted');
      set('paths:data', __dirname);
      h.expect(get('paths:data')).to.equal(__dirname);
      h.expect(get('paths:azk_root')).to.equal(default_root);

      set('env', env);
      h.expect(get('paths:data')).to.equal(default_data);
    });
  });
});
