///<reference path="../project.d.ts"/>
"use strict";

import electron = require("electron");
import { autobind } from "core-decorators";
import * as React from "react";
import { Alert, Button, Input, Modal } from "react-bootstrap";
import * as reduxForm from "redux-form";
import { browserHistory } from "react-router";

import { ValidateHelper, valueOf } from "../util";
import { t } from "../state";
import { bindActionCreators, updraftCreateDb, updraftOpenDb } from "../actions";

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
  };

  show: boolean;
  open: boolean;
  path: string;
  onCancel: Function;
}


interface State {
  opening?: boolean;
  errorMessage?: string;
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
  (dispatch: Redux.Dispatch<any>) => bindActionCreators(
    {
      updraftCreateDb,
      updraftOpenDb
    },
    dispatch
  )
)
export class OpenDbDialog extends React.Component<Props, State> {
  state = {
    opening: false,
    errorMessage: ""
  };

  componentWillReceiveProps(nextProps: Props) {
    const { fields } = nextProps;
    if (this.props.path != nextProps.path) {
      fields.path.onChange(nextProps.path);
    }
  }

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
      const isEmpty = (field.value === undefined || field.value == "");
      if (field.error && field.touched && (!supressEmptyError || !isEmpty)) {
        error = field.error;
      }
      wrapErrorHelper(props, error);
      return props;
    };

    return (
      <Modal show={this.props.show} onHide={this.onCancel}>
        <form onSubmit={handleSubmit(this.onSubmit)}>
          <Modal.Header closeButton>
            <Modal.Title>{open ? t("OpenDbDialog.openTitle") : t("OpenDbDialog.createTitle")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Input
              type="text"
              label={t("OpenDbDialog.pathLabel")}
              placeholder={t("OpenDbDialog.pathPlaceholder")}
              value={valueOf(fields.path)}
              buttonAfter={<Button onClick={this.onBrowse}>{t("OpenDbDialog.browseButton")}</Button>}
            />
            <Input
              type="password"
              label={t("OpenDbDialog.passwordLabel")}
              placeholder={t("OpenDbDialog.passwordPlaceholder")}
              {...wrapError(fields.password1)}
            />
            {!open &&
              <Input
                type="password"
                label={t("OpenDbDialog.confirmPasswordLabel")}
                placeholder={t("OpenDbDialog.confirmPasswordPlaceholder")}
                {...wrapError(fields.password2)}
              />
            }
            {this.state.errorMessage &&
              <Alert
                bsStyle="danger"
                onDismiss={() => this.setState({errorMessage: undefined})}
                >
                <h4>{open ? t("OpenDbDialog.errorOpening") : t("OpenDbDialog.errorCreating")}</h4>
                <p>{this.state.errorMessage}</p>
              </Alert>
            }
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={this.onCancel}
              disabled={this.state.opening}
            >
              {t("OpenDbDialog.cancel")}
            </Button>
            <Button
              bsStyle="primary"
              type="submit"
              disabled={!!fields.path.error && this.state.opening}
            >
              {open ? t("OpenDbDialog.open") : t("OpenDbDialog.create")}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  }

  @autobind
  onBrowse() {
    if (this.props.open) {
      dialog.showOpenDialog(
        null,
        {
          title: t("OpenDbDialog.openDialogTitle"),
          defaultPath: electron.remote.app.getPath("home"),
          filters: [
            { name: t("OpenDbDialog.filetypeName"), extensions: [ t("OpenDbDialog.filetypeExt") ] },
            { name: t("OpenDbDialog.filetypeAll"), extensions: [ "*" ] }
          ]
        },
        (fileNames: string[]) => {
          if (fileNames) {
            this.props.fields.path.onChange(fileNames[0]);
          }
        }
      );
    }
    else {
      dialog.showSaveDialog(
        null,
        {
          title: t("OpenDbDialog.saveDialogTitle"),
          defaultPath: electron.remote.app.getPath("home"),
          filters: [
            { name: t("OpenDbDialog.filetypeName"), extensions: [ t("OpenDbDialog.filetypeExt") ] }
          ]
        },
        (fileName: string) => {
          if (fileName) {
            this.props.fields.path.onChange(fileName);
          }
        }
      );
    }
  }

  @autobind
  onSubmit() {
    const { fields, open, updraftCreateDb, updraftOpenDb } = this.props;
    const opts = {
      path: valueOf(fields.path),
      password: valueOf(fields.password1)
    };
    this.setState({ opening: true, errorMessage: undefined });
    const p = open ? updraftOpenDb(opts) : updraftCreateDb(opts);
    p.then(
      () => {
        this.setState({ opening: false });
        this.onCancel();
        browserHistory.replace("/");
      },
      (err: Error) => {
        this.setState({ opening: false, errorMessage: err.message });
      }
    );
  }

  @autobind
  onCancel() {
    const { resetForm, onCancel } = this.props;
    resetForm();
    onCancel();
  }
}
