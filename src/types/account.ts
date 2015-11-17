///<reference path="../project.d.ts"/>
"use strict";

import { Column, Mutate as M, Query as Q } from "updraft";
//import M = Updraft.Mutate;
// import Q = Updraft.Query;
// import Column = Updraft.Column;

export enum AccountType {
  CHECKING,
  SAVINGS,
  MONEYMRKT,
  CREDITLINE,
  CREDITCARD,
}


interface _Account<key, id, str, tAccountType, bool> {
  dbid?: key;
  institution?: id;
  name?: str;
  type?: tAccountType;
  number?: str;
  visible?: bool;
}

export interface Account extends _Account<number, number, string, AccountType, boolean> {}
export interface AccountQuery extends _Account<Q.num, Q.num, Q.str, Q.enm<AccountType>, Q.bool> {}
export interface AccountChange extends _Account<void, M.num, M.str, M.enm<AccountType>, M.bool> {}
export type AccountTable = Updraft.Table<Account, AccountQuery, AccountChange>;
export type AccountTableSpec = Updraft.TableSpec<Account, AccountQuery, AccountChange>;

export const accountSpec: AccountTableSpec = {
	name: "accounts",
  columns: {
    dbid: Column.Int().Key(),
    institution: Column.Int(),
    name: Column.Text(),
    type: Column.Enum(AccountType),
    number: Column.Text(),
    visible: Column.Bool(),
  }
};

export interface AccountSet {
  [dbid: number]: Account;
}
