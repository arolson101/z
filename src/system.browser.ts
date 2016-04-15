///<reference path="./project.d.ts"/>
import { createWebsqlWrapper } from "updraft";
import * as XHR from "i18next-xhr-backend";

import { System, StoreInfo, OpenStoreInfo } from "./system";

const storesKey = "stores";
const storesSeparator = "|";
const supportsStorage = (
  typeof window != "undefined"
  && typeof window.localStorage != "undefined"
  && typeof window.localStorage.getItem == "function"
  && typeof window.localStorage.setItem == "function"
);


class BrowserSystem implements System {
  constructor() {
    if (__DEVELOPMENT__) {
      console.log("using browser system");
    }
  }

  supportsPassword(): boolean {
    return false;
  }

  i18nBackend(): any {
    return XHR;
  }

  listStores(): Promise<StoreInfo[]> {
    return Promise.resolve(readStores().map((store: string): StoreInfo => ({
      name: store,
      path: store,
      size: 0,
      lastModified: new Date()
    })));
  }

  openStore(info: OpenStoreInfo): Promise<Updraft.DbWrapper> {
    if (supportsStorage) {
      let stores = readStores();
      stores.push(info.name);
      stores = _(stores).uniq().sort().value();
      const value = stores.join(storesSeparator);
      window.localStorage.setItem(storesKey, value);
    }

    const trace = (sql: string) => {
      //console.log(sql);
    };
    return Promise.resolve(
      createWebsqlWrapper(info.name, "1.0", info.name, undefined, trace)
    );
  }
}


function readStores(): string[] {
  let stores: string[] = [];
  if (supportsStorage) {
    const value = window.localStorage.getItem(storesKey) as string || "";
    stores = value ? value.split(storesSeparator) : [];
  }
  return stores;
}


export = new BrowserSystem();
