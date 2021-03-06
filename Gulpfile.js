var gulp = require("gulp");
var gutil = require("gulp-util");
var insert = require('gulp-insert');
var istanbul = require('gulp-istanbul');
var mergeStream = require('merge-stream');
var mocha = require('gulp-mocha');
var rename = require("gulp-rename");
var sourcemaps = require("gulp-sourcemaps")
var ts = require("gulp-typescript");
var webpack = require("webpack");
var WebpackDevServer = require("webpack-dev-server");
var webpackConfig = require("./webpack.config.js");

// enable typescript tests in mocha
require('ts-node/register');


gulp.task('pre-test', function () {
    var tsResult = gulp.src('src/**/*.ts')
//        .pipe(sourcemaps.init())
        .pipe(ts({module: 'commonjs'}));

    return tsResult.js
        // rename the js back to ts so that the require hook can find them
        .pipe(rename(function (path) { path.extname = ".ts" }))
//        .pipe(sourcemaps.write())
        // insert ignore statements on ts->js boilerplate
        .pipe(insert.transform(function(contents, file) {
            [
                "var __extends = ",
                "function __export(",
            ].forEach(function(ignore) {
                contents = contents.replace(ignore, "/* istanbul ignore next */ " + ignore);
            });
            contents = contents.replace(/(var _a(,|;))/g, "/* istanbul ignore next */ $1");
            return contents;
        }))
        // Covering files
        .pipe(istanbul())
        // Force `require` to return covered files
        .pipe(istanbul.hookRequire( {extensions: ['.js', '.ts']} ));
});


gulp.task('test', ['pre-test'], function () {
  return gulp.src(['test/*.ts'])
    .pipe(mocha())
    // Creating the reports after tests ran
    .pipe(istanbul.writeReports())
});


// The development server (the recommended option for development)
//gulp.task("default", ["webpack-dev-server"]);

// Build and watch cycle (another option for development)
// Advantage: No server required, can run app from filesystem
// Disadvantage: Requests are not blocked until bundle is available,
//               can serve an old app on refresh
gulp.task("build-dev", ["webpack:build-dev"], function() {
    gulp.watch(["src/**/*"], ["webpack:build-dev"]);
});

// Production build
gulp.task("build", ["webpack:build"]);

gulp.task("webpack:build", function(callback) {
    // modify some webpack config options
    var myConfig = Object.create(webpackConfig);
    myConfig.plugins = myConfig.plugins.concat(
        new webpack.DefinePlugin({
            "process.env": {
                // This has effect on the react lib size
                "NODE_ENV": JSON.stringify("production")
            }
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin()
    );

    // run webpack
    webpack(myConfig, function(err, stats) {
        if(err) throw new gutil.PluginError("webpack:build", err);
        gutil.log("[webpack:build]", stats.toString({
            colors: true
        }));
        callback();
    });
});

// modify some webpack config options
var myDevConfig = Object.create(webpackConfig);
myDevConfig.devtool = "sourcemap";
myDevConfig.debug = true;

// create a single instance of the compiler to allow caching
var devCompiler = webpack(myDevConfig);

gulp.task("webpack:build-dev", function(callback) {
    // run webpack
    devCompiler.run(function(err, stats) {
        if(err) throw new gutil.PluginError("webpack:build-dev", err);
        gutil.log("[webpack:build-dev]", stats.toString({
            colors: true
        }));
        callback();
    });
});

gulp.task("webpack-dev-server", function(callback) {
    // modify some webpack config options
    var myConfig = Object.create(webpackConfig);
    myConfig.devtool = "eval";
    myConfig.debug = true;

    // Start a webpack-dev-server
    new WebpackDevServer(webpack(myConfig), {
        publicPath: "/" + myConfig.output.publicPath,
        stats: {
            colors: true
        }
    }).listen(8080, "localhost", function(err) {
        if(err) throw new gutil.PluginError("webpack-dev-server", err);
        gutil.log("[webpack-dev-server]", "http://localhost:8080/webpack-dev-server/index.html");
    });
});