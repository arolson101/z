///<reference path="../project.d.ts"/>
"use strict";

export enum ActionType {
	// institutionActions.ts
	ADD_INSTITUTION,
	EDIT_INSTITUTION,
	DELETE_INSTITUTION,
	
	// accountActions.ts
	ADD_ACCOUNT,
	EDIT_ACCOUNT,
	DELETE_ACCOUNT,
}

export interface Action {
	type: ActionType;
}

export let nullAction: Action = {
	type: undefined
};

export interface AddAction<Element, Mutator> extends Action {
	id: number;
	element: Element;
}

export interface EditAction<Element, Mutator> extends Action {
	id: number;
	edit: Mutator;
}

export interface DeleteAction<Element, Mutator> extends Action {
	id: number;
}
