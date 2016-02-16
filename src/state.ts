///<reference path="./project.d.ts"/>
"use strict";

import { connect } from "react-redux";
import { combineReducers } from "redux";
import * as reduxForm from "redux-form";
import { routeReducer } from "redux-simple-router";

import {
	Action,
	nullAction,
	localeReducer,
	AccountCollection,
	accountCollectionReducer,
	BudgetCollection,
	budgetCollectionReducer,
	InstitutionCollection,
	institutionCollectionReducer,
	FI,
	fiReducer,
	t,
	UpdraftState,
  KnownDb,
	updraftReducer
} from "./actions";

export {
	t,
	FI,
	AccountCollection,
	BudgetCollection,
	InstitutionCollection,
	UpdraftState,
	KnownDb,
	connect
};

export interface AppState {
	locale: string;
	routing: ReactRouter.RouterState;
	accounts: AccountCollection;
	budgets: BudgetCollection;
	institutions: InstitutionCollection;
	filist: FI[];
	form: any;
	updraft: UpdraftState;
}

export const appState = combineReducers<AppState, Action>({
	locale: localeReducer,
	routing: routeReducer,
  accounts: accountCollectionReducer,
	budgets: budgetCollectionReducer,
  institutions: institutionCollectionReducer,
	filist: fiReducer,
	form: reduxForm.reducer,
	updraft: updraftReducer
});
