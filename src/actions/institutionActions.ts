///<reference path="../project.d.ts"/>
"use strict";

import { Action, AddAction, EditAction, DeleteAction } from "./action";
import { Institution, InstitutionChange } from "../types";
import { Collection, manageCollection } from "../util";

const ADD_INSTITUTION = "institution/add";
const EDIT_INSTITUTION = "institution/edit";
const DELETE_INSTITUTION = "institution/delete";

export { Institution };
export type InstitutionCollection = Collection<Institution>;

export interface AddInstitutionAction extends AddAction<Institution, InstitutionChange> {}
export interface EditInstitutionAction extends EditAction<Institution, InstitutionChange> {}
export interface DeleteInstitutionAction extends DeleteAction<Institution, InstitutionChange> {}

export function addInstitution(institution: Institution): AddInstitutionAction {
	return {
		type: ADD_INSTITUTION,
		id: institution.dbid,
		element: institution
	};
}

export function editInstitution(dbid: number, change: InstitutionChange): EditInstitutionAction {
	return {
		type: EDIT_INSTITUTION,
		id: dbid,
		edit: change
	}
}

export function deleteInstitution(dbid: number): DeleteInstitutionAction {
	return {
		type: DELETE_INSTITUTION,
		id: dbid
	}
}


export const institutionCollectionReducer = manageCollection<Institution, InstitutionChange>(
	ADD_INSTITUTION,
	EDIT_INSTITUTION,
	DELETE_INSTITUTION
);
