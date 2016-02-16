///<reference path="../project.d.ts"/>
"use strict";

import { autobind } from "core-decorators";
import * as React from "react";
import {Alert, Panel, Button, Grid, Input, Label, Modal, OverlayTrigger, Row, Col, Table, Tooltip} from "react-bootstrap";
import * as Icon from "react-fa";
import * as reduxForm from "redux-form";

import { ValidateHelper, valueOf, translate, TranslateProps } from "../util";
import { Account, AccountType, _Account, AccountTable, defaultAccount } from "../types";
import { Component, ImageCheckbox, EnumSelect } from "../components";


export interface AccountField extends ReduxForm.FieldSet, _Account<ReduxForm.Field<number>, ReduxForm.Field<number>, ReduxForm.Field<string>, ReduxForm.Field<AccountType>, ReduxForm.Field<boolean>> {}
export interface AccountFieldArray extends ReduxForm.FieldArray<AccountField> {}

interface Props extends ReduxForm.Props, React.Props<any>, TranslateProps {
	fields?: {
		visible: ReduxForm.Field<boolean>;
		type: ReduxForm.Field<number>;
		number: ReduxForm.Field<string>;
		name: ReduxForm.Field<string>;

		// index signature to make typescript happy
		[field: string]: ReduxForm.FieldOpt;
	}

	editing: number;
	show: boolean;
	onCancel: Function;
	onSave: (account: Account) => any;
	onDelete: Function;
	accounts: AccountFieldArray;
}

type AnyField = ReduxForm.Field<any>;

const accountKeys = [
	"name",
	"type",
	"number",
	"visible"
];


function validate(values: any, props: Props): Object {
	const errors: any = { accounts: [] as any[] };
	let v = new ValidateHelper(values, errors);

	v.checkNonempty("name");
	v.checkNonempty("number");

	const names = _.reduce(
		props.accounts,
		(set: any, account: AccountField, i: number) => {
			if (i != props.editing) {
			 set[valueOf(account.name)] = true;
			}
			return set;
		},
		{}
	);
	v.checkUnique("name", names);

	const numbers = _.reduce(
		props.accounts,
		(set: any, account: AccountField, i: number) => {
			if (i != props.editing) {
				set[valueOf(account.number)] = true;
			}
			return set;
		},
		{}
	);
	v.checkUnique("number", numbers);

	return errors;
}


@translate(["AddAccountDialog"])
@reduxForm.reduxForm(
	{
		form: "addAccount",
		fields: accountKeys,
		initialValues: defaultAccount,
		validate
	}
)
export class AddAccountDialog extends Component<Props> {
	componentWillReceiveProps(nextProps: Props) {
		if (this.props.editing != nextProps.editing) {
			if (nextProps.editing != -1) {
				const src = nextProps.accounts[nextProps.editing];
				accountKeys.forEach(key => {
					const nextField = nextProps.fields[key] as AnyField;
					const srcValue = (src[key] as AnyField).value;
					if (nextField.value != srcValue) {
						nextField.onChange(srcValue);
					}
				});
			}
		}
	}

	render() {
		const { fields, handleSubmit, t } = this.props;

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
			<Modal show={this.props.show} onHide={this.onCancel}>
				<form onSubmit={handleSubmit(this.onSave)}>
					<Modal.Header closeButton>
						<Modal.Title>{adding ? t("addTitle") : t("editTitle")}</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<EnumSelect label={t("typeLabel")} {...fields.type} enum={AccountType}/>
						<Input
							type="text"
							label={t("nameLabel")}
							placeholder={t("namePlaceholder")}
							{...wrapError(fields.name)}
						/>
						<Input
							type="text"
							label={t("numberLabel")}
							placeholder={t("numberPlaceholder")}
							{...wrapError(fields.number)}
						/>
					</Modal.Body>
					<Modal.Footer>
						<Button onClick={this.onCancel}>{t("cancel")}</Button>
						{this.props.editing != -1 &&
							<Button onClick={this.onDelete} bsStyle="danger">{t("delete")}</Button>
						}
						<Button
							bsStyle="primary"
							type="submit"
						>
							{adding ? t("add") : t("save")}
						</Button>
					</Modal.Footer>
				</form>
			</Modal>
		);
	}

	@autobind
	onSave() {
		const { fields, resetForm, onSave } = this.props;
		const account: Account = {
			name: valueOf(fields.name),
			number: valueOf(fields.number),
			type: valueOf(fields.type),
			visible: valueOf(fields.visible)
		};
		onSave(account);
		resetForm();
	}
	
	@autobind
	onDelete() {
		const { onDelete, resetForm } = this.props;
		resetForm();
		onDelete(this.props.editing);
	}

	@autobind
	onCancel() {
		const { resetForm, onCancel } = this.props;
		resetForm();
		onCancel();
	}
}
