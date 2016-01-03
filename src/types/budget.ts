///<reference path="../project.d.ts"/>
"use strict";

import { Column, Mutate as M, Query as Q } from "updraft";

export interface _Budget<key, id, str, date, num> {
  dbid?: key;
  account?: id;
  name?: str;
  nextOccurrence?: date;
	rrule?: str;
  amount?: num;
}

export interface Budget extends _Budget<number, number, string, Date, number> {}
export interface BudgetQuery extends _Budget<Q.num, Q.num, Q.str, Q.date, Q.num> {}
export interface BudgetChange extends _Budget<void, M.num, M.str, M.date, M.num> {}
export type BudgetTable = Updraft.Table<Budget, BudgetQuery, BudgetChange>;
export type BudgetTableSpec = Updraft.TableSpec<Budget, BudgetQuery, BudgetChange>;

export const budgetSpec: BudgetTableSpec = {
	name: "budgets",
  columns: {
    dbid: Column.Int().Key(),
    account: Column.Int(),
    name: Column.Text(),
    nextOccurrence: Column.Date(),
    rrule: Column.Text(),
    amount: Column.Real(),
  }
};
