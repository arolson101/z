///<reference path="../project.d.ts"/>

import { autobind } from "core-decorators";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Alert, Button, ControlLabel, FormGroup, FormControl, HelpBlock, Modal } from "react-bootstrap";

import { ValidateHelper, ReForm } from "../util";
import { t, StoreInfo } from "../state";
import { sys } from "../system";


interface Props {
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
export class OpenDialog extends React.Component<Props, State> implements ReForm.Component {
  reForm: ReForm.Interface;

  state = {
    errorMessage: ""
  } as State;

  validate(values: any): ReForm.Errors {
    const errors: ReForm.Errors = {};
    let v = new ValidateHelper(values, errors);
    let create = !this.props.name;

    v.checkFilename("name");

    if (create) {
      const invalidNames = _.keyBy(this.props.stores, (store: StoreInfo) => store.name);
      v.checkUnique("name", invalidNames);
    }

    if ( sys.supportsPassword() ) {
      v.checkNonempty("password1");

      if (create) {
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
  setInitialFocus() {
    const { name } = this.props;
    const ref = ((name && sys.supportsPassword()) ? "password1" : "name");
    ReactDOM.findDOMNode<HTMLInputElement>(this.refs[ref]).focus();
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
      <Modal show={this.props.show} onEnter={this.setInitialFocus} onHide={this.onCancel}>
        <form onSubmit={this.reForm.handleSubmit(this.onSubmit)} ref="form">
          <Modal.Header closeButton>
            <Modal.Title>{name ? t("OpenDialog.openTitle") : t("OpenDialog.createTitle")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup controlId="name" {...validationState(fields.name)}>
              <ControlLabel>{t("OpenDialog.nameLabel")}</ControlLabel>
              <FormControl
                type="text"
                ref="name"
                placeholder={t("OpenDialog.namePlaceholder")}
                {...fields.name}
                readOnly={name}
              />
              <FormControl.Feedback/>
              <HelpBlock>{validationHelpText(fields.name)}</HelpBlock>
            </FormGroup>
            {sys.supportsPassword() &&
              <FormGroup controlId="password1" {...validationState(fields.password1)}>
                <ControlLabel>{t("OpenDialog.passwordLabel")}</ControlLabel>
                <FormControl
                  type="password"
                  ref="password1"
                  placeholder={t("OpenDialog.passwordPlaceholder")}
                  {...fields.password1}
                />
                <FormControl.Feedback/>
                <HelpBlock>{validationHelpText(fields.password1)}</HelpBlock>
              </FormGroup>
            }
            {sys.supportsPassword() && !name &&
              <FormGroup controlId="password2" {...validationState(fields.password2)}>
                <ControlLabel>{t("OpenDialog.confirmPasswordLabel")}</ControlLabel>
                <FormControl
                  type="password"
                  ref="password2"
                  placeholder={t("OpenDialog.confirmPasswordPlaceholder")}
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
                <h4>{name ? t("OpenDialog.errorOpening") : t("OpenDialog.errorCreating")}</h4>
                <p>{this.state.errorMessage}</p>
              </Alert>
            }
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={this.onCancel}
            >
              {t("OpenDialog.cancel")}
            </Button>
            <Button
              bsStyle="primary"
              type="submit"
            >
              {name ? t("OpenDialog.open") : t("OpenDialog.create")}
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
