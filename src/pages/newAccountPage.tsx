///<reference path="../project.d.ts"/>

import { autobind } from "core-decorators";
import * as React from "react";
import { Alert, Panel, Button, Collapse, Grid, Input, Row, Col, Table } from "react-bootstrap";
import * as Icon from "react-fa";
//import * as LaddaButton from "react-ladda";
import access = require("safe-access");
import { browserHistory } from "react-router";
import { connect } from "react-redux";
import hash = require("string-hash");
import { mutate, verify } from "updraft";

import { AppState, FI, UpdraftState, t, InstitutionCollection } from "../state";
import {
  Account, AccountType,
  Institution } from "../types";
import {
  Select2,
  FadeTransitionGroup,
  ImageCheckbox,
 } from "../components";
import {
  /*AccountField,
  AccountFieldArray,*/
  AddAccountDialog
 } from "../dialogs";
import { ValidateHelper, ReForm } from "../util";
import { bindActionCreators, updraftAdd, updatePath } from "../actions";
import { readAccountProfiles } from "../online";

interface Props {
  params?: {
    institutionId?: number;
  };
  updraftAdd?: (state: UpdraftState, ...changes: Updraft.TableChange<any, any>[]) => Promise<any>;
  updatePath?: (path: string) => any;
  filist: FI[];
  institutions: InstitutionCollection;
  updraft: UpdraftState;
}

interface State extends ReForm.State {
  fields?: {
    name: ReForm.Field<string>;
    web: ReForm.Field<string>;
    address: ReForm.Field<string>;
    notes: ReForm.Field<string>;
    institution: ReForm.Field<string>;
    //id: ReForm.Field<string>;

    online: ReForm.Field<boolean>;

    fid: ReForm.Field<string>;
    org: ReForm.Field<string>;
    ofx: ReForm.Field<string>;

    username: ReForm.Field<string>;
    password: ReForm.Field<string>;

    accountsValid: ReForm.Field<any>;

    // index signature to make typescript happy
    [field: string]: ReForm.Field<any>;
  };

  accounts?: Account[];

  adding?: boolean;
  editing?: number;
  gettingAccounts?: boolean;
  gettingAccountsSuccess?: number;
  gettingAccountsError?: string;
}


function isNew(institutionId: number): boolean {
  return (institutionId as any) == "new";
}


@connect(
  (state: AppState) => ({
    filist: state.filist,
    updraft: state.updraft,
    institutions: state.institutions
  } as Props),
  (dispatch: Redux.Dispatch<any>) => bindActionCreators(
    {
      updraftAdd,
      updatePath,
    },
    dispatch)
)
@ReForm({
  defaultValues: {
    name: "",
    web: "",
    address: "",
    notes: "",
    institution: "",
    id: "",

    online: true,

    fid: "",
    org: "",
    ofx: "",

    username: "",
    password: "",

    accountsValid: ""
  },
})
export class NewAccountPage extends React.Component<Props, State> implements ReForm.Component {
  reForm: ReForm.Interface;

  state = {
    accounts: [] as ReForm.Field<any>[],
    adding: false,
    editing: -1,
    gettingAccounts: false,
    gettingAccountsSuccess: null,
    gettingAccountsError: null
  } as State;

  componentWillMount() {
    this.applyFormValues(this.props, true);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.params.institutionId != nextProps.params.institutionId) {
      this.applyFormValues(nextProps, false);
    }
  }

  applyFormValues(props: Props, isMounting: boolean) {
    const institutionId = props.params.institutionId;
    if (isNew(institutionId)) {
      if (!isMounting) {
        this.reForm.reset();
      }
    }
    else {
      verify(institutionId in props.institutions, "invalid institutionId");
      const src = props.institutions[institutionId];
      this.reForm.setValues(src);
    }
  }

  validate(values: ReForm.Values): ReForm.Errors {
    const errors: any = { accounts: [] as any[] };
    let v = new ValidateHelper(values, errors);

    v.checkNonempty("name");

    if (!this.state.accounts.length) {
      errors["accountsValid"] = t("validate.noAccounts");
    }

    return errors;
  }

  render() {
    const { fields, submitFailed, accounts } = this.state;
    const { filist } = this.props;
    const canGetAccounts: boolean = (
      !!fields.ofx.value &&
      !!fields.username.value &&
      !!fields.password.value
    );

    const wrapErrorHelper = (props: any, error: string) => {
      if (error) {
        props.bsStyle = "error";
        props.help = error;
      }
      props.hasFeedback = true;
    };

    const wrapError = (field: ReForm.Field<string>, supressEmptyError?: boolean) => {
      let props: any = _.extend({}, field);
      let error: string = null;
      const isEmpty = (field.value === undefined || field.value === "");
      if (field.error && submitFailed && (!supressEmptyError || !isEmpty)) {
        error = field.error;
      }
      wrapErrorHelper(props, error);
      return props;
    };

    const editing = (this.props.params.institutionId as any) != "new";

    return (
      <Grid>
        <h1>Editing: {editing ? "true" : "false"} ({this.props.params.institutionId})</h1>
        <Row>
          <Col xs={12}>
            <Select2
              label={t("NewAccountPage.institutionLabel")}
              help={t("NewAccountPage.institutionHelp")}
              placeholder={t("NewAccountPage.institutionPlaceholder")}
              opts={{allowClear:true}}
              {...fields.institution}
              onChange={this.onInstitutionChange}
            >
              <option value="0"/>
              {_.map(filist, fi =>
                <option value={this.optionValueForFi(fi)} key={fi.id}>{fi.name}</option>
              )}
            </Select2>
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={6}>
            <Input
              type="text"
              label={t("NewAccountPage.nameLabel")}
              help={t("NewAccountPage.nameHelp")}
              placeholder={t("NewAccountPage.namePlaceholder")}
              {...wrapError(fields.name)}
            />
          </Col>

          <Col xs={12} md={6}>
            <Input
              type="text"
              label={t("NewAccountPage.webLabel")}
              placeholder={t("NewAccountPage.webPlaceholder")}
              {...fields.web}
            />
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={6}>
            <Input
              type="textarea"
              rows={4}
              label={t("NewAccountPage.addressLabel")}
              placeholder={t("NewAccountPage.addressPlaceholder")}
              {...fields.address}
            />
          </Col>

          <Col xs={12} md={6}>
            <Input
              type="textarea"
              rows={4}
              label={t("NewAccountPage.notesLabel")}
              placeholder={t("NewAccountPage.notesPlaceholder")}
              {...fields.notes}
            />
          </Col>
        </Row>

        <Input
          type="checkbox"
          label={t("NewAccountPage.enableOnline")}
          {...fields.online}
        />

        <Collapse in={fields.online.checked}>
          <div>
            <Panel header={t("NewAccountPage.ofxInfo")}>
              <Row>
                <Col xs={6} md={3}>
                  <Input
                    type="text"
                    label={t("NewAccountPage.fidLabel")}
                    help={t("NewAccountPage.fidHelp")}
                    placeholder={t("NewAccountPage.fidPlaceholder")}
                    {...fields.fid}
                  />
                </Col>

                <Col xs={6} md={3}>
                  <Input
                    type="text"
                    label={t("NewAccountPage.orgLabel")}
                    help={t("NewAccountPage.orgHelp")}
                    placeholder={t("NewAccountPage.orgPlaceholder")}
                    {...fields.org}
                  />
                </Col>

                <Col xs={12} md={6}>
                  <Input
                    type="text"
                    label={t("NewAccountPage.ofxLabel")}
                    help={t("NewAccountPage.ofxHelp")}
                    placeholder={t("NewAccountPage.ofxPlaceholder")}
                    {...fields.ofx}
                  />
                </Col>
              </Row>
            </Panel>

            <Panel header={t("NewAccountPage.userpassInfo")}>
              <Row>
                <Col xs={6}>
                  <Input
                    type="text"
                    label={t("NewAccountPage.usernameLabel")}
                    help={t("NewAccountPage.usernameHelp")}
                    placeholder={t("NewAccountPage.usernamePlaceholder")}
                    {...fields.username}
                  />
                </Col>

                <Col xs={6}>
                  <Input
                    type="text"
                    label={t("NewAccountPage.passwordLabel")}
                    help={t("NewAccountPage.passwordHelp")}
                    placeholder={t("NewAccountPage.passwordPlaceholder")}
                    {...fields.password}
                  />
                </Col>
              </Row>
            </Panel>
          </div>
        </Collapse>

        <Panel header={t("NewAccountPage.accounts")}>
          <Table>
            <thead>
              <tr>
                <th>{t("NewAccountPage.accountVisible")}</th>
                <th>{t("NewAccountPage.accountType")}</th>
                <th>{t("NewAccountPage.accountName")}</th>
                <th>{t("NewAccountPage.accountNumber")}</th>
                <th></th>
              </tr>
            </thead>
            <FadeTransitionGroup component="tbody">
              {accounts.map((account: Account, index: number) => {
                const tdStyle = {style: {verticalAlign: "middle"}};
                return <tr key={index}>
                  <td {...tdStyle}>
                    <ImageCheckbox on="eye" off="eye-slash" value={account.visible} onChange={() => {/* TODO */}}/>
                  </td>
                  <td {...tdStyle}>
                    {AccountType.tr(AccountType[account.type])}
                  </td>
                  <td {...tdStyle}>
                    {account.name}
                  </td>
                  <td {...tdStyle}>
                    {account.number}
                  </td>
                  <td {...tdStyle}>
                    <Button type="button" bsStyle="link" onClick={() => this.onEditAccount(index)}><Icon name="edit"/></Button>
                  </td>
                </tr>;
              })}
            </FadeTransitionGroup>
          </Table>

          <AddAccountDialog
            show={this.state.adding || this.state.editing != -1}
            editing={this.state.editing}
            accounts={this.state.accounts}
            onCancel={this.onModalHide}
            onSave={this.onAccountSave}
            onDelete={this.onAccountDelete}
            ref="addAccountDialog"
          />

          {this.state.gettingAccountsSuccess &&
            <Alert
              bsStyle="success"
              onDismiss={() => this.setState({gettingAccountsSuccess: null})}
              dismissAfter={2000}
              >
              <h4>{t("NewAccountPage.successGettingAccounts")}</h4>
              <p>{t("NewAccountPage.successGettingAccountsMessage", {numAccounts: this.state.gettingAccountsSuccess})}</p>
            </Alert>
          }
          {this.state.gettingAccountsError &&
            <Alert
              bsStyle="danger"
              onDismiss={() => this.setState({gettingAccountsError: null})}
              >
              <h4>{t("NewAccountPage.errorGettingAccounts")}</h4>
              <p>{this.state.gettingAccountsError}</p>
            </Alert>
          }
          {this.state.submitFailed && fields.accountsValid.error &&
            <Alert bsStyle="danger">{fields.accountsValid.error}</Alert>
          }

          <Row>
            <Col xs={12}>
              <Button
                type="button"
                bsStyle="success"
                onClick={this.onAddAccount}>{t("NewAccountPage.addAccount")}
              </Button>
              {" "}
              {fields.online.checked &&
                <Button
                  type="button"
                  active={this.state.gettingAccounts}
                  disabled={!canGetAccounts}
                  onClick={this.onGetAccountList}
                  >
                    <Icon name={this.state.gettingAccounts ? "fa-spinner fa-pulse" : "download"}/>
                    {" " + t("NewAccountPage.getAccountList")}
                </Button>
              }
            </Col>
          </Row>
        </Panel>

        <div className="modal-footer">
          <Button onClick={this.onClose}>{t("NewAccountPage.close")}</Button>
          <Button
            bsStyle="primary"
            onClick={this.reForm.handleSubmit(this.onSave)}
          >
            {t("NewAccountPage.save")}
          </Button>
        </div>

      </Grid>
    );
  }

  optionValueForFi(fi: FI): string {
    return fi.id + 1 as any;
  }

  fiForOptionValue(value: string): FI {
    if (!value) {
      return null;
    }
    let v: number = parseInt(value, 10);
    v--;
    return this.props.filist[v];
  }

  @autobind
  onInstitutionChange(e: Event) {
    const { fields } = this.state;
    fields.institution.onChange(e);

    type FiFunction = (fi: FI) => string;
    const oldFi = this.fiForOptionValue(fields.institution.value);
    const newFi = this.fiForOptionValue((e.target as any).value);
    const initField = (stateKey: string, fiProp?: string | FiFunction) => {
      fiProp = fiProp || stateKey;
      let getValue: FiFunction = fiProp as FiFunction;
      if (typeof fiProp !== "function") {
        getValue = (fi: FI) => access(fi, fiProp as string);
      }
      let field = fields[stateKey] as ReForm.Field<string>;
      if (!field.value || field.value == getValue(oldFi)) {
        let value = getValue(newFi);
        field.onChange(value);
      }
    };

    initField("name");
    initField("web", "profile.siteURL");
    initField("address", function(fi: FI): string {
      let address = "";
      if (fi && fi.profile) {
        if (fi.profile.address2) { address += fi.profile.address2 + "\n"; }
        if (fi.profile.address1) { address += fi.profile.address1 + "\n"; }
        if (fi.profile.address3) { address += fi.profile.address3 + "\n"; }
        if (fi.profile.city)     { address += fi.profile.city + ", "; }
        if (fi.profile.state)    { address += fi.profile.state + " "; }
        if (fi.profile.zip)      { address += fi.profile.zip + "\n"; }
        if (fi.profile.country)  { address += fi.profile.country; }
      }
      return address;
    });
    initField("fid");
    initField("org");
    initField("ofx");
  }

  @autobind
  onAddAccount() {
    this.setState({ adding: true });
  }

  @autobind
  onEditAccount(editing: number) {
    this.setState({ editing });
  }

  @autobind
  onModalHide() {
    this.setState({ adding: false, editing: -1 });
  }

  @autobind
  onAccountSave(account: Account) {
    let change: any = {};
    if (this.state.adding) {
      change = { $push: [account] };
    }
    else {
      change = { [this.state.editing]: { $set: account } };
    }
    this.mutateAccounts(change);
  }

  @autobind
  onAccountDelete(index: number) {
    this.mutateAccounts({ $splice: [[index, 1]] });
  }

  mutateAccounts(change: any) {
    this.setState(
      {
        accounts: mutate(this.state.accounts, change)
      },
      () => {
        this.reForm.runValidate();
        this.onModalHide();
      }
    );
  }

  @autobind
  onGetAccountList() {
    const { fields } = this.state;

    this.setState({
      gettingAccounts: true,
      gettingAccountsSuccess: null,
      gettingAccountsError: null
    });

    readAccountProfiles({
      name: fields.name.value,
      fid: fields.fid.value,
      org: fields.org.value,
      ofx: fields.ofx.value,
      username: fields.username.value,
      password: fields.password.value
    })
    .then(
      (accounts: Account[]) => {
        accounts.forEach((account: Account) => {
          if (!_.some(this.state.accounts, (a) => a.number == account.number)) {
            this.onAccountSave(account);
          }
        });

        this.setState({
          gettingAccounts: false,
          gettingAccountsSuccess: accounts.length
        });
      },
      (err) => {
        this.setState({
          gettingAccounts: false,
          gettingAccountsError: err.toString()
        });
      }
    );
  }

  @autobind
  onClose() {
    browserHistory.replace("/");
  }

  makeInstitution(dbid: number): Institution {
    return _.assign(
      {},
      this.reForm.values(),
      { dbid }
    );

    // institutionKeys.forEach((key: string) => {
    //   (institution as any)[key] = this.state.fields[key].value;
    // });

    // return institution;
  }

  makeAccounts(institutionId: number): Account[] {
    const makeAccount = (src: Account) => {
      return _.assign(
        {},
        src,
        {
          dbid: hash(institutionId + "" + src.number),
          institution: institutionId
        }
      );
    };

    return this.state.accounts.map(makeAccount);
  }

  @autobind
  onSave(e: React.FormEvent) {
    const { updraft } = this.props;

    const time = Date.now();
    const id = Date.now();
    const institution = this.makeInstitution(id);
    const accounts = this.makeAccounts(id);

    this.props.updraftAdd(
      updraft,
      Updraft.makeSave(updraft.institutionTable, time)(institution),
      ...accounts.map(Updraft.makeSave(updraft.accountTable, time))
    )
    .then(() => {
      browserHistory.replace("/accounts");
    });
  }
}
