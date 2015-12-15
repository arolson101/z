///<reference path="../project.d.ts"/>
"use strict";

import { Action, nullAction, AddAction, EditAction, DeleteAction } from "../actions/index";
import { mutate, verify } from "updraft";


export interface Collection<Element> extends Object {
	[dbid: number]: Element;
}

export interface CollectionFunction<Element> extends Redux.Reducer<Collection<Element>, Action> {
	(state?: Collection<Element>, action?: Action): Collection<Element>;
}

export function manageCollection<Element, ElementMutator>(add: string, edit: string, del: string): CollectionFunction<Element> {
	return (state?: Collection<Element>, action?: Action): Collection<Element> => {
		state = state || {};
		action = action || nullAction;

		switch (action.type) {
		case add: {
				let addAction = action as AddAction<Element, ElementMutator>;
				let id = addAction.id;
				verify(id, "id must be specified");
				return mutate(state, {
					[id]: { $set: addAction.element }
				});
			}
			
		case edit: {
				let editAction = action as EditAction<Element, ElementMutator>;
				let id = editAction.id;
				verify(id, "id must be specified");
				return mutate(state, {
					[id]: editAction.edit
				});
			}

		case del: {
				let delAction = action as DeleteAction<Element, ElementMutator>;
				let id = delAction.id;
				verify(id, "id must be specified");
				return mutate(state, {
					$delete: [id]
				});
			}
		}

		return state;
	};
}
