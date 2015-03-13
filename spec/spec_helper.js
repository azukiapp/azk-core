require("babel/register");
require('source-map-support').install();
var chai  = require('chai');

// Chai extensions
chai.use(require('chai-as-promised'));
chai.use(require('chai-things'));
chai.config.includeStack = true;

var Helpers = {
  expect : chai.expect,
};

export default Helpers;
