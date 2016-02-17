"use strict";

var webpack = require("webpack");
var fs = require("fs");
var path = require("path");
var ForkCheckerPlugin = require('awesome-typescript-loader').ForkCheckerPlugin;

var production = 0;

var nodeModules = {};
fs.readdirSync('node_modules')
	.concat(["electron"])
  .filter(function(x) {
    return ['.bin', 'react-fa'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

module.exports = {
  context: path.join(__dirname, 'src'),

	entry: [
		"./index.ts"
	],
	
  externals: nodeModules,

	output: {
		path: __dirname + "/app",
		filename: "z.js",
		library: "z"
	},

	resolve: {
		extensions: ['', '.js', '.jsx', '.ts', '.tsx'],
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
