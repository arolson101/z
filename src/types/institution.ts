///<reference path="../project.d.ts"/>

import { Column, Delta as D, Query as Q } from "updraft";

interface _Institution<id, str, bool> {
  dbid?: id;
  name?: str;
  web?: str;
  address?: str;
  notes?: str;

  online?: bool;

  fid?: str;
  org?: str;
  ofx?: str;

  username?: str;
  password?: str;
}

export interface Institution extends _Institution<number, string, boolean> {}
export interface InstitutionQuery extends _Institution<Q.num, Q.str, Q.bool> {}
export interface InstitutionDelta extends _Institution<number, D.str, D.bool> {}
export type InstitutionTable = Updraft.Table<Institution, InstitutionDelta, InstitutionQuery>;
export type InstitutionTableSpec = Updraft.TableSpec<Institution, InstitutionDelta, InstitutionQuery>;

export const institutionSpec: InstitutionTableSpec = {
  name: "institutions",
  columns: {
    dbid: Column.Int().Key(),
    name: Column.Text(),
    web: Column.Text(),
    address: Column.Text(),
    notes: Column.Text(),

    online: Column.Bool(),

    fid: Column.Text(),
    org: Column.Text(),
    ofx: Column.Text(),

    username: Column.Text(),
    password: Column.Text(),
  }
};
