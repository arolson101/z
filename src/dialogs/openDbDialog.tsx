///<reference path="../project.d.ts"/>

import { autobind } from "core-decorators";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Alert, Button, ControlLabel, FormGroup, FormControl, HelpBlock, Modal } from "react-bootstrap";
import { connect } from "react-redux";

import { history } from "../components";
import { ValidateHelper, ReForm } from "../util";
import { t } from "../state";
import { bindActionCreators, updraftOpen, OpenStoreInfo, Dispatch } from "../actions";
import { sys } from "../system";


interface Props extends React.Props<any> {
  updraftOpen?(info: OpenStoreInfo): Promise<any>;

  show: boolean;
  open: boolean;
  name: string;
  onCancel: Function;
}


interface State extends ReForm.State {
  opening?: boolean;
  errorMessage?: string;

  fields?: {
    name: ReForm.Field<string>;
    password1: ReForm.Field<string>;
    password2: ReForm.Field<string>;

    // index signature to make typescript happy
    [field: string]: ReForm.Field<any>;
  };
}



@connect(
  null,
  (dispatch: Dispatch) => bindActionCreators(
    {
      updraftOpen
    },
    dispatch
  )
)
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
    opening: false,
    errorMessage: ""
  } as State;

  validate(values: any): ReForm.Errors {
    const errors: ReForm.Errors = {};
    let v = new ValidateHelper(values, errors);

    v.checkFilename("name");

    if ( sys.supportsPassword() ) {
      v.checkNonempty("password1");

      if (!this.props.open) {
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

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.props.show && (this.props.show != prevProps.show)) {
      const { open } = this.props;
      ReactDOM.findDOMNode<HTMLInputElement>(this.refs[open && sys.supportsPassword() ? "password" : "name"]).focus();
    }
  }

  render() {
    const { fields, submitFailed } = this.state;
    const { open } = this.props;

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
      <Modal show={this.props.show} onHide={this.onCancel}>
        <form onSubmit={this.reForm.handleSubmit(this.onSubmit)}>
          <Modal.Header closeButton>
            <Modal.Title>{open ? t("OpenDbDialog.openTitle") : t("OpenDbDialog.createTitle")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup controlId="name" {...validationState(fields.name)}>
              <ControlLabel>{t("OpenDbDialog.nameLabel")}</ControlLabel>
              <FormControl
                type="text"
                ref="name"
                placeholder={t("OpenDbDialog.namePlaceholder")}
                {...fields.name}
                readOnly={open}
              />
              <FormControl.Feedback/>
              <HelpBlock>{validationHelpText(fields.name)}</HelpBlock>
            </FormGroup>
            {sys.supportsPassword() &&
              <FormGroup controlId="password1" {...validationState(fields.password1)}>
                <ControlLabel>{t("OpenDbDialog.passwordLabel")}</ControlLabel>
                <FormControl
                  type="password"
                  ref="password"
                  placeholder={t("OpenDbDialog.passwordPlaceholder")}
                  {...fields.password1}
                />
                <FormControl.Feedback/>
                <HelpBlock>{validationHelpText(fields.password1)}</HelpBlock>
              </FormGroup>
            }
            {sys.supportsPassword() && !open &&
              <FormGroup controlId="password2" {...validationState(fields.password2)}>
                <ControlLabel>{t("OpenDbDialog.confirmPasswordLabel")}</ControlLabel>
                <FormControl
                  type="password"
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
              disabled={!!fields.name.error && this.state.opening}
            >
              {open ? t("OpenDbDialog.open") : t("OpenDbDialog.create")}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  }

  @autobind
  onSubmit() {
    const { open, updraftOpen } = this.props;
    const { fields } = this.state;
    const opts = {
      name: fields.name.value,
      password: fields.password1.value,
      create: !open
    };
    this.setState({ opening: true, errorMessage: undefined });
    const p = updraftOpen(opts);
    p.then(
      () => {
        this.setState({ opening: false });
        this.onCancel();
        history.replace("/");
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
