///<reference path="../project.d.ts"/>
"use strict";

import { t } from "i18next-client";

export function valueOf<T>(x: ReduxForm.Field<any>) {
	return x.value || x.defaultValue;
}

export interface ValidateErrorSet {
	[name: string]: string;
}


function isNumeric(n: any) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

export class ValidateHelper<Props> {
	values: any;
	errors: ValidateErrorSet;

	constructor(values: any, errors: ValidateErrorSet) {
		this.values = values;
		this.errors = errors;
	}

	checkNonempty(key: string) {
		if (!this.values[key] && !this.errors[key]) {
			this.errors[key] = t("accountDialog.validate.nonempty");
		}
	}

	checkUnique(key: string, otherValues: { [key: string]: any }) {
		const value = this.values[key];
		if ((value in otherValues) && !this.errors[key]) {
			this.errors[key] = t("accountDialog.validate.unique");
		}
	}

	checkNumber(key: string) {
		const value = this.values[key];
		if (!isNumeric(value) && !this.errors[key]) {
			this.errors[key] = t("accountDialog.validate.numeric");
		}
	}
}
