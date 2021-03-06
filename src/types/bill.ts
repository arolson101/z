///<reference path="../project.d.ts"/>

import { Column, Delta as D, Query as Q } from "updraft";
import { RRule } from "rrule";
import { rruleFixText } from "../util";


export interface _Bill<key, id, str, date, num> {
  dbid?: key;
  account?: id;
  name?: str;
  rruleString?: str;
  amount?: num;
  notes?: str;
}

export interface Bill extends _Bill<number, number, string, Date, number> {}
export interface BillQuery extends _Bill<Q.num, Q.num, Q.str, Q.date, Q.num> {}
export interface BillDelta extends _Bill<number, D.num, D.str, D.date, D.num> {}
export type BillTable = Updraft.Table<Bill, BillDelta, BillQuery>;
export type BillTableSpec = Updraft.TableSpec<Bill, BillDelta, BillQuery>;

export const billSpec: BillTableSpec = {
  name: "bills",
  columns: {
    dbid: Column.Int().Key(),
    account: Column.Int(),
    name: Column.Text(),
    rruleString: Column.String(),
    amount: Column.Real().Default(0),
    notes: Column.Text()
  }
};

export interface NextBill {
  bill: Bill;
  rruleFixedText: string;
  rrule: __RRule.RRule;
  next: Date;
  last: Date;
}

export function makeNextBill(bill: Bill, now: Date) {
  let rrule = RRule.fromString(bill.rruleString);
  return ({
    bill,
    rrule,
    next: rrule.after(now, true),
    last: rrule.before(now, false),
    rruleFixedText: rruleFixText(rrule)
  });
}
