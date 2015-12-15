///<reference path="../project.d.ts"/>
"use strict";

import { updatePath } from "redux-simple-router";
import { bindActionCreators } from "redux";
import { ThunkInterface as ThunkInterface } from "redux-thunk";
export { bindActionCreators, updatePath };

export interface Action {
	type: string;
}

export interface Dispatch extends Redux.Dispatch<Action> {}
export interface Thunk extends ThunkInterface<Action> {}

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
