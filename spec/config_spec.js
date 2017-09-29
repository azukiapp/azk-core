import { Config } from '../src/config';
import h from './spec_helper';

describe('Config', function() {
  var config, env;

  beforeEach(function () {
    config = new Config({
      '*': {
        newOption: 'ABC',
        default: Config.getEnv('NOT_SET', 'default_value'),
        defaultFn: Config.getEnv('NOT_SET', () => 'function_return'),
      },
      'test': {
        testConfig: 'only_in_test',
        dynamicOpt: Config.dynamic('dynamicOpt')
      }
    });

    // Back env before test
    env = config.get('env');
  });

  afterEach(() => config.set('env', env));

  it('should set a env key', () => {
    config.set('env', 'production');
    h.expect(config.get('env')).to.equal('production');
  });

  it('should support default values', () => {
    h.expect(config.get('default')).to.equal('default_value');
    h.expect(config.get('defaultFn')).to.equal('function_return');
  });

  it('should merge options', () => {
    config.set('env', 'test');
    h.expect(config.get('newOption')).to.equal('ABC');
    h.expect(config.get('testConfig')).to.equal('only_in_test');
  });

  it('should defines an arbitrary key', () => {
    config.set('env', 'test_set');
    config.set('any:foo', 'bar');
    h.expect(config.get('any:foo')).to.equal('bar');
  });

  it('should merge a not defined env with a global', () => {
    var default_root = config.get('paths:azk_root');
    var default_data = config.get('paths:data');

    config.set('env', 'not_seted');
    config.set('paths:data', __dirname);
    h.expect(config.get('paths:data')).to.equal(__dirname);
    h.expect(config.get('paths:azk_root')).to.equal(default_root);

    config.set('env', env);
    h.expect(config.get('paths:data')).to.equal(default_data);
  });

  it('should raise exception for dynamic option', () => {
    config.set('env', 'test');
    const fn = () => config.get('dynamicOpt');
    h.expect(fn).to.throw(/Config dynamicOpt/);
  });

  describe('helpers', () => {
    const envs = {
      // Flat values
      UNDEFINED_VALUE: 'undefined',
      NULL_VALUE: 'null',
      TRUE_VALUE: 'true',
      FALSE_VALUE: 'false',

      // Array
      ARRAY_VALUE: '1,2,true,null',
    };

    it('should parse env values', () => {
      h.expect(Config.getEnv('NOT_SET', null, envs)).to.equal(null);
      h.expect(Config.getEnv('UNDEFINED_VALUE', null, envs)).to.equal(undefined);
      h.expect(Config.getEnv('NULL_VALUE', 1, envs)).to.equal(null);
      h.expect(Config.getEnv('TRUE_VALUE', false, envs)).to.equal(true);
      h.expect(Config.getEnv('FALSE_VALUE', true, envs)).to.equal(false);
    });

    it('should parse a array in a env', () => {
      const value = Config.getEnvArray('ARRAY_VALUE', [], envs);
      h.expect(value).to.be.instanceof(Array).and.eql(['1', '2', true, null]);
    });
  });
});
