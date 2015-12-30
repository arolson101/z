///<reference path="./project.d.ts"/>
"use strict";

import * as Updraft from "updraft";

import { Thunk, ThunkPromise, Dispatch, UpdraftState, updraftOpened, loadInstitutions, loadAccounts } from "./actions";
import { accountSpec, institutionSpec } from "./types";

type loadAction = (table: Updraft.TableAny) => ThunkPromise; 
const tableLoadActionMap = new Map<Updraft.TableSpecAny, loadAction>([
	[accountSpec, loadAccounts],
	[institutionSpec, loadInstitutions]
]);

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

function tableForSpec(state: UpdraftState, spec: Updraft.TableSpecAny): Updraft.TableAny {
	return _.find(state as any, (value: any, key: string) => value && ((value as Updraft.TableAny).spec === spec));
}

function loadData(state: UpdraftState): Thunk {
	return (dispatch: Dispatch) => {
		tableLoadActionMap.forEach((loadAction, spec) => {
			const table = tableForSpec(state, spec);
			dispatch(loadAction(table));
		});
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


export function updraftAdd(state: UpdraftState, ...changes: Updraft.TableChange<any, any>[]): ThunkPromise {
	return (dispatch: Dispatch) => {
		return state.store.add(...changes)
		.then(() => {
			let tables = _.pluck(changes, "table") as Updraft.TableAny[];
			tables = _.unique(tables);
			let promises = tables.map((table) => {
				const loadAction = tableLoadActionMap.get(table.spec);
				return dispatch(loadAction(table)) as Promise<any>;
			});
			return Promise.all(promises);
		});
	};
};