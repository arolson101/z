function noop() {
  return null;
}

require.extensions['.css'] = noop;

global.window = global;

global._ = require("lodash");
global.jQuery = require("jquery");
global.React = require("react");
global.Chart = require("chart.js");
//require.cache["Chart"] = global.Chart;

// var lodash = require('chart.js') // prime cache
// console.log(require.cache);
// require.cache[require.resolve('Chart')] = require.cache[require.resolve('chart.js')]
// require('assert').equal(require('Chart'), require('chart.js'))
