///<reference path="../project.d.ts"/>
"use strict";

import { autobind } from "core-decorators";
import * as React from "react";
import {Alert, Panel, Button, Grid, Input, Label, Modal, OverlayTrigger, Row, Col, Table, Tooltip} from "react-bootstrap";
import * as Icon from "react-fa";
import { verify } from "updraft";
import * as reduxForm from "redux-form";

import { Component } from "../components/component";
import { ValidateHelper, valueOf, translate, TranslateProps } from "../util";
import { Budget, BudgetChange, Frequency, RRule } from "../types";
import { AppState, BudgetCollection } from "../state";


export interface NewDbInfo {
  name: string;
  password: string;
}


interface Props extends ReduxForm.Props, React.Props<any>, TranslateProps {
	fields?: {
		name: ReduxForm.Field<string>;
		password: ReduxForm.Field<string>;

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
	v.checkNonempty("password");

	return errors;
}


@translate(["PromptDbNameDialog"])
@reduxForm.reduxForm(
	{
		form: "promptDbName",
		fields: [
			"name",
      "password"
		],
		validate
	}
)
export class PromptDbNameDialog extends Component<Props> {
	render() {
		const { fields, handleSubmit, t } = this.props;

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
						<Modal.Title>{t("title")}</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Input
							type="text"
							label={t("nameLabel")}
							placeholder={t("namePlaceholder")}
							{...wrapError(fields.name)}
						/>
						<Input
							type="text"
							label={t("passwordLabel")}
							placeholder={t("passwordPlaceholder")}
							{...wrapError(fields.password)}
						/>
					</Modal.Body>
					<Modal.Footer>
						<Button onClick={this.onCancel}>{t("cancel")}</Button>
						<Button
							bsStyle="primary"
							type="submit"
						>
							{t("save")}
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
      password: valueOf(fields.password)
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
