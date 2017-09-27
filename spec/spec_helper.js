import * as tmp from 'tmp';
import { Q, Utils } from '../src';
import chai from 'chai';
import { resolve } from 'path';

require('source-map-support').install();

// Chai extensions
chai.use(require('chai-as-promised'));
chai.config.includeStack = true;

var Helpers = {
  expect : chai.expect,

  fixture_path(...fixture) {
    return resolve(__dirname, 'fixtures', ...fixture);
  },

  tmp_dir(opts = { prefix: 'azk-test-'}) {
    return Q.nfcall(tmp.dir, opts).then((dir) => {
      return Utils.resolve(dir[0]);
    });
  },
};

export default Helpers;
export { chai };
