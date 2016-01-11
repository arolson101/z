///<reference path="../project.d.ts"/>
"use strict";

import { t } from "i18next-client";

export function valueOf<T>(x: ReduxForm.Field<any>) {
	return x.value || x.defaultValue;
} 

export interface ValidateErrorSet {
	[name: string]: string;
}

export class ValidateHelper<Props> {
	values: any;
	props: Props;
	errors: ValidateErrorSet;

	constructor(values: any, props: Props, errors: ValidateErrorSet) {
		this.values = values;
		this.props = props;
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
}
