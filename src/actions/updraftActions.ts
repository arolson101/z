///<reference path="../project.d.ts"/>

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
import { UpdraftCollection, defineUpdraftCollection } from "../util";
import { sys, OpenStoreInfo } from "../system";


export interface UpdraftState {
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


export { OpenStoreInfo };

export function updraftOpen(info: OpenStoreInfo): ThunkPromise {
  return (dispatch: Dispatch) => {
    return sys.openStore(info)
    .then(db => {
      let store = Updraft.createStore({db});
      let state: UpdraftState = {
        store
      };

      state.accountTable = store.createTable(accountSpec);
      state.institutionTable = store.createTable(institutionSpec);
      state.billTable = store.createTable(billSpec);
      state.transactionTable = store.createTable(transactionSpec);

      return store.open()
      .then(() => {
        dispatch(updraftOpened(state));
        dispatch(updraftLoadData(state));
      });
    });
  };
}

