///<reference path="./project.d.ts"/>
"use strict";

import * as i18n from "i18next-client";

import { Thunk, Dispatch, UpdraftState, updraftOpened } from "./actions";
import { accountSpec, institutionSpec } from "./types";
import * as Updraft from "updraft";

function init(): Promise<UpdraftState> {
	let db = Updraft.createWebsqlWrapper("z");
	let store = new Updraft.Store({db});
	let state: UpdraftState = {
		store
	};
	
	state.accounts = store.createTable(accountSpec);
	state.institutions = store.createTable(institutionSpec);
	
	return store.open()
	.then(() => {
		return state;
	});
}


export function updraftInit(): Thunk {
	return (dispatch: Dispatch) => {
		return init().then(
			(state: UpdraftState) => dispatch(updraftOpened(state)),
			(err: Error) => console.error(err)
		);
	}
}
