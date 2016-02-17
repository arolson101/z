///<reference path="../project.d.ts"/>
"use strict";

import electron = require("electron");
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
import { bindActionCreators, CreateDbInfo, updraftCreateDb, updraftOpenDb } from "../actions";

const dialog = electron.remote.dialog;


interface Props extends ReduxForm.Props, React.Props<any> {
  updraftCreateDb?(info: any): Promise<any>;
  updraftOpenDb?(info: any): Promise<any>;
  
	fields?: {
    path: ReduxForm.Field<string>;
		password1: ReduxForm.Field<string>;
		password2: ReduxForm.Field<string>;

		// index signature to make typescript happy
		[field: string]: ReduxForm.FieldOpt;
	}
	
	history: ReactRouter.History;
	show: boolean;
  open: boolean;
	onCancel: Function;
}


function validate(values: any, props: Props): Object {
	const errors: any = { accounts: [] as any[] };
	let v = new ValidateHelper(values, errors);

  v.checkNonempty("path");
	v.checkNonempty("password1");
  
  if (!props.open) {
    v.checkNonempty("password2");
  
    if (!errors["password1"] && values["password1"] != values["password2"]) {
      errors["password2"] = t("validate.passwordsMatch");
    }
  }

	return errors;
}


@reduxForm.reduxForm(
	{
		form: "CreateDbDialog",
		fields: [
      "path",
      "password1",
      "password2"
		],
		validate
	},
  null,
  (dispatch: Redux.Dispatch<any>) => bindActionCreators({
		updraftCreateDb,
    updraftOpenDb
	}, dispatch)
)
export class CreateDbDialog extends Component<Props> {
	render() {
		const { fields, handleSubmit, open } = this.props;

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
						<Modal.Title>{open ? t("CreateDbDialog.openTitle") : t("CreateDbDialog.createTitle")}</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Input
              type="text"
							label={t("CreateDbDialog.pathLabel")}
							placeholder={t("CreateDbDialog.pathPlaceholder")}
              value={valueOf(fields.path)}
              buttonAfter={<Button onClick={this.onBrowse}>{t("CreateDbDialog.browseButton")}</Button>}
						/>
						<Input
							type="password"
							label={t("CreateDbDialog.passwordLabel")}
							placeholder={t("CreateDbDialog.passwordPlaceholder")}
							{...wrapError(fields.password1)}
						/>
            {!open &&
              <Input
                type="password"
                label={t("CreateDbDialog.confirmPasswordLabel")}
                placeholder={t("CreateDbDialog.confirmPasswordPlaceholder")}
                {...wrapError(fields.password2)}
              />
            }
					</Modal.Body>
					<Modal.Footer>
						<Button onClick={this.onCancel}>{t("CreateDbDialog.cancel")}</Button>
						<Button
							bsStyle="primary"
							type="submit"
              disabled={!!fields.path.error}
						>
							{open ? t("CreateDbDialog.open") : t("CreateDbDialog.create")}
						</Button>
					</Modal.Footer>
				</form>
			</Modal>
		);
	}
  
  @autobind
  onBrowse() {
    if (this.props.open) {
      dialog.showOpenDialog(null, {
        title: t("CreateDbDialog.openDialogTitle"),
        defaultPath: electron.remote.app.getPath("home"),
        filters: [
          { name: t("CreateDbDialog.filetypeName"), extensions: [ t("CreateDbDialog.filetypeExt") ] },
          { name: t("CreateDbDialog.filetypeAll"), extensions: [ "*" ] }
        ]
      }, (fileNames: string[]) => {
        if (fileNames) {
          this.props.fields.path.onChange(fileNames[0]);
        }
      });
    }
    else {
      dialog.showSaveDialog(null, {
        title: t("CreateDbDialog.saveDialogTitle"),
        defaultPath: electron.remote.app.getPath("home"),
        filters: [
          { name: t("CreateDbDialog.filetypeName"), extensions: [ t("CreateDbDialog.filetypeExt") ] }
        ]
      }, (fileName: string) => {
        if (fileName) {
          this.props.fields.path.onChange(fileName);
        }
      });
    }
  }

	@autobind
	onSave() {
		const { fields, resetForm, open, updraftCreateDb, updraftOpenDb, history } = this.props;
    const opts = {
      path: valueOf(fields.path),
      password: valueOf(fields.password1)
    };
    const p = open ? updraftOpenDb(opts) : updraftCreateDb(opts);
    p.then(() => {
      this.onCancel();
      history.replace("/");
    });
	}
	
	@autobind
	onCancel() {
		const { resetForm, onCancel } = this.props;
		resetForm();
		onCancel();
	}
}
