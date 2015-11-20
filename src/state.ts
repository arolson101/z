///<reference path="./project.d.ts"/>
"use strict";

import { mutate } from "updraft";
import { combineReducers } from "redux";
import { ActionType, Action, nullAction } from "./actions/index";
import { Account, AccountChange,
				 Institution, InstitutionChange
				} from "./types/index";
import { SubState, manageSubState } from "./util/subState";



export interface AppState {
	accounts: SubState<Account>;
	institutions: SubState<Institution>;
}

export const appState = combineReducers<AppState, Action>({
  accounts: manageSubState<Account, AccountChange>(
		ActionType.ADD_ACCOUNT,
		ActionType.EDIT_ACCOUNT,
		ActionType.DELETE_ACCOUNT
	),
  institutions: manageSubState<Institution, InstitutionChange>(
		ActionType.ADD_INSTITUTION,
		ActionType.EDIT_INSTITUTION,
		ActionType.DELETE_INSTITUTION
	), 
});
