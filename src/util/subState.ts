///<reference path="../project.d.ts"/>
"use strict";

import { Action, ActionType, nullAction, AddAction, EditAction, DeleteAction } from "../actions/index";
import { mutate } from "updraft";


export interface SubState<Element> {
	[dbid: number]: Element;
}

export interface Reducer<T> extends Redux.Reducer {
	(state?: T, action?: Action): T;
}

export interface SubStateFunction<Element> extends Reducer<SubState<Element>> {
	(state?: SubState<Element>, action?: Action): SubState<Element>;
}

export function manageSubState<Element, ElementMutator>(add: ActionType, edit: ActionType, del: ActionType): SubStateFunction<Element> {
	return (state?: SubState<Element>, action?: Action): SubState<Element> => {
		state = state || {};
		action = action || nullAction;

		switch (action.type) {
		case add: {
				let addAction = <AddAction<Element, ElementMutator>>action;
				let id = addAction.id;
				return mutate(state, {
					$merge: {
						[id]: addAction.element
					}
				});
			}
			
		case edit: {
				let editAction = <EditAction<Element, ElementMutator>>action;
				let id = editAction.id;
				return mutate(state, {
					[id]: editAction.edit
				});
			}

		case del: {
				let delAction = <DeleteAction<Element, ElementMutator>>action;
				let id = delAction.id;
				return mutate(state, {
					$delete: [id]
				});
			}
		}

		return state;
	};
}
