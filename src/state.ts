///<reference path="./project.d.ts"/>
"use strict";

import { combineReducers } from "redux";
import { routeReducer } from "redux-simple-router";
import { reducer as formReducer } from "redux-form";

import { Action,
				 nullAction,
				 i18nFunction,
				 i18nReducer,
				 AccountCollection,
				 accountCollectionReducer,
				 InstitutionCollection,
				 institutionCollectionReducer,
				} from "./actions";

export { i18nFunction };

export interface AppState {
	t: i18nFunction;
	routing: ReactRouter.RouterState;
	accounts: AccountCollection;
	institutions: InstitutionCollection;
	form: any;
}

export const appState = combineReducers<AppState, Action>({
	t: i18nReducer,
	routing: routeReducer,
  accounts: accountCollectionReducer,
  institutions: institutionCollectionReducer,
	form: formReducer, 
});
