///<reference path="../project.d.ts"/>

import { Dispatch, Thunk, Action } from "./action";
import { sys, StoreInfo } from "../system";

const STORES_SET = "stores/set";


interface SetStoresAction extends Action {
  stores: StoreInfo[];
}


export function setStores(stores: StoreInfo[]): SetStoresAction {
  return ({
    type: STORES_SET,
    stores
  });
}


export function storesReducer(state: StoreInfo[] = [], action: Action) {
  switch (action.type) {
    case STORES_SET:
      return (action as SetStoresAction).stores;
    default:
      return state;
  }
}


export function storesInit(): Thunk {
  return (dispatch: Dispatch) => {
    sys.listStores()
    .then((stores: StoreInfo[]) => {
      dispatch(setStores(stores));
    });
  };
}
