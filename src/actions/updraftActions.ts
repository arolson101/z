///<reference path="../project.d.ts"/>

import sqlite3 = require("sqlite3");

import { Action, Dispatch, Thunk, ThunkPromise } from "./action";
import {
  Account,
  AccountTable,
  accountSpec,
  Institution,
  InstitutionTable,
  institutionSpec,
  Bill,
  BillTable,
  billSpec,
  Transaction,
  TransactionTable,
  transactionSpec
} from "../types";
import { changeConfig } from "./configActions";
import { UpdraftCollection, defineUpdraftCollection } from "../util";


export interface KnownDb {
  name: string;
  path: string;
  size: number;
  lastModified: Date;
}

export interface UpdraftState {
  sdb?: sqlite3.Database;
  store?: Updraft.Store;
  accountTable?: AccountTable;
  institutionTable?: InstitutionTable;
  billTable?: BillTable;
  transactionTable?: TransactionTable;
}

interface UpdraftOpenAction extends Action {
  state: UpdraftState;
}

export { Account };
export type AccountCollection = UpdraftCollection<Account>;

export const {
  load: loadAccounts,
  add: addAccount,
  reducer: accountCollectionReducer
} = defineUpdraftCollection(accountSpec);


export { Bill };
export type BillCollection = UpdraftCollection<Bill>;

export const {
  load: loadBills,
  add: addBill,
  reducer: billCollectionReducer
} = defineUpdraftCollection(billSpec);


export { Institution };
export type InstitutionCollection = UpdraftCollection<Institution>;

export const {
  load: loadInstitutions,
  add: addInstitution,
  reducer: institutionCollectionReducer
} = defineUpdraftCollection(institutionSpec);


export { Transaction };
export type TransactionCollection = UpdraftCollection<Transaction>;

export const {
  load: loadTransactions,
  add: addTransaction,
  reducer: transactionCollectionReducer
} = defineUpdraftCollection(transactionSpec);


const UPDRAFT_OPENED = "updraft/opened";

type loadAction = (table: Updraft.TableAny) => ThunkPromise;
const tableLoadActionMap = new Map<Updraft.TableSpecAny, loadAction>([
  [accountSpec, loadAccounts],
  [institutionSpec, loadInstitutions],
  [billSpec, loadBills],
  //[transactionSpec, loadTransactions],
]);

export function updraftOpened(state: UpdraftState): UpdraftOpenAction {
  return {
    type: UPDRAFT_OPENED,
    state
  };
}

export function updraftReducer(state: UpdraftState = {}, action?: Action): UpdraftState {
  switch (action.type) {
    case UPDRAFT_OPENED:
      return (action as UpdraftOpenAction).state;
    default:
      return state;
  }
}

function tableForSpec(state: UpdraftState, spec: Updraft.TableSpecAny): Updraft.TableAny {
  return _.find(state as any, (value: any, key: string) => value && ((value as Updraft.TableAny).spec === spec));
}

export function updraftLoadData(state: UpdraftState): Thunk {
  return (dispatch: Dispatch) => {
    tableLoadActionMap.forEach((loadAction, spec) => {
      const table = tableForSpec(state, spec);
      dispatch(loadAction(table));
    });
  };
}

export function updraftAdd(state: UpdraftState, ...changes: Updraft.TableChange<any, any>[]): ThunkPromise {
  return (dispatch: Dispatch) => {
    return state.store.add(...changes)
    .then(() => {
      let tables = _.map(changes, "table") as Updraft.TableAny[];
      tables = _.uniq(tables);
      let promises = tables.map((table) => {
        const loadAction = tableLoadActionMap.get(table.spec);
        if (loadAction) {
          return dispatch(loadAction(table)) as Promise<any>;
        }
      });
      return Promise.all(promises);
    });
  };
}


export interface CreateDbInfo {
  path: string;
  password: string;
}


export function updraftCreateDb(info: CreateDbInfo): ThunkPromise {
  return openDb(info.path, info.password, sqlite3.OPEN_CREATE);
}


export function updraftOpenDb(info: CreateDbInfo): ThunkPromise {
  return openDb(info.path, info.password, sqlite3.OPEN_READWRITE);
}


function openDb(path: string, password: string, mode: number): ThunkPromise {
  return (dispatch: Dispatch) => {
    return sqliteOpen(path, mode)
    .then(sdb => sqliteKey(sdb, password))
    .then(sdb => {
      let db = Updraft.createSQLiteWrapper(sdb);
      let store = Updraft.createStore({db});
      let state: UpdraftState = {
        store,
        sdb
      };

      state.accountTable = store.createTable(accountSpec);
      state.institutionTable = store.createTable(institutionSpec);
      state.billTable = store.createTable(billSpec);
      state.transactionTable = store.createTable(transactionSpec);

      return store.open()
      .then(() => {
        dispatch(addRecentDb(path));
        dispatch(updraftOpened(state));
        dispatch(updraftLoadData(state));
      });
    });
  };
}


function sqliteOpen(path: string, mode: number): Promise<sqlite3.Database> {
  return new Promise<sqlite3.Database>((resolve, reject) => {
    let sdb = new sqlite3.Database(path, /*mode,*/ (err: Error) => {
      //sdb.on("trace", (sql: string) => console.log(sql));
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


function addRecentDb(path: string): Thunk {
  return (dispatch: Dispatch) => {
    const change = changeConfig( { recentDbs: { $set: { [path]: 1 } } } );
    dispatch(change);
  };
}
