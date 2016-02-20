///<reference path="../project.d.ts"/>

import { Action } from "./action";

const SET_LOCALE = "i18n/setLocale";

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
    default:
      return state;
  }
}
