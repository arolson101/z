///<reference path="../project.d.ts"/>
"use strict";

import { i18n } from "../i18n";
import sanitize = require("sanitize-filename");

export function valueOf<T>(x: ReduxForm.Field<T>): T {
	if (typeof x.value != "undefined") {
		return x.value;
	}
	else {
		return x.defaultValue;
	}
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

	checkNonempty(key: string): boolean {
		if (!this.values[key] && !this.errors[key]) {
			this.errors[key] = i18n.t("validate.nonempty");
      return false;
		}
    return true;
	}

	checkUnique(key: string, otherValues: { [key: string]: any }): boolean {
		const value = this.values[key];
		if ((value in otherValues) && !this.errors[key]) {
			this.errors[key] = i18n.t("validate.unique");
      return false;
		}
    return true;
	}

	checkNumber(key: string): boolean {
		const value = this.values[key];
		if (!isNumeric(value) && !this.errors[key]) {
			this.errors[key] = i18n.t("validate.numeric");
      return false;
		}
    return true;
	}
  
  checkFilename(key: string): boolean {
    const value = this.values[key];
    if (!this.checkNonempty(key)) {
      return false;
    }
    
    if (sanitize(value) != value) {
      this.errors[key] = i18n.t("validate.filename");
      return false;
    }
    
    return true;
  }
}
