///<reference path="../project.d.ts"/>
"use strict";

import { autobind } from "core-decorators";
import * as React from "react";
import {Alert, Panel, Button, Grid, Input, Label, Modal, OverlayTrigger, Row, Col, Table, Tooltip} from "react-bootstrap";
import * as Icon from "react-fa";
import { verify } from "updraft";
import * as reduxForm from "redux-form";

import { Component } from "../components/component";
import { ValidateHelper, valueOf } from "../util";
import { Budget, BudgetChange, Frequency, RRule } from "../types";
import { AppState, BudgetCollection, t } from "../state";


export interface NewDbInfo {
  name: string;
  password: string;
}


interface Props extends ReduxForm.Props, React.Props<any> {
	fields?: {
		name: ReduxForm.Field<string>;
		password1: ReduxForm.Field<string>;
		password2: ReduxForm.Field<string>;

		// index signature to make typescript happy
		[field: string]: ReduxForm.FieldOpt;
	}
	
	show: boolean;
	onCancel: Function;
	onSave: (info: NewDbInfo) => any;
}


function validate(values: any, props: Props): Object {
	const errors: any = { accounts: [] as any[] };
	let v = new ValidateHelper(values, errors);

	v.checkFilename("name");
	v.checkNonempty("password1");
	v.checkNonempty("password2");
  
  if (!errors["password1"] && values["password1"] != values["password2"]) {
    errors["password2"] = t("validate.passwordsMatch");
  }

	return errors;
}


@reduxForm.reduxForm(
	{
		form: "promptDbName",
		fields: [
			"name",
      "password1",
      "password2"
		],
		validate
	}
)
export class CreateDbDialog extends Component<Props> {
	render() {
		const { fields, handleSubmit } = this.props;

		const wrapErrorHelper = (props: any, error: string) => {
			if (error) {
				props.bsStyle = "error";
				props.help = error;
			}
			props.hasFeedback = true;
		};

		const wrapError = (field: ReduxForm.Field<any>, supressEmptyError?: boolean) => {
			let props: any = _.extend({}, field);
			let error: string = null;
			const isEmpty = (field.value === undefined || field.value == "")
			if (field.error && field.touched && (!supressEmptyError || !isEmpty)) {
				error = field.error;
			}
			wrapErrorHelper(props, error);
			return props;
		};

		return (
			<Modal show={this.props.show} onHide={this.onCancel}>
				<form onSubmit={handleSubmit(this.onSave)}>
					<Modal.Header closeButton>
						<Modal.Title>{t("CreateDbDialog.title")}</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Input
							type="text"
							label={t("CreateDbDialog.nameLabel")}
							placeholder={t("CreateDbDialog.namePlaceholder")}
							{...wrapError(fields.name)}
						/>
						<Input
							type="text"
							label={t("CreateDbDialog.passwordLabel")}
							placeholder={t("CreateDbDialog.passwordPlaceholder")}
							{...wrapError(fields.password1)}
						/>
						<Input
							type="text"
							label={t("CreateDbDialog.confirmPasswordLabel")}
							placeholder={t("CreateDbDialog.confirmPasswordPlaceholder")}
							{...wrapError(fields.password2)}
						/>
					</Modal.Body>
					<Modal.Footer>
						<Button onClick={this.onCancel}>{t("CreateDbDialog.cancel")}</Button>
						<Button
							bsStyle="primary"
							type="submit"
						>
							{t("CreateDbDialog.save")}
						</Button>
					</Modal.Footer>
				</form>
			</Modal>
		);
	}

	@autobind
	onSave() {
		const { fields, resetForm, onSave } = this.props;
    onSave({
      name: valueOf(fields.name),
      password: valueOf(fields.password1)
    });
		resetForm();
	}
	
	@autobind
	onCancel() {
		const { resetForm, onCancel } = this.props;
		resetForm();
		onCancel();
	}
}
