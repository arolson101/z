///<reference path="./project.d.ts"/>
"use strict";

import { combineReducers } from "redux";
import { routeReducer } from "redux-simple-router";

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
}

export const appState = combineReducers<AppState, Action>({
	routing: routeReducer,
  accounts: accountCollectionReducer,
  institutions: institutionCollectionReducer, 
});
