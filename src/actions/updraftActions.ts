///<reference path="../project.d.ts"/>
"use strict";

import { Action } from "./action";
import { AccountTable, InstitutionTable } from "../types";

const UPDRAFT_OPENED = "updraft/loaded";

export interface UpdraftState {
	store: Updraft.Store;
	accounts?: AccountTable;
	institutions?: InstitutionTable;
}

interface UpdraftAction extends Action {
	state: UpdraftState;
}

export function updraftOpened(state: UpdraftState): UpdraftAction {
	return {
		type: UPDRAFT_OPENED,
		state
	};
}

export function updraftReducer(state: UpdraftState, action?: Action): UpdraftState {
	state = state || null;
	switch (action.type) {
		case UPDRAFT_OPENED:
			return (action as UpdraftAction).state;
	}
	
	return state;
}
