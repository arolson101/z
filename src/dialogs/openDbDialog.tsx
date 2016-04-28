///<reference path="../project.d.ts"/>

import { autobind } from "core-decorators";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Alert, Button, ControlLabel, FormGroup, FormControl, HelpBlock, Modal } from "react-bootstrap";

import { ValidateHelper, ReForm } from "../util";
import { t, StoreInfo } from "../state";
import { sys } from "../system";


interface Props extends React.Props<any> {
  stores: StoreInfo[];
  performOpen(name: string, password: string, failureCallback: (message: string) => any): any;
  show: boolean;
  name: string;
  onCancel: Function;
}


interface State extends ReForm.State {
  errorMessage?: string;

  fields?: {
    name: ReForm.Field<string>;
    password1: ReForm.Field<string>;
    password2: ReForm.Field<string>;

    // index signature to make typescript happy
    [field: string]: ReForm.Field<any>;
  };
}


@ReForm({
  defaultValues: {
    name: "",
    password1: "",
    password2: ""
  }
})
export class OpenDbDialog extends React.Component<Props, State> implements ReForm.Component {
  reForm: ReForm.Interface;

  state = {
    errorMessage: ""
  } as State;

  validate(values: any): ReForm.Errors {
    const errors: ReForm.Errors = {};
    let v = new ValidateHelper(values, errors);

    v.checkFilename("name");
    const invalidNames = _.keyBy(this.props.stores, (store: StoreInfo) => store.name);
    v.checkUnique("name", invalidNames);

    if ( sys.supportsPassword() ) {
      v.checkNonempty("password1");

      if (!this.props.name) {
        v.checkNonempty("password2");

        if (!errors["password1"] && values["password1"] != values["password2"]) {
          errors["password2"] = t("validate.passwordsMatch");
        }
      }
    }

    return errors;
  }

  componentWillReceiveProps(nextProps: Props) {
    this.reForm.setValues({
      name: nextProps.name,
      password1: "",
      password2: ""
    });
  }

  @autobind
  onEntering() {
    const { name } = this.props;
    ReactDOM.findDOMNode<HTMLInputElement>(this.refs[name && sys.supportsPassword() ? "password" : "name"]).focus();
  }

  render() {
    const { fields, submitFailed } = this.state;
    const { name } = this.props;

    const validationState = (field: ReForm.Field<string>): Object => {
      if (field.error && submitFailed) {
        return { validationState: "error" };
      }
    };

    const validationHelpText = (field: ReForm.Field<string>): string => {
      if (field.error && submitFailed) {
        return field.error;
      }
    };

    return (
      <Modal show={this.props.show} onEntering={this.onEntering} onHide={this.onCancel}>
        <form onSubmit={this.reForm.handleSubmit(this.onSubmit)} ref="form">
          <Modal.Header closeButton>
            <Modal.Title>{name ? t("OpenDbDialog.openTitle") : t("OpenDbDialog.createTitle")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup controlId="name" {...validationState(fields.name)}>
              <ControlLabel>{t("OpenDbDialog.nameLabel")}</ControlLabel>
              <FormControl
                type="text"
                ref="name"
                placeholder={t("OpenDbDialog.namePlaceholder")}
                {...fields.name}
                readOnly={name}
              />
              <FormControl.Feedback/>
              <HelpBlock>{validationHelpText(fields.name)}</HelpBlock>
            </FormGroup>
            {sys.supportsPassword() &&
              <FormGroup controlId="password1" {...validationState(fields.password1)}>
                <ControlLabel>{t("OpenDbDialog.passwordLabel")}</ControlLabel>
                <FormControl
                  type="password"
                  ref="password1"
                  placeholder={t("OpenDbDialog.passwordPlaceholder")}
                  {...fields.password1}
                />
                <FormControl.Feedback/>
                <HelpBlock>{validationHelpText(fields.password1)}</HelpBlock>
              </FormGroup>
            }
            {sys.supportsPassword() && !name &&
              <FormGroup controlId="password2" {...validationState(fields.password2)}>
                <ControlLabel>{t("OpenDbDialog.confirmPasswordLabel")}</ControlLabel>
                <FormControl
                  type="password"
                  ref="password2"
                  placeholder={t("OpenDbDialog.confirmPasswordPlaceholder")}
                  {...fields.password2}
                />
                <FormControl.Feedback/>
                <HelpBlock>{validationHelpText(fields.password2)}</HelpBlock>
              </FormGroup>
            }
            {this.state.errorMessage &&
              <Alert
                bsStyle="danger"
                onDismiss={() => this.setState({errorMessage: undefined})}
                >
                <h4>{name ? t("OpenDbDialog.errorOpening") : t("OpenDbDialog.errorCreating")}</h4>
                <p>{this.state.errorMessage}</p>
              </Alert>
            }
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={this.onCancel}
            >
              {t("OpenDbDialog.cancel")}
            </Button>
            <Button
              bsStyle="primary"
              type="submit"
            >
              {name ? t("OpenDbDialog.open") : t("OpenDbDialog.create")}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  }

  @autobind
  onSubmit() {
    const { performOpen } = this.props;
    const { fields } = this.state;
    performOpen(
      fields.name.value,
      fields.password1.value,
      (message: string) => {
        this.setState({ errorMessage: message });
      }
    );
  }

  @autobind
  onCancel() {
    const { onCancel } = this.props;
    onCancel();
  }
}
