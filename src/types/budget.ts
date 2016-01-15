///<reference path="../project.d.ts"/>
"use strict";

import { Column, Mutate as M, Query as Q } from "updraft";

import RRuleOptions = __RRule.Options;

export interface _Budget<key, id, str, date, num, rruleOpts> {
	dbid?: key;
	account?: id;
	name?: str;
	rruleOpts?: rruleOpts;
	amount?: num;
}

export interface Budget extends _Budget<number, number, string, Date, number, RRuleOptions> {}
export interface BudgetQuery extends _Budget<Q.num, Q.num, Q.str, Q.date, Q.num, Q.none> {}
export interface BudgetChange extends _Budget<number, M.num, M.str, M.date, M.num, M.primitive<RRuleOptions>> {}
export type BudgetTable = Updraft.Table<Budget, BudgetChange, BudgetQuery>;
export type BudgetTableSpec = Updraft.TableSpec<Budget, BudgetChange, BudgetQuery>;

export const budgetSpec: BudgetTableSpec = {
	name: "budgets",
	columns: {
		dbid: Column.Int().Key(),
		account: Column.Int(),
		name: Column.Text(),
		rruleOpts: Column.JSON(),
		amount: Column.Real().Default(0),
	}
};
