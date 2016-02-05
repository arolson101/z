'use strict';

require('module').globalPaths.push(__dirname + "/node_modules");

const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.

const dev = true;
const port = 3000;

if (dev) {
  var WebpackDevServer = require("webpack-dev-server");
  var webpack = require("webpack");
  var config = require("../webpack.config.js");
  config.entry.unshift("webpack-dev-server/client?http://localhost:" + port);
  config.entry.unshift("webpack/hot/dev-server");
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  var compiler = webpack(config);
  var server = new WebpackDevServer(compiler, {
		contentBase: "app",
    hot: true,
    historyApiFallback: true,
    //stats: { colors: true }
    noInfo: true
  });
  server.listen(port);
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform != 'darwin') {
		app.quit();
	}
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
	// Create the browser window.
	mainWindow = new BrowserWindow({width: 1280, height: 1024});

	// and load the index.html of the app.
	mainWindow.loadURL(dev ? ('http://localhost:' + port + '/') :  "http://localhost:8080");

	// Open the DevTools.
	mainWindow.webContents.openDevTools();

	// Emitted when the window is closed.
	mainWindow.on('closed', function() {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});
});
