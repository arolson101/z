"use strict";

var webpack = require("webpack");
var fs = require("fs");
//var path = require("path");

var production = 0;

module.exports = {
  context: __dirname + "/src",

  entry: {
    vendor:
    [
      "bootstrap/dist/css/bootstrap.min.css",
      "bootstrap-datepicker/dist/css/bootstrap-datepicker3.css",
      "select2/dist/css/select2.css",
      "x-editable/dist/bootstrap3-editable/css/bootstrap-editable.css",

      "bootstrap",
      "bootstrap-datepicker/dist/js/bootstrap-datepicker.js",
      "core-decorators",
      "filist",
      "history",
      "i18next-client",
      "jquery",
      "lodash",
      //"metisMenu",
      "moment",
      "ofx4js",
			"radium",
      "react",
      "react-dom",
      "react-bootstrap",
      "react-fa",
      "react-ladda",
      "react-mixin",
			"react-router",
      "redux",
      "redux-form",
      "redux-simple-router",
      "rrule",
      "safe-access",
      "select2",
      "string-hash",
      "sortablejs",
      "updraft",
      "x-editable/dist/bootstrap3-editable/js/bootstrap-editable.js",
    ],
    app: "./index.ts",
  },

  output: {
    path: __dirname + "/app",
    filename: "z.js",
    library: "z"
  },

  resolve: {
    extensions: ['', '.js', '.jsx', '.ts', '.tsx'],
    //root: [path.join(__dirname, "bower_components")]
  },

  module: {
    loaders: [
      //{ test: /\.json/, loader: "file?name=/config/[name].[ext]" },
      //{ test: /\.json$/, loader: 'json-loader' },
      //{ test: /\.ts$/, loader: 'ts-loader!ts-jsx-loader' },
      //{ test: /\.ts$/, loader: 'typescript-simple-loader' },
      //{ test: /\.tsx?$/, loader: 'awesome-typescript-loader?compiler=ntypescript' },
      //{ test: /\.tsx?$/, loader: 'typescript-simple-loader?compiler=ntypescript' },
      { test: /\.tsx?$/, loader: 'ts-loader' },
      { test: /\.css$/, loader: "style-loader!css-loader" },
      { test: /\.(svg|woff|woff2|ttf|eot)($|\?)/, loader: "file?name=fonts/[name].[ext]" },
      { test: /\.(png|gif|jpg)($|\?)/, loader: "file?name=images/[name].[ext]" },
    ]
  },

  plugins: [

    // production defines
    new webpack.DefinePlugin({
      __DEVELOPMENT__: production ? 0 : 1,
      "process.env": {
        NODE_ENV: JSON.stringify(production ? "production" : "development") 
      }
    }),

    // separate vendor chunk
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      filename: "vendor.js"
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

  resolveLoader: {
    root: __dirname + "/node_modules",
    alias: {
      'copy': 'file-loader?name=/[name].[ext]',
    }
  },

  devtool: "source-map"
};


if(production) {
  module.exports.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    },
    test: /\.jsx?($|\?)/i
  }));
}
