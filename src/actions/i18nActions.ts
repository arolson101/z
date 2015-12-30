///<reference path="../project.d.ts"/>
"use strict";

import { Action } from "./action";
import * as i18n from "i18next-client";

const I18N_LOADED = "i18n/loaded";

type tFcn = (key: string, values?: Object) => string;
export const t: tFcn = i18n.t;

export function i18nLoaded(): Action {
	return {
		type: I18N_LOADED
	};
}

export function i18nReducer(state: boolean, action?: Action): boolean {
	state = state || false;
	switch (action.type) {
		case I18N_LOADED:
			return true;
	}
	
	return state;
}
