///<reference path="./project.d.ts"/>
"use strict";

import { combineReducers } from "redux";
import { routeReducer } from "redux-simple-router";
import * as reduxForm from "redux-form";

import { Action,
				 nullAction,
				 i18nFunction,
				 i18nReducer,
				 AccountCollection,
				 accountCollectionReducer,
				 InstitutionCollection,
				 institutionCollectionReducer,
				 FI,
				 fiReducer,
				 UpdraftState,
				 updraftReducer
				} from "./actions";

export {
	i18nFunction,
	FI,
	AccountCollection,
	InstitutionCollection,
	UpdraftState
};

export interface AppState {
	t: i18nFunction;
	routing: ReactRouter.RouterState;
	accounts: AccountCollection;
	institutions: InstitutionCollection;
	filist: FI[];
	form: any;
	updraft: UpdraftState;
}

export const appState = combineReducers<AppState, Action>({
	t: i18nReducer,
	routing: routeReducer,
  accounts: accountCollectionReducer,
  institutions: institutionCollectionReducer,
	filist: fiReducer,
	form: reduxForm.reducer,
	updraft: updraftReducer
});
