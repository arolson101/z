///<reference path="../project.d.ts"/>
"use strict";

import { Action, ActionType, AddAction, EditAction, DeleteAction } from "./action";
import { Institution, InstitutionChange } from "../types/index";

export interface AddInstitutionAction extends AddAction<Institution, InstitutionChange> {}
export interface EditInstitutionAction extends EditAction<Institution, InstitutionChange> {}
export interface DeleteInstitutionAction extends DeleteAction<Institution, InstitutionChange> {}

export function addInstitution(account: Institution): AddInstitutionAction {
	return {
		type: ActionType.ADD_INSTITUTION,
		id: account.dbid,
		element: account
	};
}

export function editInstitution(dbid: number, change: InstitutionChange): EditInstitutionAction {
	return {
		type: ActionType.EDIT_INSTITUTION,
		id: dbid,
		edit: change
	}
}

export function deleteInstitution(dbid: number): DeleteInstitutionAction {
	return {
		type: ActionType.DELETE_INSTITUTION,
		id: dbid
	}
}
