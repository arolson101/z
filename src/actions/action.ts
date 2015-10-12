///<reference path="../../typings/tsd.d.ts"/>

export enum ActionType {
	NONE,
	ADD_TODO,
}

export interface Action {
	type: ActionType;
}
