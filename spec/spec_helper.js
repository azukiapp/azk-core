var { Utils, path, Q } = require('../../index');
var chai  = require('chai');
var tmp = require('tmp');

// Chai extensions
chai.use(require('chai-as-promised'));
chai.use(require('chai-things'));
chai.config.includeStack = true;

var Helpers = {
  expect : chai.expect,

  fixture_path(...fixture) {
    var src_folder = path.resolve(__dirname);
    var fixtures_path = Utils.resolve(src_folder, '..', '..', 'spec', 'fixtures', ...fixture);
    return fixtures_path;
  },

  tmp_dir(opts = { prefix: "azk-test-"}) {
    return Q.nfcall(tmp.dir, opts).then((dir) => {
      return Utils.resolve(dir[0]);
    });
  },

};

export default Helpers;
