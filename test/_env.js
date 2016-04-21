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


const jsdom = require("jsdom");
var doc = jsdom.jsdom('<!doctype html><html><body></body></html>');

// get the window object out of the document
var win = doc.defaultView;

// set globals for mocha that make access to document and window feel 
// natural in the test environment
global.document = doc;
global.window = win;

// take all properties of the window object and also attach it to the 
// mocha global object
propagateToGlobal(win);

// from mocha-jsdom https://github.com/rstacruz/mocha-jsdom/blob/master/index.js#L80
function propagateToGlobal (window) {
  for (let key in window) {
    if (!window.hasOwnProperty(key)) continue;
    if (key in global) continue;

    global[key] = window[key];
  }
}
