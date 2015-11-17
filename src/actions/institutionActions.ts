///<reference path="../project.d.ts"/>
"use strict";

import { Action, ActionType } from "./action";
import { Institution, InstitutionChange } from "../types/institution";

export interface AddInstitutionAction extends Action {
	institution: Institution;
}

export function addInstitution(institution: Institution): AddInstitutionAction {
	return {
		type: ActionType.ADD_INSTITUTION,
		institution
	};
}


export interface EditInstitutionAction extends Action {
	change: InstitutionChange;
}

export function editInstitution(change: InstitutionChange): EditInstitutionAction {
	return {
		type: ActionType.EDIT_INSTITUTION,
		change
	}
}


export interface DeleteInstitutionAction extends Action {
	dbid: number;
}

export function deleteInstitution(dbid: number): DeleteInstitutionAction {
	return {
		type: ActionType.DELETE_INSTITUTION,
		dbid
	}
}
