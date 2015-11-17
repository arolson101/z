///<reference path="../project.d.ts"/>
"use strict";

export enum ActionType {
	NONE,
	ADD_TODO,

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
	type: ActionType.NONE
};
