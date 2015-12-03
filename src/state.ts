///<reference path="./project.d.ts"/>
"use strict";

import { combineReducers } from "redux";
import { routerStateReducer } from "redux-router";

import { Action } from "./actions";
import { AccountCollection,
				 accountCollectionReducer,
				 InstitutionCollection,
				 institutionCollectionReducer,
				} from "./actions";


export interface AppState {
	router: ReactRouter.RouterState;
	accounts: AccountCollection;
	institutions: InstitutionCollection;
}

export const appState = combineReducers<AppState, Action>({
	router: routerStateReducer,
  accounts: accountCollectionReducer,
  institutions: institutionCollectionReducer, 
});
