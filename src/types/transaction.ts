///<reference path="../project.d.ts"/>

import { Column, Mutate as M, Query as Q } from "updraft";

export interface _Transaction<key, id, str, date, num> {
  dbid?: key;
  account?: id;
  date?: date;
  payee?: str;
  amount?: num;
}

export interface Transaction extends _Transaction<number, number, string, Date, number> {
  [key: string]: any;
}
export interface TransactionQuery extends _Transaction<Q.num, Q.num, Q.str, Q.date, Q.num> {}
export interface TransactionChange extends _Transaction<number, M.num, M.str, M.date, M.num> {}
export type TransactionTable = Updraft.Table<Transaction, TransactionChange, TransactionQuery>;
export type TransactionTableSpec = Updraft.TableSpec<Transaction, TransactionChange, TransactionQuery>;

export const transactionSpec: TransactionTableSpec = {
  name: "transactions",
  columns: {
    dbid: Column.Int().Key(),
    account: Column.Int().Index(),
    date: Column.DateTime().Index(),
    payee: Column.Text().Index(),
    amount: Column.Real().Default(0),
  },
  indices: [
    ["account", "date"]
  ]
};
