///<reference path="../project.d.ts"/>

import { updatePath } from "redux-simple-router";
import { bindActionCreators } from "redux";
import { ThunkInterface } from "redux-thunk";

export { bindActionCreators, updatePath };

export interface Action {
  type: string;
}

export interface Dispatch extends Redux.Dispatch<Action> {}
export interface Thunk extends ThunkInterface<Action, any> {}
export interface ThunkPromise extends ThunkInterface<Action, Promise<any>> {}

export let nullAction: Action = {
  type: undefined
};
