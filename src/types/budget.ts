///<reference path="../project.d.ts"/>
"use strict";

import { Column, Mutate as M, Query as Q } from "updraft";

export interface _Budget<key, id, str, date, num> {
	dbid?: key;
	account?: id;
	name?: str;
	rrule?: str;
	amount?: num;
}

export interface Budget extends _Budget<number, number, string, Date, number> {}
export interface BudgetQuery extends _Budget<Q.num, Q.num, Q.str, Q.date, Q.num> {}
export interface BudgetChange extends _Budget<number, M.num, M.str, M.date, M.num> {}
export type BudgetTable = Updraft.Table<Budget, BudgetChange, BudgetQuery>;
export type BudgetTableSpec = Updraft.TableSpec<Budget, BudgetChange, BudgetQuery>;

export const budgetSpec: BudgetTableSpec = {
	name: "budgets",
	columns: {
		dbid: Column.Int().Key(),
		account: Column.Int(),
		name: Column.Text(),
		rrule: Column.Text(),
		amount: Column.Real(),
	}
};
