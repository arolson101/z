"use strict";

var webpack = require("webpack");
var fs = require("fs");
var path = require("path");
var ForkCheckerPlugin = require('awesome-typescript-loader').ForkCheckerPlugin;

var production = 0;

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    //if(x.match(/react/)) return false;
    return ['.bin', 'react-fa'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

module.exports = {
  context: path.join(__dirname, 'src'),

	entry: //{
		// vendor:
		// [
		// 	"bootstrap/dist/css/bootstrap.min.css",
		// 	"bootstrap-datepicker/dist/css/bootstrap-datepicker3.css",
		// 	"select2/dist/css/select2.css",
		// 	"x-editable/dist/bootstrap3-editable/css/bootstrap-editable.css",

		// 	"bootstrap",
		// 	"bootstrap-datepicker/dist/js/bootstrap-datepicker.js",
		// 	"core-decorators",
		// 	"current-locale",
		// 	"filist",
		// 	"history",
		// 	"i18next-client",
		// 	"jquery",
		// 	"lodash",
		// 	//"metisMenu",
		// 	"moment",
		// 	"numeral",
		// 	"ofx4js",
		// 	"radium",
		// 	"react",
		// 	"react-dom",
		// 	"react-bootstrap",
		// 	"react-fa",
		// 	"react-ladda",
		// 	"react-mixin",
		// 	"react-router",
		// 	"redux",
		// 	"redux-devtools",
		// 	"redux-devtools-dock-monitor",
		// 	"redux-devtools-log-monitor",
		// 	"redux-form",
		// 	"redux-simple-router",
		// 	"rrule",
		// 	"rrule/lib/nlp",
		// 	"safe-access",
		// 	"select2",
		// 	"string-hash",
		// 	"sortablejs",
		// 	"updraft",
		// 	"x-editable/dist/bootstrap3-editable/js/bootstrap-editable.js",
		// ],
		//app:
		 [
			"./index.ts"
		],
	//},
	
	//target: "electron",
  externals: nodeModules,
  //externals: /^[a-z\-0-9]+$/,

	output: {
		path: __dirname + "/app",
		filename: "z.js",
		library: "z"
	},

	resolve: {
		extensions: ['', '.js', '.jsx', '.ts', '.tsx'],
		//root: [path.join(__dirname, "bower_components")]
    
    alias: {
      // https://github.com/i18next/i18next/issues/477
      i18next: 'i18next/lib/index.js'
    }
	},

	module: {
		loaders: [
			{ test: /\.tsx?$/, loaders: ['react-hot', 'awesome-typescript-loader?forkChecker=true'] },
			{ test: /\.css$/, loader: "style-loader!css-loader" },
			{ test: /\.(svg|woff|woff2|ttf|eot)($|\?)/, loader: "file?name=fonts/[name].[ext]" },
			{ test: /\.(png|gif|jpg)($|\?)/, loader: "file?name=images/[name].[ext]" },
		]
	},

	plugins: [
		new ForkCheckerPlugin(),

		// production defines
		new webpack.DefinePlugin({
			__DEVELOPMENT__: production ? 0 : 1,
			"process.env": {
				NODE_ENV: JSON.stringify(production ? "production" : "development")
			}
		}),

		// // separate vendor chunk
		// new webpack.optimize.CommonsChunkPlugin({
		// 	name: "vendor",
		// 	filename: "vendor.js"
		// }),

		// globals
		new webpack.ProvidePlugin({
			_: "lodash",
			$: "jquery",
			jQuery: "jquery",
			"window.jQuery": "jquery",
			"React": "react/addons",
			"ReactBootstrap": "react-bootstrap",
			"Updraft": "updraft",
			"ofx4js": "ofx4js",
		}),
	],

	resolveLoader: {
		root: __dirname + "/node_modules",
		alias: {
			'copy': 'file-loader?name=/[name].[ext]',
		}
	},

	//devtool: "source-map"
	devtool: "eval"
};


if(production) {
	module.exports.plugins.push(new webpack.optimize.UglifyJsPlugin({
		compress: {
			warnings: false
		},
		test: /\.jsx?($|\?)/i
	}));
}
