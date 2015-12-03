///<reference path="../project.d.ts"/>
"use strict";

import { Action, AddAction, EditAction, DeleteAction } from "./action";
import { Account, AccountChange } from "../types";
import { Collection, manageCollection } from "../util";

const ADD_ACCOUNT = "account/add";
const EDIT_ACCOUNT = "account/edit";
const DELETE_ACCOUNT = "account/delete";

export { Account };
export type AccountCollection = Collection<Account>;

export interface AddAccountAction extends AddAction<Account, AccountChange> {}
export interface EditAccountAction extends EditAction<Account, AccountChange> {}
export interface DeleteAccountAction extends DeleteAction<Account, AccountChange> {}

export function addAccount(account: Account): AddAccountAction {
	return {
		type: ADD_ACCOUNT,
		id: account.dbid,
		element: account
	};
}

export function editAccount(dbid: number, change: AccountChange): EditAccountAction {
	return {
		type: EDIT_ACCOUNT,
		id: dbid,
		edit: change
	}
}

export function deleteAccount(dbid: number): DeleteAccountAction {
	return {
		type: DELETE_ACCOUNT,
		id: dbid
	}
}


export const accountCollectionReducer = manageCollection<Account, AccountChange>(
	ADD_ACCOUNT,
	EDIT_ACCOUNT,
	DELETE_ACCOUNT
);
