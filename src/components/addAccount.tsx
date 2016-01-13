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
	
	onAddAccount: (account: Account) => any;
	accounts: AccountFieldArray;
}

const FORM_NAME = "addAccount";



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
		form: FORM_NAME,
		fields: [
			"name",
			"type",
			"number",
			"visible"
		],
		initialValues: {
			visbile: true,
			type: AccountType.CHECKING
		},
		validate: addAccountValidate
	}
)
export class AddAccountForm extends Component<Props> {
	render() {
		const { fields, handleSubmit } = this.props;

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

		return <tfoot>
			<tr>
				<td>
					<ImageCheckbox on="eye" off="eye-slash" {...fields.visible}/>
				</td>
				<td>
					<EnumSelect {...fields.type} enum={AccountType}/>
				</td>
				<td>
					<Input
						type="text"
						placeholder={t("accountDialog.accountNamePlaceholder")}
						{...wrapError(fields.name)}
					/>
				</td>
				<td>
					<Input
						type="text"
						placeholder={t("accountDialog.accountNumberPlaceholder")}
						{...wrapError(fields.number)}
					/>
				</td>
				<td>
					<Button type="button" bsStyle="success" onClick={handleSubmit(this.onSave)}>
						<Icon name="plus"/>
					</Button>
				</td>
			</tr>
		</tfoot>;
	}
	
	@autobind
	onSave(e: React.FormEvent) {
		const { fields, resetForm } = this.props;
		if (this.props.onAddAccount) {
			this.props.onAddAccount({
				name: valueOf(fields.name),
				number: valueOf(fields.number),
				type: valueOf(fields.type),
				visible: valueOf(fields.visible)
			});
			
			resetForm();
		}
	}
}
