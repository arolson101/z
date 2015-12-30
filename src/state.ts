///<reference path="./project.d.ts"/>
"use strict";

import { combineReducers } from "redux";
import { routeReducer } from "redux-simple-router";
import * as reduxForm from "redux-form";

import {
	Action,
	nullAction,
	i18nReducer,
	AccountCollection,
	accountCollectionReducer,
	InstitutionCollection,
	institutionCollectionReducer,
	FI,
	fiReducer,
	t,
	UpdraftState,
	updraftReducer
} from "./actions";

export {
	t,
	FI,
	AccountCollection,
	InstitutionCollection,
	UpdraftState
};

export interface AppState {
	i18nLoaded: boolean;
	routing: ReactRouter.RouterState;
	accounts: AccountCollection;
	institutions: InstitutionCollection;
	filist: FI[];
	form: any;
	updraft: UpdraftState;
}

export const appState = combineReducers<AppState, Action>({
	i18nLoaded: i18nReducer,
	routing: routeReducer,
  accounts: accountCollectionReducer,
  institutions: institutionCollectionReducer,
	filist: fiReducer,
	form: reduxForm.reducer,
	updraft: updraftReducer
});
