///<reference path="./project.d.ts"/>

export interface StoreInfo {
  name: string;
  path: string;
  size: number;
  lastModified: Date;
}


export interface OpenStoreInfo {
  name: string;
  password: string;
  create: boolean;
}


export interface System {
  listStores(): Promise<StoreInfo[]>;
  openStore(info: OpenStoreInfo): Promise<Updraft.DbWrapper>;
  supportsPassword(): boolean;
  i18nBackend(): any;
}


function detectSystem(): System {
  try {
    if (__TEST__) {
      return require("./system.node");
    }

    require("electron");
    return require("./system.electron");
  }
  catch (ex) {
    if (__TEST__) {
      console.error(ex);
    }
  }

  return require("./system.browser");
}


export const sys: System = detectSystem();
