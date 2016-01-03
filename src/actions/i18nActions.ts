///<reference path="../project.d.ts"/>
"use strict";

import { Action } from "./action";
import * as i18n from "i18next-client";

const SET_LOCALE = "i18n/setLocale";

type tFcn = (key: string, values?: Object) => string;
export const t: tFcn = i18n.t;

interface SetLocaleAction extends Action {
	locale: string;
}

export function setLocale(locale: string): SetLocaleAction {
	return {
		type: SET_LOCALE,
		locale
	};
}

export function localeReducer(state: string, action?: Action): string {
	state = state || null;
	switch (action.type) {
		case SET_LOCALE:
			return (action as SetLocaleAction).locale;
	}
	
	return state;
}
