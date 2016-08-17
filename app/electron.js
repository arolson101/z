///<reference path="../typings/main.d.ts"/>
'use strict';

require('module').globalPaths.push(__dirname + "/node_modules");

const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
const fs = require('fs');
const path = require('path');

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
    noInfo: true,
    quiet: true
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
  var configPath = path.join(app.getPath("userData"), "config.json");
  
  var config = readConfig(configPath);
  config.webPreferences = {webSecurity: false};
  
	// Create the browser window.
	mainWindow = new BrowserWindow(config);

	// and load the index.html of the app.
	mainWindow.loadURL(dev ? ('http://localhost:' + port + '/') :  "file://" + __dirname + "/index.html");

	// Open the DevTools.
  if (dev) {
	  mainWindow.webContents.openDevTools();
  }
  
  mainWindow.on('close', function() {
    writeConfig(configPath);
  });

	// Emitted when the window is closed.
	mainWindow.on('closed', function() {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});
});


function readConfig(configPath) {
  var data;
  try {
    data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
  catch(e) {
  }
  
  return Object.assign(
    {
      width: 1280,
      height: 1024
    },
    data
  );
}

function writeConfig(configPath) {
  var data = Object.assign(
    {}, 
    readConfig(configPath),
    mainWindow.getBounds()
  );
  fs.writeFileSync(configPath, JSON.stringify(data));
}
