///<reference path="../project.d.ts"/>

import { autobind } from "core-decorators";
import * as React from "react";
import { Alert, Button, Input, Modal } from "react-bootstrap";
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
      (this.refs[open && sys.supportsPassword() ? "password" : "name"] as any).getInputDOMNode().focus();
    }
  }

  render() {
    const { fields, submitFailed } = this.state;
    const { open } = this.props;

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
        <form onSubmit={this.reForm.handleSubmit(this.onSubmit)}>
          <Modal.Header closeButton>
            <Modal.Title>{open ? t("OpenDbDialog.openTitle") : t("OpenDbDialog.createTitle")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Input
              type="text"
              ref="name"
              label={t("OpenDbDialog.nameLabel")}
              placeholder={t("OpenDbDialog.namePlaceholder")}
              {...wrapError(fields.name)}
              readOnly={open}
            />
            {sys.supportsPassword() &&
              <Input
                type="password"
                ref="password"
                label={t("OpenDbDialog.passwordLabel")}
                placeholder={t("OpenDbDialog.passwordPlaceholder")}
                {...wrapError(fields.password1)}
              />
            }
            {sys.supportsPassword() && !open &&
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
