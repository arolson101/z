///<reference path="../project.d.ts"/>

import { autobind } from "core-decorators";
import * as React from "react";
import { Alert, Panel, Button, Checkbox, Collapse, FormGroup, FormControl, ControlLabel, HelpBlock, Grid, Row, Col, Table } from "react-bootstrap";
import * as Icon from "react-fa";
//import * as LaddaButton from "react-ladda";
import { connect } from "react-redux";
import hash = require("string-hash");
import { update, verify } from "updraft";

import { AppState, FI, UpdraftState, t, InstitutionCollection, AccountCollection } from "../state";
import { Account, accountSpec, AccountType, Institution, institutionSpec } from "../types";
import {
  history,
  ReactSelect,
  FadeTransitionGroup,
  ImageCheckbox,
 } from "../components";
import { AccountEditDialog } from "../dialogs";
import { ValidateHelper, ReForm } from "../util";
import { bindActionCreators, Dispatch, updraftAdd } from "../actions";
import { readAccountProfiles, ReadAccountProfilesParams } from "../online";


interface PageProps {
  params?: {
    institutionId?: number;
  };
  updraftAdd?: (state: UpdraftState, ...changes: Updraft.TableChange<any, any>[]) => Promise<any>;
  filist: FI[];
  institutions: InstitutionCollection;
  accounts: AccountCollection;
  updraft: UpdraftState;
}

function isNew(institutionId: number): boolean {
  return (typeof institutionId === "undefined") || (institutionId as any) == "new";
}


@connect(
  (state: AppState): PageProps => ({
    filist: state.filist,
    updraft: state.updraft,
    institutions: state.institutions,
    accounts: state.accounts
  }),
  (dispatch: Dispatch) => bindActionCreators(
    {
      updraftAdd,
    },
    dispatch)
)
export class InstitutionEditPage extends React.Component<PageProps, any> {
  render() {
    return (
      <InstitutionEditPageDisplay
        {...this.props}
        institutionId={this.props.params.institutionId}
        updraftAdd={this.onUpdraftAdd}
        readAccountProfiles={readAccountProfiles}
      />
    );
  }

  @autobind
  onUpdraftAdd(state: UpdraftState, ...changes: Updraft.TableChange<any, any>[]): Promise<any> {
    let p = this.props.updraftAdd.apply(this, arguments) as Promise<any>;
    return p.then(() => {
      history.replace("/institutions");
    });
  }
}



interface Props {
  institutionId?: number;
  updraftAdd: (state: UpdraftState, ...changes: Updraft.TableChange<any, any>[]) => Promise<any>;
  readAccountProfiles: (params: ReadAccountProfilesParams) => Promise<Account[]>;
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

  dialogShow?: boolean;
  dialogEditIndex?: number;
  gettingAccounts?: boolean;
  gettingAccountsSuccess?: number;
  gettingAccountsError?: string;
}

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
export class InstitutionEditPageDisplay extends React.Component<Props, State> implements ReForm.Component {
  reForm: ReForm.Interface;

  state = {
    accounts: [],
    dialogShow: false,
    dialogEditIndex: undefined,
    gettingAccounts: false,
    gettingAccountsSuccess: null,
    gettingAccountsError: null
  } as State;

  componentWillMount() {
    this.applyFormValues(this.props, true);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.institutionId != nextProps.institutionId) {
      this.applyFormValues(nextProps, false);
    }
  }

  applyFormValues(props: Props, isMounting: boolean) {
    const institutionId = props.institutionId;
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
      !!fields.name.value &&
      !!fields.fid.value &&
      !!fields.org.value &&
      !!fields.ofx.value &&
      !!fields.username.value &&
      !!fields.password.value
    );

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

    const renderFidOrgOfx = (which: string, label: string) => {
      const expectedFi = this.fiForOptionValue(this.state.fields.institution.value);
      const field = fields[which];
      let expectedValue = (expectedFi ? (expectedFi as any)[field.name] : null);

      let validationStateProp = {};
      let helpText = "";
      if (expectedValue && expectedValue != field.value) {
        validationStateProp = { validationState: "warning" };
        helpText = t("InstitutionEditPage.differentWarning", {expectedValue});
      }

      return (
        <FormGroup controlId={which} {...validationStateProp}>
          <ControlLabel>{label}</ControlLabel>
          <FormControl
            type="text"
            {...field}
          />
          <FormControl.Feedback/>
          <HelpBlock>{helpText}</HelpBlock>
        </FormGroup>
      );
    };

    const editing = !isNew(this.props.institutionId);

    return (
      <Grid>
        <Row>
          <Col xs={12}>
            <FormGroup controlId="institution">
              <ControlLabel>{t("InstitutionEditPage.institutionLabel")}</ControlLabel>
              <ReactSelect
                className="institution"
                inputProps={{id: "institution"}}
                placeholder={t("InstitutionEditPage.institutionPlaceholder")}
                {...fields.institution}
                onChange={this.onInstitutionChange}
                options={_.map(filist, fi => ({
                  value: this.optionValueForFi(fi),
                  label: fi.name
                }))}
              >
              </ReactSelect>
              <HelpBlock>{t("InstitutionEditPage.institutionHelp")}</HelpBlock>
            </FormGroup>
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={6}>
            <FormGroup controlId="name" {...validationState(fields.name)}>
              <ControlLabel>{t("InstitutionEditPage.nameLabel")}</ControlLabel>
              <FormControl
                type="text"
                placeholder={t("InstitutionEditPage.namePlaceholder")}
                {...fields.name}
              />
              <FormControl.Feedback/>
              <HelpBlock>{validationHelpText(fields.name)}</HelpBlock>
            </FormGroup>
          </Col>

          <Col xs={12} md={6}>
            <FormGroup controlId="web">
              <ControlLabel>{t("InstitutionEditPage.webLabel")}</ControlLabel>
              <FormControl
                type="text"
                placeholder={t("InstitutionEditPage.webPlaceholder")}
                {...fields.web}
              />
            </FormGroup>
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={6}>
            <FormGroup controlId="address">
              <ControlLabel>{t("InstitutionEditPage.addressLabel")}</ControlLabel>
              <FormControl
                componentClass="textarea"
                rows={4}
                placeholder={t("InstitutionEditPage.addressPlaceholder")}
                {...fields.address}
              />
            </FormGroup>
          </Col>

          <Col xs={12} md={6}>
            <FormGroup controlId="notes">
              <ControlLabel>{t("InstitutionEditPage.notesLabel")}</ControlLabel>
              <FormControl
                componentClass="textarea"
                rows={4}
                placeholder={t("InstitutionEditPage.notesPlaceholder")}
                {...fields.notes}
              />
            </FormGroup>
          </Col>
        </Row>

        <Checkbox id="online" {...fields.online as any}>
          {t("InstitutionEditPage.enableOnline")}
        </Checkbox>

        <Collapse in={fields.online.checked}>
          <div>
            <Panel header={t("InstitutionEditPage.ofxInfo")}>
              <Row>
                <Col xs={6} md={3}>
                  {renderFidOrgOfx("fid", t("InstitutionEditPage.fidLabel"))}
                </Col>

                <Col xs={6} md={3}>
                  {renderFidOrgOfx("org", t("InstitutionEditPage.orgLabel"))}
                </Col>

                <Col xs={12} md={6}>
                  {renderFidOrgOfx("ofx", t("InstitutionEditPage.ofxLabel"))}
                </Col>
              </Row>
            </Panel>

            <Panel header={t("InstitutionEditPage.userpassInfo")}>
              <Row>
                <Col xs={6}>
                  <FormGroup controlId="username">
                    <ControlLabel>{t("InstitutionEditPage.usernameLabel")}</ControlLabel>
                    <FormControl
                      type="text"
                      {...fields.username}
                    />
                  </FormGroup>
                </Col>

                <Col xs={6}>
                  <FormGroup controlId="password">
                    <ControlLabel>{t("InstitutionEditPage.passwordLabel")}</ControlLabel>
                    <FormControl
                      type="text"
                      {...fields.password}
                    />
                  </FormGroup>
                </Col>
              </Row>
            </Panel>
          </div>
        </Collapse>

        <Panel header={t("InstitutionEditPage.accounts")}>
          <Table>
            <thead>
              <tr>
                <th>{t("InstitutionEditPage.accountVisible")}</th>
                <th>{t("InstitutionEditPage.accountType")}</th>
                <th>{t("InstitutionEditPage.accountName")}</th>
                <th>{t("InstitutionEditPage.accountNumber")}</th>
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

          <AccountEditDialog
            show={this.state.dialogShow}
            editIndex={this.state.dialogEditIndex}
            accounts={this.state.accounts}
            onCancel={this.onModalHide}
            onSave={this.onAccountSave}
            onDelete={this.onAccountDelete}
            ref="accountEditDialog"
          />

          {this.state.gettingAccountsSuccess &&
            <Alert
              bsStyle="success"
              onDismiss={() => this.setState({gettingAccountsSuccess: null})}
              >
              <h4>{t("InstitutionEditPage.successGettingAccounts")}</h4>
              <p>{t("InstitutionEditPage.successGettingAccountsMessage", {numAccounts: this.state.gettingAccountsSuccess})}</p>
            </Alert>
          }
          {this.state.gettingAccountsError &&
            <Alert
              bsStyle="danger"
              onDismiss={() => this.setState({gettingAccountsError: null})}
              >
              <h4>{t("InstitutionEditPage.errorGettingAccounts")}</h4>
              <p id="gettingAccountsErrorMessage">{this.state.gettingAccountsError}</p>
            </Alert>
          }
          {submitFailed && fields.accountsValid.error &&
            <Alert bsStyle="danger">{fields.accountsValid.error}</Alert>
          }

          <Row>
            <Col xs={12}>
              <Button
                type="button"
                id="addAccount"
                bsStyle="success"
                onClick={this.onAddAccount}>{t("InstitutionEditPage.addAccount")}
              </Button>
              {" "}
              {fields.online.checked &&
                <Button
                  type="button"
                  active={this.state.gettingAccounts}
                  disabled={!canGetAccounts}
                  onClick={this.onGetAccountList}
                  id="getAccountList"
                  >
                    <Icon name={this.state.gettingAccounts ? "fa-spinner fa-pulse" : "download"}/>
                    {" " + t("InstitutionEditPage.getAccountList")}
                </Button>
              }
            </Col>
          </Row>
        </Panel>

        <div className="modal-footer">
          {editing &&
            <Button onClick={this.onDelete} bsStyle="danger" className="pull-left">{t("InstitutionEditPage.delete")}</Button>
          }
          {__DEVELOPMENT__ &&
            <Button onClick={this.onRandom}><Icon name="random"/> random</Button>
          }
          <Button onClick={this.onClose}>{t("InstitutionEditPage.close")}</Button>
          <Button
            bsStyle="primary"
            id="submit"
            disabled={this.state.gettingAccounts}
            onClick={this.reForm.handleSubmit(editing ? this.onSave : this.onCreate)}
          >
            {editing ? t("InstitutionEditPage.save") : t("InstitutionEditPage.create")}
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
  onInstitutionChange(newValue: {value: string | number, label: string}) {
    const { fields } = this.state;
    const value = newValue ? newValue.value : null;
    const values: any = {
      institution: value
    };

    type FiFunction = (fi: FI) => string;
    const oldFi = this.fiForOptionValue(fields.institution.value);
    const newFi = this.fiForOptionValue(value as string);
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
    this.setState({ dialogShow: true, dialogEditIndex: undefined });
  }

  @autobind
  onEditAccount(editIndex: number) {
    this.setState({ dialogShow: true, dialogEditIndex: editIndex });
  }

  @autobind
  onModalHide() {
    this.setState({ dialogShow: false, dialogEditIndex: undefined });
  }

  @autobind
  onAccountSave(editIndex: number, account: Account) {
    let change: any = {};
    if (editIndex != undefined) {
      change = { [editIndex]: { $set: account } };
    }
    else {
      change = { $push: [account] };
    }
    this.setState(
      {
        accounts: update(this.state.accounts, change)
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
      update(this.state, {
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

    this.props.readAccountProfiles({
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
          if (!account.name) {
            account.name = AccountType.tr(AccountType[account.type]);
          }
          if (!_.some(this.state.accounts, (a) => a.number == account.number && a.type == account.type)) {
            this.onAccountSave(undefined, account);
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
  onRandom() {
    if (__DEVELOPMENT__) {
      const faker: Faker.FakerStatic = require("faker");
      const fiIdx = _.random(1, this.props.filist.length) as any;
      const fi = this.fiForOptionValue(fiIdx);
      const accountTypes = _.range(0, AccountType.CREDITCARD);
      let accounts: Account[] = _.sampleSize(accountTypes, _.random(0, accountTypes.length - 1))
      .map((type: AccountType): Account => {
        return {
          visible: true,
          type,
          number: faker.finance.account(),
          name: fi.name + " " + AccountType.tr(AccountType[type])
        };
      });
      this.onInstitutionChange({value: fiIdx, label: ""});
      this.setState(
        { accounts },
        () => this.reForm.runValidate()
      );
    }
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
      Updraft.makeCreate(updraft.institutionTable, time)(institution),
      ...accounts.map(Updraft.makeCreate(updraft.accountTable, time))
    );
  }

  @autobind
  onSave(e: React.FormEvent) {
    const { updraft, institutions } = this.props;

    const institutionId = this.props.institutionId * 1; // coerce to number
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

    // console.log("accountsAdded: ", accountsAdded);
    // console.log("accountsChanges: ", accountsChanges);
    // console.log("accountsRemoved: ", accountsRemoved);

    const time = Date.now();

    this.props.updraftAdd(
      updraft,
      ...institutionChanges.map(Updraft.makeUpdate(updraft.institutionTable, time)),
      ...accountsRemoved.map(Updraft.makeDelete(updraft.accountTable, time)),
      ...accountsChanges.map(Updraft.makeUpdate(updraft.accountTable, time)),
      ...accountsAdded.map(Updraft.makeCreate(updraft.accountTable, time))
    );
  }

  @autobind
  onDelete() {
    const { updraft, institutionId } = this.props;
    const { accounts } = this.state;
    const time = Date.now();
    const accountIds = accounts.map(acct => acct.dbid);

    this.props.updraftAdd(
      updraft,
      Updraft.makeDelete(updraft.institutionTable, time)(institutionId),
      ...accountIds.map(Updraft.makeDelete(updraft.accountTable, time))
    );
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
