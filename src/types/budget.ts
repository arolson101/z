///<reference path="../project.d.ts"/>
"use strict";

import { Column, Mutate as M, Query as Q } from "updraft";
import RRule = require("rrule");
import { t } from "i18next-client";

export { RRule };

export interface _Budget<key, id, str, date, num> {
	dbid?: key;
	account?: id;
	name?: str;
	rruleString?: str;
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
		rruleString: Column.String(),
		amount: Column.Real().Default(0),
	}
};


export enum Frequency {
	YEAR,
	MONTH,
	WEEK,
	DAY,
}

export module Frequency {
	export function parse(idx: string): Frequency { return (Frequency as any)[idx]; }
	export function tr(name: string): string { return t("Frequency." + name); }
	export function toRRuleFreq(value: Frequency): __RRule.Frequency {
		switch (value) {
			case Frequency.YEAR: return RRule.YEARLY;
			case Frequency.MONTH: return RRule.MONTHLY;
			case Frequency.WEEK: return RRule.WEEKLY;
			case Frequency.DAY: return RRule.DAILY;
			default:
				throw new Error("invalid Frequency value");
		}
	}
}
