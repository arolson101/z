///<reference path="../project.d.ts"/>
"use strict";

import { Action, ActionType } from "./action";
import { Account, AccountChange } from "../types/index";

export interface AddAccountAction extends Action {
	account: Account;
}

export function addAccount(account: Account): AddAccountAction {
	return {
		type: ActionType.ADD_ACCOUNT,
		account
	};
}


export interface EditAccountAction extends Action {
	dbid: number;
	change: AccountChange;
}

export function editAccount(dbid: number, change: AccountChange): EditAccountAction {
	return {
		type: ActionType.EDIT_ACCOUNT,
		dbid,
		change
	}
}


export interface DeleteAccountAction extends Action {
	dbid: number;
}

export function deleteAccount(dbid: number): DeleteAccountAction {
	return {
		type: ActionType.DELETE_ACCOUNT,
		dbid
	}
}
