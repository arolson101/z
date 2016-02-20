///<reference path="../project.d.ts"/>

import { Action, ThunkPromise, Dispatch } from "../actions/action";
import { verify } from "updraft";


export interface UpdraftCollection<T> {
  [dbid: string]: T;
}

export interface UpdraftCollectionFunctions<Element, Mutator, Query> {
  load(table: Updraft.Table<Element, Mutator, Query>): ThunkPromise;
  add(table: Updraft.Table<Element, Mutator, Query>, item: Element): ThunkPromise;
  reducer(state: UpdraftCollection<Element>, action: Action): UpdraftCollection<Element>;
}

export function defineUpdraftCollection<Element, Mutator, Query>(tableSpec: Updraft.TableSpec<Element, Mutator, Query>): UpdraftCollectionFunctions<Element, Mutator, Query> {
  const SET_ITEMS = "updraft/" + tableSpec.name + "/set";

  interface SetItemsAction<T> extends Action {
    items: T[];
  }

  const setItems = (items: Element[]): SetItemsAction<Element> => {
    return {
      type: SET_ITEMS,
      items
    };
  };

  const query: Query = {} as any;
  const findOpts: Updraft.FindOpts = {};
  const pk = _.findKey(tableSpec.columns, (col: Updraft.Column) => col.isKey);
  verify(pk, "did not find table's key column");

  const load = (table: Updraft.Table<Element, Mutator, Query>): ThunkPromise => {
    return (dispatch: Dispatch) => {
      return table.find(query, findOpts)
      .then((items: Element[]) => {
        dispatch(setItems(items));
      });
    };
  };

  const add = (table: Updraft.Table<Element, Mutator, Query>, item: Element): ThunkPromise => {
    return (dispatch: Dispatch) => {
      return table.add({
        time: Date.now(),
        save: item
      })
      .then(() => table.find(query))
      .then((items: Element[]) => {
        dispatch(setItems(items));
      });
    };
  };

  const reducer = (state: UpdraftCollection<Element>, action: Action): UpdraftCollection<Element> => {
    state = state || {};
    switch (action.type) {
      case SET_ITEMS:
        return _.keyBy((action as SetItemsAction<Element>).items, pk);
      default:
        return state;
    }
  };

  return { load, add, reducer };
}
