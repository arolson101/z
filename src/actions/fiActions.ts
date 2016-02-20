///<reference path="../project.d.ts"/>

import { Action } from "./action";
import { verify } from "updraft";

const FI_LOADED = "fi/loaded";

export interface FI extends FinancialInstitution {
  id: number;
}

export interface FIAction extends Action {
  filist: FI[];
}

export function fiLoaded(filist: FI[]): FIAction {
  verify(filist, "invalid filist");
  return {
    type: FI_LOADED,
    filist: filist
  };
}

export function fiReducer(state: FI[] = null, action: Action): FI[] {
  switch (action.type) {
    case FI_LOADED:
      return (action as FIAction).filist;
    default:
      return state;
  }
}
