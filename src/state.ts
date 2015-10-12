///<reference path="../typings/tsd.d.ts"/>
import { Action, ActionType, AddTodo } from "./actions/index";


export enum Visibility {
	SHOW_ALL,
	SHOW_COMPLETED,
	SHOW_ACTIVE
}

export interface Todo {
	text: string;
	completed: boolean;
}

export interface AppState {
	visibilityFilter?: Visibility;
	todos: Todo[];
}

export const initialState: AppState = {
	visibilityFilter: Visibility.SHOW_ALL,
	todos: []
}


function todos(state: Todo[], action: Action) {
	switch(action.type) {
		case ActionType.ADD_TODO:
			return [...state, {
				text: (<AddTodo>action).text,
				completed: false
			}];
		default:
			return state;
	}
}

export function todoApp(state: AppState = initialState, action: Action = {type: ActionType.NONE}): AppState {
	return {
		visibilityFilter: state.visibilityFilter,
		todos: todos(state.todos, action)
	}
}
