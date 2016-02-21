///<reference path="../project.d.ts"/>

import * as electron from "electron";
import * as path from "path";
import * as fs from "fs";

const app = electron.remote.app;
const initPath = path.join(app.getPath("userData"), "init.json");

let appConfig: any;


function readConfig() {
  try {
    appConfig = JSON.parse(fs.readFileSync(initPath, "utf8"));
    console.log("read config from " + initPath);
  }
  catch (e) {
    console.warn("error reading config from " + initPath + ": ", e);
  }
}


function writeConfig() {
  fs.writeFileSync(initPath, JSON.stringify(appConfig));
}


export function setAppConfig(key: string, value: any) {
  appConfig[key] = value;
  writeConfig();
}


export function getAppConfig(key: string): any {
  if (!appConfig) {
    readConfig();
  }

  return appConfig[key];
}
