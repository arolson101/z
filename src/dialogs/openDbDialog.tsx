///<reference path="../project.d.ts"/>

import electron = require("electron");
import { autobind } from "core-decorators";
import * as React from "react";
import { Alert, Button, Input, Modal } from "react-bootstrap";
import { hashHistory } from "react-router";
import { connect } from "react-redux";

import { ValidateHelper, ReForm } from "../util";
import { t } from "../state";
import { bindActionCreators, updraftCreateDb, updraftOpenDb } from "../actions";

const dialog = electron.remote.dialog;
const BrowserWindow = electron.remote.BrowserWindow;


interface Props extends React.Props<any> {
  updraftCreateDb?(info: any): Promise<any>;
  updraftOpenDb?(info: any): Promise<any>;

  show: boolean;
  open: boolean;
  path: string;
  onCancel: Function;
}


interface State extends ReForm.State {
  opening?: boolean;
  errorMessage?: string;

  fields?: {
    path: ReForm.Field<string>;
    password1: ReForm.Field<string>;
    password2: ReForm.Field<string>;

    // index signature to make typescript happy
    [field: string]: ReForm.Field<any>;
  };
}



@connect(
  null,
  (dispatch: Redux.Dispatch<any>) => bindActionCreators(
    {
      updraftCreateDb,
      updraftOpenDb
    },
    dispatch
  )
)
@ReForm({
  defaultValues: {
    path: "",
    password1: "",
    password2: ""
  }
})
export class OpenDbDialog extends React.Component<Props, State> implements ReForm.Component {
  reForm: ReForm.Interface;

  state = {
    opening: false,
    errorMessage: ""
  } as State;

  validate(values: any): ReForm.Errors {
    const errors: ReForm.Errors = {};
    let v = new ValidateHelper(values, errors);

    v.checkNonempty("path");
    v.checkNonempty("password1");

    if (!this.props.open) {
      v.checkNonempty("password2");

      if (!errors["password1"] && values["password1"] != values["password2"]) {
        errors["password2"] = t("validate.passwordsMatch");
      }
    }

    return errors;
  }

  componentWillReceiveProps(nextProps: Props) {
    console.log("componentWillReceiveProps");
    // this.reForm.setValues({
    //   path: nextProps.path,
    //   password1: "",
    //   password2: ""
    // });
  }

  componentWillUnmount() {
    console.log("unmount");
  }

  render() {
    const { fields, submitFailed } = this.state;
    const { open } = this.props;
    const { handleSubmit } = this.reForm;

    const wrapErrorHelper = (props: any, error: string) => {
      if (error) {
        props.bsStyle = "error";
        props.help = error;
      }
      props.hasFeedback = true;
    };

    const wrapError = (field: ReForm.Field<any>, supressEmptyError?: boolean) => {
      let props: any = _.extend({}, field);
      let error: string = null;
      const isEmpty = (field.value === undefined || field.value == "");
      if (field.error && submitFailed && (!supressEmptyError || !isEmpty)) {
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
              value={fields.path.value}
              onChange={() => {}}
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
    const { fields } = this.state;
    if (this.props.open) {
      dialog.showOpenDialog(
        BrowserWindow.getFocusedWindow(),
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
            fields.path.onChange(fileNames[0]);
          }
        }
      );
    }
    else {
      dialog.showSaveDialog(
        BrowserWindow.getFocusedWindow(),
        {
          title: t("OpenDbDialog.saveDialogTitle"),
          defaultPath: electron.remote.app.getPath("home"),
          filters: [
            { name: t("OpenDbDialog.filetypeName"), extensions: [ t("OpenDbDialog.filetypeExt") ] }
          ]
        },
        (fileName: string) => {
          if (fileName) {
            fields.path.onChange(fileName);
          }
        }
      );
    }
  }

  @autobind
  onSubmit() {
    const { open, updraftCreateDb, updraftOpenDb } = this.props;
    const { fields } = this.state;
    const opts = {
      path: fields.path.value,
      password: fields.password1.value
    };
    this.setState({ opening: true, errorMessage: undefined });
    const p = open ? updraftOpenDb(opts) : updraftCreateDb(opts);
    p.then(
      () => {
        this.setState({ opening: false });
        this.onCancel();
        console.log("redirecting to /");
        hashHistory.replace("/");
      },
      (err: Error) => {
        this.setState({ opening: false, errorMessage: err.message });
      }
    );
  }

  @autobind
  onCancel() {
    const { onCancel } = this.props;
    onCancel();
  }
}
