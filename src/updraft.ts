///<reference path="./project.d.ts"/>
"use strict";

import * as Updraft from "updraft";

import { Thunk, ThunkPromise, Dispatch, UpdraftState, updraftOpened, updraftLoadData } from "./actions";
import { accountSpec, institutionSpec, budgetSpec } from "./types";

// function init(): Promise<UpdraftState> {
// 	let db = Updraft.createWebsqlWrapper("z");
// 	let store = new Updraft.Store({db});
// 	let state: UpdraftState = {
// 		store
// 	};
	
// 	state.accountTable = store.createTable(accountSpec);
// 	state.institutionTable = store.createTable(institutionSpec);
// 	state.budgetTable = store.createTable(budgetSpec);
	
// 	return store.open()
// 	.then(() => {
// 		return state;
// 	});
// }


export function updraftInit(): Thunk {
	return (dispatch: Dispatch) => {
		// return init()
		// .then(
		// 	(state: UpdraftState) => {
		// 		dispatch(updraftOpened(state));
		// 		dispatch(updraftLoadData(state));
		// 	},
		// 	(err: Error) => console.error(err)
		// );
	}
}
