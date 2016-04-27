///<reference path="../project.d.ts"/>

import { autobind } from "core-decorators";
import * as React from "react";
import { Button, ControlLabel, FormGroup, FormControl, HelpBlock, Modal } from "react-bootstrap";

import { t } from "../state";
import { ValidateHelper, ReForm } from "../util";
import { Account, AccountType } from "../types";
import { EnumSelect } from "../components";


interface Props extends React.Props<any> {
  editing: number;
  show: boolean;
  onCancel: Function;
  onSave: (account: Account) => any;
  onDelete: Function;
  accounts: Account[];
}

interface State extends ReForm.State, React.Props<any> {
  fields?: {
    visible: ReForm.Field<boolean>;
    type: ReForm.Field<number>;
    number: ReForm.Field<string>;
    name: ReForm.Field<string>;

    // index signature to make typescript happy
    [field: string]: ReForm.Field<any>;
  };
}


@ReForm({
  defaultValues: {
    name: "",
    type: AccountType.CHECKING,
    number: "",
    visible: true
  }
})
export class AddAccountDialog extends React.Component<Props, State> implements ReForm.Component {
  reForm: ReForm.Interface;

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.editing != nextProps.editing) {
      if (nextProps.editing != -1) {
        const src = nextProps.accounts[nextProps.editing];
        this.reForm.setValues(src);
      }
      else {
        this.reForm.reset();
      }
    }
  }

  validate(values: ReForm.Values): ReForm.Values {
    const errors: any = { accounts: [] as any[] };
    let v = new ValidateHelper(values, errors);
    const { accounts, editing } = this.props;

    v.checkNonempty("name");
    v.checkNonempty("number");

    const names = _.reduce(
      accounts,
      (set: any, account: Account, i: number) => {
        if (i != editing) {
          set[account.name] = true;
        }
        return set;
      },
      {}
    );
    v.checkUnique("name", names);

    const numbers = _.reduce(
      accounts,
      (set: any, account: Account, i: number) => {
        if (i != editing) {
          set[account.number] = true;
        }
        return set;
      },
      {}
    );
    v.checkUnique("number", numbers);

    return errors;
  }

  render() {
    const { fields, submitFailed } = this.state;
    const { handleSubmit } = this.reForm;

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

    const adding = this.props.editing == -1;

    return (
      <Modal show={this.props.show} onHide={this.onCancel}>
        <form onSubmit={handleSubmit(this.onSave)} ref="form">
          <Modal.Header closeButton>
            <Modal.Title>{adding ? t("AddAccountDialog.addTitle") : t("AddAccountDialog.editTitle")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <EnumSelect label={t("AddAccountDialog.typeLabel")} {...fields.type as any} enum={AccountType}/>
            <FormGroup controlId="addAccountDlg_name" {...validationState(fields.name)}>
              <ControlLabel>{t("AddAccountDialog.nameLabel")}</ControlLabel>
              <FormControl
                type="text"
                ref="name"
                placeholder={t("AddAccountDialog.namePlaceholder")}
                {...fields.name}
              />
              <FormControl.Feedback/>
              <HelpBlock>{validationHelpText(fields.name)}</HelpBlock>
            </FormGroup>
            <FormGroup controlId="addAccountDlg_number" {...validationState(fields.number)}>
              <ControlLabel>{t("AddAccountDialog.numberLabel")}</ControlLabel>
              <FormControl
                type="text"
                ref="number"
                placeholder={t("AddAccountDialog.numberPlaceholder")}
                {...fields.number}
              />
              <FormControl.Feedback/>
              <HelpBlock>{validationHelpText(fields.number)}</HelpBlock>
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            {this.props.editing != -1 &&
              <Button onClick={this.onDelete} bsStyle="danger" className="pull-left">{t("AddAccountDialog.delete")}</Button>
            }
            <Button onClick={this.onCancel}>{t("AddAccountDialog.cancel")}</Button>
            <Button
              bsStyle="primary"
              type="submit"
            >
              {adding ? t("AddAccountDialog.add") : t("AddAccountDialog.save")}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  }

  @autobind
  onSave(values: ReForm.Values) {
    const adding = this.props.editing == -1;
    const src = adding ? { balance: 0 } : this.props.accounts[this.props.editing];
    const account: Account = _.assign({}, src, values);
    this.props.onSave(account);
  }

  @autobind
  onDelete() {
    this.props.onDelete(this.props.editing);
  }

  @autobind
  onCancel() {
    this.props.onCancel();
  }
}
