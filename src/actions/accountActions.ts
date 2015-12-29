///<reference path="../project.d.ts"/>
"use strict";

import { Action } from "./action";
import { Account, accountSpec } from "../types";
import { UpdraftCollection, defineUpdraftCollection } from "../util";

export { Account };
export type AccountCollection = UpdraftCollection<Account>;

export const {
	load: loadAccounts,
	add: addAccount,
	reducer: accountCollectionReducer
} = defineUpdraftCollection(accountSpec);
