///<reference path="../project.d.ts"/>
"use strict";

import { Action } from "./action";
import { Institution, institutionSpec } from "../types";
import { UpdraftCollection, defineUpdraftCollection } from "../util";

export { Institution };
export type InstitutionCollection = UpdraftCollection<Institution>;

export const {
	load: loadInstitutions,
	add: addInstitution,
	reducer: institutionCollectionReducer
} = defineUpdraftCollection(institutionSpec);
