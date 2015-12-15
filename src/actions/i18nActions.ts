///<reference path="../project.d.ts"/>
"use strict";

import { Action } from "./action";
import * as i18n from "i18next-client";

const I18N_LOADED = "i18n/loaded";

export type i18nFunction = (key: string, options?: any) => string;

interface I18nAction extends Action {
	t: i18nFunction;
}

export function i18nLoaded(t: i18nFunction): I18nAction {
	return {
		type: I18N_LOADED,
		t: t
	};
}

export function i18nReducer(state: i18nFunction, action?: Action): i18nFunction {
	state = state || null;
	switch (action.type) {
		case I18N_LOADED:
			return (action as I18nAction).t;
	}
	
	return state;
}
