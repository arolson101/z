///<reference path="./project.d.ts"/>

import { connect } from "react-redux";
import { combineReducers } from "redux";
import { routeReducer } from "redux-simple-router";

import {
  Action,
  localeReducer,
  AccountCollection,
  accountCollectionReducer,
  BillCollection,
  billCollectionReducer,
  InstitutionCollection,
  institutionCollectionReducer,
  FI,
  fiReducer,
  UpdraftState,
  updraftReducer,
  storesReducer,
  todayReducer
} from "./actions";
import { t } from "./i18n";
import { StoreInfo } from "./system";

export {
  FI,
  t,
  AccountCollection,
  BillCollection,
  InstitutionCollection,
  UpdraftState,
  StoreInfo,
  connect
};

export interface AppState {
  locale: string;
  routing: ReactRouter.RouterState;
  accounts: AccountCollection;
  bills: BillCollection;
  institutions: InstitutionCollection;
  filist: FI[];
  form: any;
  updraft: UpdraftState;
  stores: StoreInfo[];
  today: Date;
}

export const appState = combineReducers<AppState, Action>({
  locale: localeReducer,
  routing: routeReducer,
  accounts: accountCollectionReducer,
  bills: billCollectionReducer,
  institutions: institutionCollectionReducer,
  filist: fiReducer,
  updraft: updraftReducer,
  stores: storesReducer,
  today: todayReducer,
});
