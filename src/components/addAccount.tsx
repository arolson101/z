///<reference path="../project.d.ts"/>
"use strict";

import { autobind } from "core-decorators";
import * as React from "react";
import {Alert, Panel, Button, Collapse, Grid, Input, Label, Modal, OverlayTrigger, Row, Col, Table, Tooltip} from "react-bootstrap";
import * as Icon from "react-fa";
import { t } from "i18next-client";

import { Component } from "./component";
import { ValidateHelper, valueOf } from "../util";
import { Account, AccountType, _Account, AccountTable } from "../types";
import * as reduxForm from "redux-form";
import { ImageCheckbox } from "./imageCheckbox";
import { EnumSelect } from "./enumSelect";


export interface AccountField extends ReduxForm.FieldSet, _Account<ReduxForm.Field<number>, ReduxForm.Field<number>, ReduxForm.Field<string>, ReduxForm.Field<AccountType>, ReduxForm.Field<boolean>> {}
export interface AccountFieldArray extends ReduxForm.FieldArray<AccountField> {}

interface Props extends ReduxForm.Props {
	fields?: {
		visible: ReduxForm.Field<boolean>;
		type: ReduxForm.Field<number>;
		number: ReduxForm.Field<string>;
		name: ReduxForm.Field<string>;
		
		// index signature to make typescript happy
		[field: string]: ReduxForm.FieldOpt;
	}
  
  editing?: number;
	
  show: boolean;
  onCancel: Function;
	onSave: (account: Account) => any;
	accounts: AccountFieldArray;
}


const accountKeys = [
  "name",
  "type",
  "number",
  "visible"
];


export function addAccountValidate(values: any, props: Props): Object {
  const errors: any = { accounts: [] as any[] };
	let v = new ValidateHelper(values, errors);

	v.checkNonempty("name");
	v.checkNonempty("number");
	
	const names = _.reduce(
		props.accounts, 
		(set: any, account: AccountField) => {
			set[valueOf(account.name)] = true;
			return set;
		},
		{}
	);
	v.checkUnique("name", names);

	const numbers = _.reduce(
		props.accounts, 
		(set: any, account: AccountField) => {
			set[valueOf(account.number)] = true;
			return set;
		},
		{}
	);
	v.checkUnique("number", numbers);

  return errors;
}

@reduxForm.reduxForm(
	{
		form: "addAccount",
		fields: accountKeys,
		initialValues: {
			visbile: true,
			type: AccountType.CHECKING
		},
		validate: addAccountValidate
	}
)
export class AddAccountDialog extends Component<Props> {
  constructor(props?: Props) {
    super(props);
    if (props) {
      //this.componentWillReceiveProps(props);
    }
  }
  
  componentWillReceiveProps(nextProps: Props) {
    const adding = nextProps.editing == -1;
    accountKeys.forEach(key => {
      const field = nextProps.fields[key] as ReduxForm.Field<string>;
      const value = adding ? field.initialValue : valueOf(nextProps.accounts[nextProps.editing][name] as ReduxForm.Field<string>);
      field.onChange(value);
    });
  }
  
	render() {
		const { fields, handleSubmit, onCancel } = this.props;

		const wrapErrorHelper = (props: any, error: string) => {
			if (error) {
				props.bsStyle = "error";
				props.help = error;
			}
			props.hasFeedback = true;
		};

		const wrapError = (field: ReduxForm.Field<string>, supressEmptyError?: boolean) => {
			let props: any = _.extend({}, field);
			let error: string = null;
			const isEmpty = (field.value === undefined || field.value === "")
			if (field.error && field.touched && (!supressEmptyError || !isEmpty)) {
				error = field.error;
			}
			wrapErrorHelper(props, error);
			return props;
		};
    
    const adding = this.props.editing == -1;

		return (
      <Modal show={this.props.show} onHide={onCancel}>
        <Modal.Header closeButton>
          <Modal.Title>{adding ? t("accountDialog.modal.addTitle") : t("accountDialog.modal.editTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <EnumSelect {...fields.type} enum={AccountType}/>
          <Input
            type="text"
            placeholder={t("accountDialog.accountNamePlaceholder")}
            {...wrapError(fields.name)}
          />
          <Input
            type="text"
            placeholder={t("accountDialog.accountNumberPlaceholder")}
            {...wrapError(fields.number)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onCancel}>{t("accountDialog.modal.cancel")}</Button>
          <Button
            bsStyle="primary"
            onClick={this.onSave}
          >
            {adding ? t("accountDialog.modal.save") : t("accountDialog.modal.add")}
          </Button>
        </Modal.Footer>
      </Modal>
    );
	}
	
	@autobind
	onSave(e: React.FormEvent) {
		const { fields, resetForm } = this.props;
		if (this.props.onSave) {
			this.props.onSave({
				name: valueOf(fields.name),
				number: valueOf(fields.number),
				type: valueOf(fields.type),
				visible: valueOf(fields.visible)
			});
			
			resetForm();
		}
	}
}
