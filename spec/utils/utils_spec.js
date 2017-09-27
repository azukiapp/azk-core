import Utils from '../../src/utils/utils';
import h from '../spec_helper';

var { join } = require('path');

describe('Azk Utils module', function() {
  it('should run function in cwd', function() {
    var current = process.cwd();
    var other = null;
    Utils.cd(__dirname, () => {
      other = process.cwd();
    });
    h.expect(current).to.not.equal(other);
    h.expect(current).to.equal(process.cwd());
    h.expect(other).to.equal(__dirname);
  });

  it('should resolve a directory path', function() {
    var result = Utils.resolve('./', '../');
    h.expect(result).to.equal(join(process.cwd(), '..'));
  });

  it('should resolve a file path', function() {
    var result = Utils.resolve('./', 'spec', 'utils', 'utils_spec.js');
    h.expect(result).to.equal(join(process.cwd(), 'spec', 'utils', 'utils_spec.js'));
  });

  it('should escape string with special regex characters', function() {
    var string = '-\\[]{}()*+?.,^$|#';
    var func = () => string.match(RegExp(string));
    h.expect(func).to.throw(SyntaxError);
    h.expect(string).to.match(RegExp(Utils.escapeRegExp(string)));
  });

  it('should expand templae', function() {
    var result, data = { value: 'foo', hash: { key: 'bar' } };
    result = Utils.template('<%= value %> - #{hash.key}', data);
    h.expect(result).to.equal('foo - bar');
  });
});
