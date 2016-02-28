///<reference path="../project.d.ts"/>

import * as electron from "electron";
import * as path from "path";
import * as fs from "fs";
import { mutate, Mutate as M } from "updraft";

import { Dispatch, Thunk, Action } from "./action";

interface _Config<strSet> {
  recentDbs?: strSet;
}

interface StringObj {
  [key: string]: any;
}

export interface Config extends _Config<StringObj> {}
export interface ConfigChange extends _Config<M.obj> {}

const emptyConfig: Config = { recentDbs: new Set<string>() };

const app = electron.remote.app;
const initPath = path.join(app.getPath("userData"), "init.json");

const CONFIG_SET = "config/set";
interface SetAction extends Action {
  config: Config;
}

function setConfig(config: Config): SetAction {
  return {
    type: CONFIG_SET,
    config
  };
}

const CONFIG_MUTATE = "config/mutate";
interface ChangeAction extends Action {
  change: ConfigChange;
}

export function changeConfig(change: ConfigChange): ChangeAction {
  return {
    type: CONFIG_MUTATE,
    change
  };
}


export function configReducer(state: Config = emptyConfig, action: Action) {
  switch (action.type) {
    case CONFIG_SET:
      return (action as SetAction).config;
    case CONFIG_MUTATE:
      const config = mutate(state, (action as ChangeAction).change);
      writeConfig(config);
      return config;
    default:
      return state;
  }
}


export function configInit(): Thunk {
  return (dispatch: Dispatch) => {
    try {
      let appConfig = JSON.parse(fs.readFileSync(initPath, "utf8")) as Config;
      console.log("read config from " + initPath);
      dispatch(setConfig(appConfig));
    }
    catch (e) {
      console.warn("error reading config from " + initPath + ": ", e);
    }
  };
}


function writeConfig(config: Config): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.writeFile(initPath, JSON.stringify(config), (err) => {
      if (err) {
        reject(err);
      }
      else {
        resolve();
      }
    });
  });
}
