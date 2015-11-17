///<reference path="../project.d.ts"/>
"use strict";

import { AccountSet } from "../types/index";
import { Action, ActionType, nullAction, AddAccountAction, EditAccountAction, DeleteAccountAction } from "../actions/index";
import { mutate } from "updraft";

export interface AccountState {
	accounts: AccountSet;
}


let defaultAccountState: AccountState = {
	accounts: {}
};


export function accountState(state: AccountState = defaultAccountState, action: Action = nullAction): AccountState {
	switch (action.type) {
	case ActionType.ADD_ACCOUNT:
		let addAccountAction = <AddAccountAction>action; 
		return mutate(state, { accounts: { $merge: { [addAccountAction.account.dbid]: addAccountAction.account } } });

	case ActionType.EDIT_ACCOUNT:
		let editAccountAction = <EditAccountAction>action;
		return mutate(state, { accounts: { [editAccountAction.dbid]: editAccountAction.change } });
		
	case ActionType.DELETE_ACCOUNT:
		let deleteAccountAction = <DeleteAccountAction>action;
		return mutate(state, { accounts: { $delete: [deleteAccountAction.dbid] } });
	}

	return state;
}
