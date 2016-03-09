///<reference path="../project.d.ts"/>

import { t } from "../i18n";
import * as sanitize from "sanitize-filename";

export function valueOf<T>(x: ReduxForm.Field<T>): T {
  if (typeof x.value != "undefined") {
    return x.value;
  }
  else {
    return x.defaultValue;
  }
}

export function applyFormValues(fields: {[fieldName: string]: ReduxForm.FieldOpt}, values: {[fieldName: string]: any}) {
  for (let fieldName in values) {
    if ((values as Object).hasOwnProperty(fieldName)) {
      let value = values[fieldName];
      if (fieldName in fields) {
        let field = fields[fieldName] as ReduxForm.Field<any>;
        if (valueOf(field) != value) {
          field.onChange(value);
        }
      }
    }
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
      this.errors[key] = t("validate.nonempty");
      return false;
    }
    return true;
  }

  checkUnique(key: string, otherValues: { [key: string]: any }): boolean {
    const value = this.values[key];
    if ((value in otherValues) && !this.errors[key]) {
      this.errors[key] = t("validate.unique");
      return false;
    }
    return true;
  }

  checkNumber(key: string): boolean {
    const value = this.values[key];
    if (!isNumeric(value) && !this.errors[key]) {
      this.errors[key] = t("validate.numeric");
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
      this.errors[key] = t("validate.filename");
      return false;
    }

    return true;
  }
}
