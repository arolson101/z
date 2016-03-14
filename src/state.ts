///<reference path="./project.d.ts"/>

import { connect } from "react-redux";
import { combineReducers } from "redux";
import { routeReducer } from "redux-simple-router";

import {
  Action,
  Config,
  configReducer,
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
  KnownDb,
  updraftReducer
} from "./actions";
import { t } from "./i18n";

export {
  FI,
  t,
  AccountCollection,
  BillCollection,
  Config,
  InstitutionCollection,
  UpdraftState,
  KnownDb,
  connect
};

export interface AppState {
  locale: string;
  config: Config;
  routing: ReactRouter.RouterState;
  accounts: AccountCollection;
  bills: BillCollection;
  institutions: InstitutionCollection;
  filist: FI[];
  form: any;
  updraft: UpdraftState;
}

export const appState = combineReducers<AppState, Action>({
  locale: localeReducer,
  config: configReducer,
  routing: routeReducer,
  accounts: accountCollectionReducer,
  bills: billCollectionReducer,
  institutions: institutionCollectionReducer,
  filist: fiReducer,
  updraft: updraftReducer
});
