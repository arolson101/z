///<reference path="../project.d.ts"/>
"use strict";

export interface Action {
	type: string;
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
