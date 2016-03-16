///<reference path="../project.d.ts"/>

import { autobind } from "core-decorators";
import * as React from "react";
import { Alert, Panel, Button, Collapse, Grid, Input, Row, Col, Table } from "react-bootstrap";
import * as Icon from "react-fa";
//import * as LaddaButton from "react-ladda";
import { connect } from "react-redux";
import hash = require("string-hash");
import { mutate, verify } from "updraft";

import { AppState, FI, UpdraftState, t, InstitutionCollection, AccountCollection } from "../state";
import { Account, accountSpec, AccountType, Institution, institutionSpec } from "../types";
import {
  history,
  ReactSelect,
  FadeTransitionGroup,
  ImageCheckbox,
 } from "../components";
import { AddAccountDialog } from "../dialogs";
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
  accounts: AccountCollection;
  updraft: UpdraftState;
}

interface State extends ReForm.State {
  fields?: {
    name: ReForm.Field<string>;
    web: ReForm.Field<string>;
    address: ReForm.Field<string>;
    notes: ReForm.Field<string>;
    institution: ReForm.Field<string>;

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
    institutions: state.institutions,
    accounts: state.accounts
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
    accounts: [],
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
        this.setState({ accounts: [] });
      }
    }
    else {
      verify(institutionId in props.institutions, "invalid institutionId");
      const src: any = _.assign({}, props.institutions[institutionId]);
      const fi = _.find(this.props.filist, (fi: FI) => fi.name == src.name);
      if (fi) {
        src.institution = this.optionValueForFi(fi);
      }
      this.reForm.setValues(src);

      const accounts = accountsForInstitution(props.accounts, institutionId);
      this.setState({ accounts }, () => this.reForm.runValidate());
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

    const expectedFi = this.fiForOptionValue(this.state.fields.institution.value);
    const wrapWarning = (field: ReForm.Field<string>) => {
      let props: any = _.extend({}, field);
      let expectedValue = (expectedFi ? (expectedFi as any)[field.name] : null);
      if (expectedValue && expectedValue != field.value) {
        props.bsStyle = "warning";
        props.help = t("NewAccountPage.differentWarning", {expectedValue});
        props.hasFeedback = true;
      }
      return props;
    };

    const editing = !isNew(this.props.params.institutionId);

    return (
      <Grid>
        <Row>
          <Col xs={12}>
            <Input
              label={t("NewAccountPage.institutionLabel")}
              help={t("NewAccountPage.institutionHelp")}
            >
              <ReactSelect
                placeholder={t("NewAccountPage.institutionPlaceholder")}
                {...fields.institution}
                onChange={this.onInstitutionChange}
                options={_.map(filist, fi => ({
                  value: this.optionValueForFi(fi),
                  label: fi.name
                }))}
              >
              </ReactSelect>
            </Input>
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
                    {...wrapWarning(fields.fid)}
                  />
                </Col>

                <Col xs={6} md={3}>
                  <Input
                    type="text"
                    label={t("NewAccountPage.orgLabel")}
                    help={t("NewAccountPage.orgHelp")}
                    placeholder={t("NewAccountPage.orgPlaceholder")}
                    {...wrapWarning(fields.org)}
                  />
                </Col>

                <Col xs={12} md={6}>
                  <Input
                    type="text"
                    label={t("NewAccountPage.ofxLabel")}
                    help={t("NewAccountPage.ofxHelp")}
                    placeholder={t("NewAccountPage.ofxPlaceholder")}
                    {...wrapWarning(fields.ofx)}
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
          {submitFailed && fields.accountsValid.error &&
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
          {editing &&
            <Button onClick={this.onDelete} bsStyle="danger" className="pull-left">{t("NewAccountPage.delete")}</Button>
          }
          <Button onClick={this.onClose}>{t("NewAccountPage.close")}</Button>
          <Button
            bsStyle="primary"
            onClick={this.reForm.handleSubmit(editing ? this.onSave : this.onCreate)}
          >
            {editing ? t("NewAccountPage.save") : t("NewAccountPage.create")}
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
  onInstitutionChange(newValue: __ReactSelect.Option) {
    const { fields } = this.state;
    const value = newValue ? newValue.value : null;
    const values: any = {
      institution: value
    };

    type FiFunction = (fi: FI) => string;
    const oldFi = this.fiForOptionValue(fields.institution.value);
    const newFi = this.fiForOptionValue(value);
    const initField = (stateKey: string, fiProp?: string | FiFunction) => {
      fiProp = fiProp || stateKey;
      let getValue: FiFunction = fiProp as FiFunction;
      if (typeof fiProp !== "function") {
        getValue = (fi: FI) => _.get(fi, fiProp, "");
      }
      let field = fields[stateKey] as ReForm.Field<string>;
      if (!field.value || field.value == getValue(oldFi)) {
        values[stateKey] = getValue(newFi);
      }
    };

    initField("name");
    initField("web", "profile.siteURL");
    initField("address", function(fi: FI): string {
      let address = "";
      if (fi && fi.profile) {
        if (fi.profile.address1) { address += fi.profile.address1 + "\n"; }
        if (fi.profile.address2) { address += fi.profile.address2 + "\n"; }
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

    this.reForm.setValues(values);
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
  onAccountDelete(index: number) {
    this.setState(
      mutate(this.state, {
        accounts: { $splice: [[index, 1]] }
      }),
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
    history.goBack();
  }

  makeInstitution(dbid: number): Institution {
    return _.assign(
      {},
      this.reForm.values(),
      { dbid }
    );
  }

  makeInstitutionAccount(institutionId: number) {
    return (src: Account) => {
      return _.assign(
        {
          // default dbid for newly created accounts
          // hash in the time so a new/renumbered account won't collide with a deleted one
          dbid: hash(institutionId + "" + src.number + "" + Date.now()),
        },
        src,
        {
          institution: institutionId
        }
      );
    };
  };

  makeAccounts(institutionId: number): Account[] {
    return this.state.accounts.map(this.makeInstitutionAccount(institutionId));
  }

  @autobind
  onCreate(e: React.FormEvent) {
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
      history.replace("/accounts");
    });
  }

  @autobind
  onSave(e: React.FormEvent) {
    const { updraft, institutions } = this.props;

    const institutionId = this.props.params.institutionId * 1; // coerce to number
    verify(institutionId in institutions, "invalid institutionId");
    const institutionOld = institutions[institutionId];
    const institutionNew = this.makeInstitution(institutionId);
    const institutionChange = makeDiff(institutionOld, institutionNew, institutionSpec);
    const institutionChanges = Object.keys(institutionChange).length == 0 ? [] : [institutionChange];

    const accountsOld = accountsForInstitution(this.props.accounts, institutionId);
    const accountsOldById = _.keyBy(accountsOld, acct => acct.dbid);
    const accountsNew = this.makeAccounts(institutionId);
    const accountsAdded = _(this.state.accounts)
      .map(this.makeInstitutionAccount(institutionId))
      .filter((acct: Account) => !(acct.dbid in accountsOldById))
      .value();
    const accountsRemoved = _(accountsOldById)
      .keys()
      .filter((accountId: number) => !_.some(accountsNew, acct => acct.dbid == accountId))
      .value();
    const accountsChanges = _(accountsNew)
      .filter(acct => (acct.dbid in accountsOldById))
      .map(acctNew => makeDiff(accountsOldById[acctNew.dbid], acctNew, accountSpec))
      .filter(change => Object.keys(change).length > 0)
      .value();

    console.log("accountsAdded: ", accountsAdded);
    console.log("accountsChanges: ", accountsChanges);
    console.log("accountsRemoved: ", accountsRemoved);

    const time = Date.now();

    this.props.updraftAdd(
      updraft,
      ...institutionChanges.map(Updraft.makeChange(updraft.institutionTable, time)),
      ...accountsRemoved.map(Updraft.makeDelete(updraft.accountTable, time)),
      ...accountsChanges.map(Updraft.makeChange(updraft.accountTable, time)),
      ...accountsAdded.map(Updraft.makeSave(updraft.accountTable, time))
    )
    .then(() => {
      history.replace("/accounts");
    });
  }

  @autobind
  onDelete() {
    const { updraft, params: { institutionId } } = this.props;
    const { accounts } = this.state;
    const time = Date.now();
    const accountIds = accounts.map(acct => acct.dbid);

    this.props.updraftAdd(
      updraft,
      Updraft.makeDelete(updraft.institutionTable, time)(institutionId),
      ...accountIds.map(Updraft.makeDelete(updraft.accountTable, time))
    )
    .then(() => {
      history.replace("/accounts");
    });
  }
}

function accountsForInstitution(accounts: AccountCollection, institutionId: number): Account[] {
  return _(accounts)
    .filter((acct: Account) => acct.institution == institutionId)
    .sortBy((acct: Account) => acct.name)
    .value();
}


const hasOwnProperty = Object.hasOwnProperty;

function makeDiff<Element, Mutator>(lhs: Element, rhs: Element, spec: Updraft.TableSpec<Element, Mutator, any>): Mutator {
  const change = {} as any;
  const specKeys = spec ? Object.keys(spec.columns) : null;

  const removedFields = (specKeys || Object.keys(lhs)).filter(key => hasOwnProperty.call(lhs, key) && !hasOwnProperty.call(rhs, key));
  if (removedFields && removedFields.length) {
    change.$delete = removedFields;
  }

  (specKeys || Object.keys(rhs)).forEach(key => {
    let doSet = false;
    if (!hasOwnProperty.call(lhs, key)) {
      doSet = true;
    }
    else {
      if ((lhs as any)[key] !== (rhs as any)[key]) {
        doSet = true;
      }
    }

    if (doSet) {
      change[key] = { $set: (rhs as any)[key] };
    }
  });

  if (spec && Object.keys(change).length > 0) {
    _.forEach(spec.columns, (col: Updraft.Column, name: string) => {
      if (col.isKey) {
        verify(!(name in change), "objects have different keys!");
        change[name] = (rhs as any)[name];
      }
    });
  }

  return change;
}
