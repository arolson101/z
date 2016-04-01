///<reference path="../project.d.ts"/>

import { Column, Mutate as M, Query as Q } from "updraft";

export enum TransactionStatus {
  None = 0,
  Scheduled,
}

export interface _Transaction<key, id, str, date, num, status> {
  dbid?: key;
  account?: id;
  date?: date;
  payee?: str;
  amount?: num;
  bill?: id;
  status?: status;
}

export interface Transaction extends _Transaction<number, number, string, Date, number, TransactionStatus> {
  [key: string]: any;
}
export interface TransactionQuery extends _Transaction<Q.num, Q.num, Q.str, Q.date, Q.num, Q.enm<TransactionStatus>> {}
export interface TransactionChange extends _Transaction<number, M.num, M.str, M.date, M.num, M.enm<TransactionStatus>> {}
export type TransactionTable = Updraft.Table<Transaction, TransactionChange, TransactionQuery>;
export type TransactionTableSpec = Updraft.TableSpec<Transaction, TransactionChange, TransactionQuery>;

export const transactionSpec: TransactionTableSpec = {
  name: "transactions",
  columns: {
    dbid: Column.Int().Key(),
    account: Column.Int().Index(),
    date: Column.DateTime().Index(),
    payee: Column.Text().Index(),
    amount: Column.Real().Index().Default(0),
    bill: Column.Int().Index(),
    status: Column.Enum(TransactionStatus).Default(TransactionStatus.None),
  },
  indices: [
    ["account", "date"]
  ]
};
