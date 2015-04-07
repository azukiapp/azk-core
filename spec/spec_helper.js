var { Utils, path, Q } = require('../../index');
var tmp = require('tmp');

var Helpers = {
  expect : require('azk-dev/chai').expect,

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
