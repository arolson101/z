///<reference path="./project.d.ts"/>
"use strict";

import { mutate } from "updraft";
import { combineReducers } from "redux";
import { routerStateReducer } from "redux-router";

import { ActionType, Action, nullAction } from "./actions/index";
import { Account, AccountChange, AccountCollection,
				 Institution, InstitutionChange, InstitutionCollection
				} from "./types/index";
import { Collection, manageCollection } from "./util/index";



export interface AppState {
	router: ReactRouter.RouterState;
	accounts: AccountCollection;
	institutions: InstitutionCollection;
}

export const appState = combineReducers<AppState, Action>({
	router: routerStateReducer,
  accounts: manageCollection<Account, AccountChange>(
		ActionType.ADD_ACCOUNT,
		ActionType.EDIT_ACCOUNT,
		ActionType.DELETE_ACCOUNT
	),
  institutions: manageCollection<Institution, InstitutionChange>(
		ActionType.ADD_INSTITUTION,
		ActionType.EDIT_INSTITUTION,
		ActionType.DELETE_INSTITUTION
	), 
});
