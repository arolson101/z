///<reference path="../project.d.ts"/>

import { Column, Mutate as M, Query as Q } from "updraft";
import { t } from "../i18n";

// see ofx4js.domain.data.banking.AccountType
export enum AccountType {
  CHECKING,
  SAVINGS,
  MONEYMRKT,
  CREDITLINE,
  CREDITCARD,
}

export module AccountType {
  export function parse(idx: string): AccountType { return (AccountType as any)[idx]; }
  export function tr(name: string): string { return t("AccountTypes." + name); }
}

export interface _Account<key, id, str, tAccountType, bool, num> {
  dbid?: key;
  institution?: id;
  name?: str;
  type?: tAccountType;
  number?: str;
  visible?: bool;
  balance?: num;
}

export interface Account extends _Account<number, number, string, AccountType, boolean, number> {
  [key: string]: any;
}
export interface AccountQuery extends _Account<Q.num, Q.num, Q.str, Q.enm<AccountType>, Q.bool, Q.num> {}
export interface AccountChange extends _Account<number, M.num, M.str, M.enm<AccountType>, M.bool, M.num> {}
export type AccountTable = Updraft.Table<Account, AccountChange, AccountQuery>;
export type AccountTableSpec = Updraft.TableSpec<Account, AccountChange, AccountQuery>;

export const accountSpec: AccountTableSpec = {
  name: "accounts",
  columns: {
    dbid: Column.Int().Key(),
    institution: Column.Int(),
    name: Column.Text(),
    type: Column.Enum(AccountType),
    number: Column.Text(),
    visible: Column.Bool(),
    balance: Column.Real().Default(0),
  }
};

export const defaultAccount: Account = {
  type: AccountType.CHECKING,
  visible: true
};
