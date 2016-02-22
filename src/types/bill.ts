///<reference path="../project.d.ts"/>

import { Column, Mutate as M, Query as Q } from "updraft";


export interface _Bill<key, id, str, date, num> {
  dbid?: key;
  account?: id;
  name?: str;
  rruleString?: str;
  amount?: num;
}

export interface Bill extends _Bill<number, number, string, Date, number> {}
export interface BillQuery extends _Bill<Q.num, Q.num, Q.str, Q.date, Q.num> {}
export interface BillChange extends _Bill<number, M.num, M.str, M.date, M.num> {}
export type BillTable = Updraft.Table<Bill, BillChange, BillQuery>;
export type BillTableSpec = Updraft.TableSpec<Bill, BillChange, BillQuery>;

export const billSpec: BillTableSpec = {
  name: "bills",
  columns: {
    dbid: Column.Int().Key(),
    account: Column.Int(),
    name: Column.Text(),
    rruleString: Column.String(),
    amount: Column.Real().Default(0),
  }
};
