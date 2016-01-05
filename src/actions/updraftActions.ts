///<reference path="../project.d.ts"/>
"use strict";

import { Action, Dispatch, Thunk, ThunkPromise } from "./action";
import {
	Account,
	AccountTable,
	accountSpec,
	Institution,
	InstitutionTable,
	institutionSpec,
	Budget,
	BudgetTable,
	budgetSpec
} from "../types";
import { UpdraftCollection, defineUpdraftCollection } from "../util";

export interface UpdraftState {
	store?: Updraft.Store;
	accountTable?: AccountTable;
	institutionTable?: InstitutionTable;
	budgetTable?: BudgetTable;
}

interface UpdraftOpenAction extends Action {
	state: UpdraftState;
}


export { Account };
export type AccountCollection = UpdraftCollection<Account>;

export const {
	load: loadAccounts,
	add: addAccount,
	reducer: accountCollectionReducer
} = defineUpdraftCollection(accountSpec);


export { Budget };
export type BudgetCollection = UpdraftCollection<Budget>;

export const {
	load: loadBudgets,
	add: addBudget,
	reducer: budgetCollectionReducer
} = defineUpdraftCollection(budgetSpec);


export { Institution };
export type InstitutionCollection = UpdraftCollection<Institution>;

export const {
	load: loadInstitutions,
	add: addInstitution,
	reducer: institutionCollectionReducer
} = defineUpdraftCollection(institutionSpec);


const UPDRAFT_OPENED = "updraft/opened";

type loadAction = (table: Updraft.TableAny) => ThunkPromise; 
const tableLoadActionMap = new Map<Updraft.TableSpecAny, loadAction>([
	[accountSpec, loadAccounts],
	[institutionSpec, loadInstitutions],
	[budgetSpec, loadBudgets]
]);

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
	}
	
	return state;
}

function tableForSpec(state: UpdraftState, spec: Updraft.TableSpecAny): Updraft.TableAny {
	return _.find(state as any, (value: any, key: string) => value && ((value as Updraft.TableAny).spec === spec));
}

export function updraftLoadData(state: UpdraftState): Thunk {
	return (dispatch: Dispatch) => {
		tableLoadActionMap.forEach((loadAction, spec) => {
			const table = tableForSpec(state, spec);
			dispatch(loadAction(table));
		});
	};
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