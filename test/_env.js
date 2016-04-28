"use strict";

function noop() {
  return null;
}

require.extensions['.css'] = noop;

global.NODE_ENV = "development";
global.__DEVELOPMENT__ = true;
global.__TEST__ = true;

global._ = require("lodash");
global.jQuery = require("jquery");
global.React = require("react");
global.d3 = require("d3");
global.ofx4js = require("ofx4js");
global.Updraft = require("updraft");

require("jsdom-global")();
delete global["XMLHttpRequest"]; // mysterious fix: https://github.com/TypeStrong/ts-node/issues/92

var chai = require("chai");
var sinonChai = require("sinon-chai");
chai.use(sinonChai);
