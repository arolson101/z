///<reference path="./project.d.ts"/>
import { System, StoreInfo, OpenStoreInfo } from "./system";

import sqlite3 = require("sqlite3");
import electron = require("electron");
import fs = require("fs");
import path = require("path");
import FilesystemBackend = require("i18next-node-fs-backend");

const storeExt = ".zdb";
const userData = electron.remote.app.getPath("userData");


class ElectronSystem implements System {
  constructor() {
    if (__DEVELOPMENT__) {
      console.log("using electron system; userData: ", userData);
    }
  }

  supportsPassword(): boolean {
    return true;
  }

  i18nBackend(): any {
    return FilesystemBackend;
  }

  listStores(): Promise<StoreInfo[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(userData, (err, files) => {
        if (err) {
          reject(err);
        }
        else {
          let stores: StoreInfo[] = _(files)
          .filter((file: string) => {
            return (path.extname(file) == storeExt);
          })
          .map((file: string): StoreInfo => ({
            name: path.basename(file, storeExt),
            path: path.join(userData, file),
            size: 0,
            lastModified: null
          }))
          .value();

          return Promise.all(stores.map(runStat))
          .then(() => resolve(stores), reject);
        }
      });
    });
  }

  openStore(info: OpenStoreInfo): Promise<Updraft.DbWrapper> {
    const storePath = path.join(userData, info.name + storeExt);
    return sqliteOpen(storePath, info.create ? sqlite3.OPEN_CREATE : sqlite3.OPEN_READWRITE)
    .then(sdb => sqliteKey(sdb, info.password))
    .then(sdb => Updraft.createSQLiteWrapper(sdb));
  }
}


function runStat(info: StoreInfo): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.stat(info.path, (err, stats) => {
      if (err) {
        reject(err);
      }
      else {
        info.size = stats.size;
        info.lastModified = stats.mtime;
        resolve();
      }
    });
  });
}


function sqliteOpen(path: string, mode: number): Promise<sqlite3.Database> {
  return new Promise<sqlite3.Database>((resolve, reject) => {
    let sdb = new sqlite3.Database(path, /*mode,*/ (err: Error) => {
      //sdb.on("trace", (sql: string) => console.log(sql));
      //sdb.on("profile", (sql: string, time: number) => console.log(`${time} ms: ${sql}`));
      if (err) {
        reject(err);
      }
      else {
        resolve(sdb);
      }
    });
  });
}


function sqliteKey(sdb: sqlite3.Database, key: string): Promise<sqlite3.Database> {
  return new Promise<sqlite3.Database>((resolve, reject) => {
    // set the key
    sdb.run("PRAGMA key='" + key.replace("'", "''") + "';", (err: Error) => {
      if (err) {
        reject(err);
      }
      else {
        // test the key
        sdb.run("SELECT count(*) FROM sqlite_master;", (err2: Error) => {
          if (err2) {
            reject(err2);
          }
          else {
            resolve(sdb);
          }
        });
      }
    });
  });
}


export = new ElectronSystem();
