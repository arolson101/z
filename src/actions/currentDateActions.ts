///<reference path="../project.d.ts"/>

import { Action } from "./action";


export function today(): Date {
  let date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}


export function todayReducer(state: Date = null, action?: Action) {
  let date = today();
  if (!state || state.getTime() != date.getTime()) {
    return date;
  }
  else {
    return state;
  }
}
