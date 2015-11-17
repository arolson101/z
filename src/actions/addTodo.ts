///<reference path="../../typings/tsd.d.ts"/>
"use strict";

import { Action, ActionType } from "./action";

export interface AddTodo extends Action {
	text: string;
}

export function addTodo(todo: string): AddTodo {
	return {
		type: ActionType.ADD_TODO,
		text: todo
	};
}
