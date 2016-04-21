///<reference path="./project.d.ts"/>
import { System, StoreInfo, OpenStoreInfo } from "./system";

import sqlite3 = require("sqlite3");
import FilesystemBackend = require("i18next-node-fs-backend");


class NodeSystem implements System {
  constructor() {
    if (__DEVELOPMENT__) {
      console.log("using node system");
    }
  }

  supportsPassword(): boolean {
    return true;
  }

  i18nBackend(): any {
    return FilesystemBackend;
  }

  listStores(): Promise<StoreInfo[]> {
    return Promise.resolve([]);
  }

  openStore(info: OpenStoreInfo): Promise<Updraft.DbWrapper> {
    const storePath = info.name;
    return sqliteOpen(storePath, info.create ? sqlite3.OPEN_CREATE : sqlite3.OPEN_READWRITE)
    .then(sdb => sqliteKey(sdb, info.password))
    .then(sdb => Updraft.createSQLiteWrapper(sdb));
  }
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


export = new NodeSystem();
