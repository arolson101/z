///<reference path="../project.d.ts"/>
"use strict";

import { Action, Dispatch, Thunk } from "./action";
import { Account, accountSpec, AccountTable, Institution, InstitutionTable } from "../types";

const UPDRAFT_OPENED = "updraft/opened";
const UPDRAFT_LOADED_ACCOUNTS = "updraft/loadedAccounts";
const UPDRAFT_LOADED_INSTITUTIONS = "updraft/loadedInstitutions";

export interface UpdraftState {
	store?: Updraft.Store;
	accountTable?: AccountTable;
	institutionTable?: InstitutionTable;
}

interface UpdraftOpenAction extends Action {
	state: UpdraftState;
}

export function updraftOpened(state: UpdraftState): UpdraftOpenAction {
	return {
		type: UPDRAFT_OPENED,
		state
	};
}

export function updraftReducer(state: UpdraftState, action?: Action): UpdraftState {
	state = state || null;
	switch (action.type) {
		case UPDRAFT_OPENED:
			return (action as UpdraftOpenAction).state;
			
		case UPDRAFT_LOADED_ACCOUNTS:
			return Updraft.mutate(state, <UpdraftState>{  })
	}
	
	return state;
}
