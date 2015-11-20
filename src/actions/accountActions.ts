///<reference path="../project.d.ts"/>
"use strict";

import { Action, ActionType, AddAction, EditAction, DeleteAction } from "./action";
import { Account, AccountChange } from "../types/index";

export interface AddAccountAction extends AddAction<Account, AccountChange> {}
export interface EditAccountAction extends EditAction<Account, AccountChange> {}
export interface DeleteAccountAction extends DeleteAction<Account, AccountChange> {}

export function addAccount(account: Account): AddAccountAction {
	return {
		type: ActionType.ADD_ACCOUNT,
		id: account.dbid,
		element: account
	};
}

export function editAccount(dbid: number, change: AccountChange): EditAccountAction {
	return {
		type: ActionType.EDIT_ACCOUNT,
		id: dbid,
		edit: change
	}
}

export function deleteAccount(dbid: number): DeleteAccountAction {
	return {
		type: ActionType.DELETE_ACCOUNT,
		id: dbid
	}
}
