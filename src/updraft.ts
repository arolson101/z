///<reference path="./project.d.ts"/>
"use strict";

import * as Updraft from "updraft";

import { Thunk, Dispatch, UpdraftState, updraftOpened, loadInstitutions, loadAccounts } from "./actions";
import { accountSpec, institutionSpec } from "./types";

function init(): Promise<UpdraftState> {
	let db = Updraft.createWebsqlWrapper("z");
	let store = new Updraft.Store({db});
	let state: UpdraftState = {
		store
	};
	
	state.accountTable = store.createTable(accountSpec);
	state.institutionTable = store.createTable(institutionSpec);
	
	return store.open()
	.then(() => {
		return state;
	});
}

function loadData(state: UpdraftState): Thunk {
	return (dispatch: Dispatch) => {
		dispatch(loadInstitutions(state.institutionTable));
		dispatch(loadAccounts(state.accountTable));
	};
}


export function updraftInit(): Thunk {
	return (dispatch: Dispatch) => {
		return init()
		.then(
			(state: UpdraftState) => {
				dispatch(updraftOpened(state));
				dispatch(loadData(state));
			},
			(err: Error) => console.error(err)
		);
	}
}
