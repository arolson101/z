///<reference path="./project.d.ts"/>
"use strict";

import { combineReducers } from "redux";
import { routeReducer } from "redux-simple-router";
import { reducer as formReducer } from "redux-form";
export { reduxForm } from "redux-form";

import { Action, nullAction } from "./actions";
import { AccountCollection,
				 accountCollectionReducer,
				 InstitutionCollection,
				 institutionCollectionReducer,
				} from "./actions";


export interface AppState {
	routing: ReactRouter.RouterState;
	accounts: AccountCollection;
	institutions: InstitutionCollection;
	form: any;
}

export const appState = combineReducers<AppState, Action>({
	routing: routeReducer,
  accounts: accountCollectionReducer,
  institutions: institutionCollectionReducer,
	form: formReducer, 
});
