///<reference path="../project.d.ts"/>
"use strict";

import { autobind } from "core-decorators";
import * as ofx4js from "ofx4js";
import * as React from "react";
import * as ReactCSSTransitionGroup from "react-addons-css-transition-group";
import {Alert, Panel, Button, Collapse, Grid, Input, Label, Modal, OverlayTrigger, Row, Col, Table, Tooltip} from "react-bootstrap";
import * as Icon from "react-fa";
import * as LaddaButton from "react-ladda";
import { History } from "react-router";
import * as reduxForm from "redux-form";
import access = require("safe-access");
import hash = require("string-hash");

import { connect, AppState, FI, t, UpdraftState } from "../state";
import {
	Account, AccountType, _Account, AccountTable,
	Institution, InstitutionTable } from "../types";
import {
	Component,
	Select2,
	FadeTransitionGroup,
	ImageCheckbox,
	XTextForm,
	XSelectForm,
	EnumSelect
 } from "../components";
import { historyMixin, EnumEx } from "../util";
import { bindActionCreators, updraftAdd, updatePath } from "../actions";
import { readAccountProfiles } from "../online";

interface AccountField extends ReduxForm.FieldSet, _Account<ReduxForm.Field<number>, ReduxForm.Field<number>, ReduxForm.Field<string>, ReduxForm.Field<AccountType>, ReduxForm.Field<boolean>> {}
interface AccountFieldArray extends ReduxForm.FieldArray<AccountField> {}

interface Props extends ReduxForm.Props {
	isNew?: boolean;
	updraftAdd?: (state: UpdraftState, ...changes: Updraft.TableChange<any, any>[]) => Promise<any>;
	updatePath?: (path: string) => any;
	change?: (form: string, field: string, value: any) => any;
	filist: FI[];
	updraft: UpdraftState;
	history: ReactRouter.History;
	fields: {
		name: ReduxForm.Field<string>;
		web: ReduxForm.Field<string>;
		address: ReduxForm.Field<string>;
		notes: ReduxForm.Field<string>;
		institution: ReduxForm.Field<string>;
		id: ReduxForm.Field<string>;

		online: ReduxForm.Field<boolean>;

		fid: ReduxForm.Field<string>;
		org: ReduxForm.Field<string>;
		ofx: ReduxForm.Field<string>;

		username: ReduxForm.Field<string>;
		password: ReduxForm.Field<string>;

		addAccount_visible: ReduxForm.Field<boolean>;
		addAccount_type: ReduxForm.Field<number>;
		addAccount_number: ReduxForm.Field<string>;
		addAccount_name: ReduxForm.Field<string>;

		accounts: AccountFieldArray;

		// index signature to make typescript happy
		[field: string]: ReduxForm.FieldOpt;
	};
}

interface State {
	userPressedAddAccount?: boolean;
	gettingAccounts?: boolean;
	gettingAccountsSuccess?: number;
	gettingAccountsError?: string;
}

const FORM_NAME = "newAccount";

const institutionKeys = [
  "name",
  "web",
  "address",
  "notes",
  "institution",
  "id",

  "online",

  "fid",
  "org",
  "ofx",

  "username",
  "password",
];

const accountKeys = [
	"name",
	"type",
	"number",
	"visible"
];

const addAccountKeys = accountKeys.map(x => "addAccount_" + x);

function validate(values: any, props: Props): Object {
  const errors: any = { accounts: [] as any[] };
  const accountNames: any = {};
  const accountNumbers: any = {};

	let checkNonempty = (key: string) => {
		if (!values[key]) {
			errors[key] = t("accountDialog.validate.nonempty");
			return;
		}
	};

	checkNonempty("name");

	if (!values.accounts.length) {
		errors["accounts"] = t("accountDialog.validate.noAccounts");
	}

  return errors;
}


@historyMixin
@reduxForm.reduxForm(
	{
		form: FORM_NAME,
		fields: [
			...institutionKeys,
			...addAccountKeys,
			...accountKeys.map(x => "accounts[]." + x)
		],
		initialValues: {
			online: true,
			addAccount_visible: true,
			addAccount_type: AccountType.CHECKING,
			accounts: []
		},
		validate
	},
	(state: AppState) => ({filist: state.filist, updraft: state.updraft}),
	(dispatch: Redux.Dispatch<any>) => bindActionCreators({
		updraftAdd,
		updatePath,
		change: reduxForm.change
	}, dispatch)
)
export class NewAccountPage extends React.Component<Props, State> {
	constructor() {
		super();
		this.state = {
			gettingAccounts: false,
      gettingAccountsSuccess: null,
      gettingAccountsError: null
		};
	}

	render() {
		const { fields, filist, handleSubmit } = this.props;
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

		const wrapError = (field: ReduxForm.Field<string>, supressEmptyError?: boolean) => {
			let props: any = _.extend({}, field);
			let error: string = null;
			const isEmpty = (field.value === undefined || field.value === "")
			if (field.error && field.touched && (!supressEmptyError || !isEmpty)) {
				error = field.error;
			}
			wrapErrorHelper(props, error);
			return props;
		};

		const accountWrapError = (field: ReduxForm.Field<string>) => {
			let props: any = _.extend({}, field);
			let fieldName = field.name.substring("addAccount_".length);
			let error: string = this.validateAccountField(field.value, fieldName, this.state.userPressedAddAccount);
			wrapErrorHelper(props, error);
			return props;
		};

		const wrapValidator = (field: ReduxForm.Field<any>, fieldName: string) => {
			let props: any = _.extend({}, field);
			props.validate = (value: string) => {
				if (value != field.value) {
					return this.validateAccountField(value, fieldName, true);
				}
			};
			return props;
		};

		return (
			<Grid>

        <Row>
          <Col xs={12}>
            <Select2
              label={t("accountDialog.institutionLabel")}
              help={t("accountDialog.institutionHelp")}
              placeholder={t("accountDialog.institutionPlaceholder")}
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
              label={t("accountDialog.nameLabel")}
              help={t("accountDialog.nameHelp")}
              placeholder={t("accountDialog.namePlaceholder")}
              {...wrapError(fields.name)}
            />
          </Col>

          <Col xs={12} md={6}>
            <Input
              type="text"
              label={t("accountDialog.webLabel")}
              placeholder={t("accountDialog.webPlaceholder")}
              {...fields.web}
            />
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={6}>
            <Input
              type="textarea"
              rows={4}
              label={t("accountDialog.addressLabel")}
              placeholder={t("accountDialog.addressPlaceholder")}
              {...fields.address}
            />
          </Col>

          <Col xs={12} md={6}>
            <Input
              type="textarea"
              rows={4}
              label={t("accountDialog.notesLabel")}
              placeholder={t("accountDialog.notesPlaceholder")}
              {...fields.notes}
            />
          </Col>
        </Row>

				<Input
					type="checkbox"
					label={t("accountDialog.enableOnline")}
					{...fields.online}
				/>

				<Collapse in={fields.online.checked}>
					<div>
						<Panel header={t("accountDialog.ofxInfo")}>
              <Row>
                <Col xs={6} md={3}>
                  <Input
                    type="text"
                    label={t("accountDialog.fidLabel")}
                    help={t("accountDialog.fidHelp")}
                    placeholder={t("accountDialog.fidPlaceholder")}
                    {...fields.fid}
                  />
                </Col>

                <Col xs={6} md={3}>
                  <Input
                    type="text"
                    label={t("accountDialog.orgLabel")}
                    help={t("accountDialog.orgHelp")}
                    placeholder={t("accountDialog.orgPlaceholder")}
                    {...fields.org}
                  />
                </Col>

                <Col xs={6} md={6}>
                  <Input
                    type="text"
                    label={t("accountDialog.ofxLabel")}
                    help={t("accountDialog.ofxHelp")}
                    placeholder={t("accountDialog.ofxPlaceholder")}
                    {...fields.ofx}
                  />
                </Col>
              </Row>
						</Panel>

						<Panel header={t("accountDialog.userpassInfo")}>
              <Row>
                <Col xs={6}>
                  <Input
                    type="text"
                    label={t("accountDialog.usernameLabel")}
                    help={t("accountDialog.usernameHelp")}
                    placeholder={t("accountDialog.usernamePlaceholder")}
                    {...fields.username}
                  />
                </Col>

                <Col xs={6}>
                  <Input
                    type="text"
                    label={t("accountDialog.passwordLabel")}
                    help={t("accountDialog.passwordHelp")}
                    placeholder={t("accountDialog.passwordPlaceholder")}
                    {...fields.password}
                  />
                </Col>
              </Row>
						</Panel>
					</div>
				</Collapse>

				<Panel header={t("accountDialog.accounts")}>
					<Table>
            <thead>
              <tr>
                <th>{t("accountDialog.accountVisible")}</th>
                <th>{t("accountDialog.accountType")}</th>
                <th>{t("accountDialog.accountName")}</th>
                <th>{t("accountDialog.accountNumber")}</th>
                <th></th>
              </tr>
            </thead>
						<FadeTransitionGroup component="tbody">
							{fields.accounts.map((account: AccountField, index: number) => {
								const tdStyle = {style: {verticalAlign: "middle"}};
								return <tr key={index}>
                  <td {...tdStyle}>
                    <ImageCheckbox on="eye" off="eye-slash" {...account.visible}/>
                  </td>
                  <td {...tdStyle}>
                    <XSelectForm {...account.type} source={EnumEx.map(AccountType, (name: string, value: number) => ({value: value, text: AccountType.tr(name)}))}/>
                  </td>
                  <td {...tdStyle}>
                    <XTextForm {...wrapValidator(account.name, "name")}/>
                  </td>
                  <td {...tdStyle}>
                    <XTextForm {...wrapValidator(account.number, "number")}/>
                  </td>
                  <td {...tdStyle}>
                    <Button type="button" bsStyle="danger" onClick={() => fields.accounts.removeField(index)}><Icon name="trash-o"/></Button>
                  </td>
                </tr>
							})}
						</FadeTransitionGroup>
						<tfoot>
							<tr>
								<td>
									<ImageCheckbox on="eye" off="eye-slash" {...fields.addAccount_visible}/>
								</td>
								<td>
									<EnumSelect {...fields.addAccount_type} enum={AccountType}/>
								</td>
								<td>
									<Input
										type="text"
										placeholder={t("accountDialog.accountNamePlaceholder")}
										{...accountWrapError(fields.addAccount_name)}
									/>
								</td>
								<td>
									<Input
										type="text"
										placeholder={t("accountDialog.accountNumberPlaceholder")}
										{...accountWrapError(fields.addAccount_number)}
									/>
								</td>
								<td>
									<Button type="button" bsStyle="success" onClick={this.onAddAccount}>
										<Icon name="plus"/>
									</Button>
								</td>
							</tr>
						</tfoot>
					</Table>

					{this.state.gettingAccountsSuccess &&
						<Alert
							bsStyle="success"
							onDismiss={() => this.setState({gettingAccountsSuccess: null})}
							dismissAfter={2000}
							>
							<h4>{t("accountDialog.successGettingAccounts")}</h4>
							<p>{t("accountDialog.successGettingAccountsMessage", {numAccounts: this.state.gettingAccountsSuccess})}</p>
						</Alert>
					}
					{this.state.gettingAccountsError &&
						<Alert
							bsStyle="danger"
							onDismiss={() => this.setState({gettingAccountsError: null})}
							>
							<h4>{t("accountDialog.errorGettingAccounts")}</h4>
							<p>{this.state.gettingAccountsError}</p>
						</Alert>
					}
					{this.props.submitFailed && fields.accounts.length == 0 &&
						<Alert bsStyle="danger">{t("accountDialog.validate.noAccounts")}</Alert>
					}

					<Collapse in={fields.online.checked}>
						<Row>
							<Col xs={12}>
								<Button
									type="button"
									active={this.state.gettingAccounts}
									disabled={!canGetAccounts}
									onClick={this.onGetAccountList}
									>
										<Icon name={this.state.gettingAccounts ? "fa-spinner fa-pulse" : "download"}/>
										{" " + t("accountDialog.getAccountList")}
								</Button>
							</Col>
						</Row>
					</Collapse>
				</Panel>

				<div className="modal-footer">
					<Button onClick={this.onClose}>{t("accountDialog.close")}</Button>
					<Button
						bsStyle="primary"
						onClick={handleSubmit(this.onSave)}
					>
						{t("accountDialog.save")}
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
    const { fields, change } = this.props;
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
      let field = fields[stateKey] as ReduxForm.Field<string>;
      if (!field.value || field.value == getValue(oldFi)) {
        let value = getValue(newFi);
        change(FORM_NAME, stateKey, value);
      }
    }

    initField("name");
    initField("web", "profile.siteURL");
    initField("address", function(fi: FI): string {
      let address = "";
      if(fi && fi.profile) {
        if(fi.profile.address1) { address += fi.profile.address1 + "\n"; }
        if(fi.profile.address2) { address += fi.profile.address2 + "\n"; }
        if(fi.profile.address3) { address += fi.profile.address3 + "\n"; }
        if(fi.profile.city)     { address += fi.profile.city + ", "; }
        if(fi.profile.state)    { address += fi.profile.state + " "; }
        if(fi.profile.zip)      { address += fi.profile.zip + "\n"; }
        if(fi.profile.country)  { address += fi.profile.country; }
      }
      return address;
    });
    initField("fid");
    initField("org");
    initField("ofx");
  }

	validateAccountField(value: string, fieldName: string, showEmptyError: boolean): string {
		const { fields } = this.props;
		let props: any = {};
		let error: string = null;
		if (showEmptyError && !value) {
			return t("accountDialog.validate.nonempty");
		}
		else if (value && _.any(fields.accounts, (account: ReduxForm.FieldSet) => (account[fieldName] as ReduxForm.Field<string>).value == value)) {
			return t("accountDialog.validate.unique");
		}
	}

	@autobind
	onAddAccount() {
		const { fields, change, touch, untouch } = this.props;

		const check = (fieldName: string) => {
			const field = fields["addAccount_" + fieldName] as ReduxForm.Field<string>;
			return this.validateAccountField(field.value, fieldName, true);
		};

		if (check("name") || check("number")) {
			this.setState({userPressedAddAccount: true});
			return;
		}

		let account: Account = {
			visible: fields.addAccount_visible.value,
			type: fields.addAccount_type.value,
			name: fields.addAccount_name.value,
			number: fields.addAccount_number.value,
		};

		fields.accounts.addField(account);

		change(FORM_NAME, "addAccount_visible", true);
		change(FORM_NAME, "addAccount_type", AccountType.CHECKING);
		change(FORM_NAME, "addAccount_name", "");
		change(FORM_NAME, "addAccount_number", "");

		accountKeys.forEach((key: string) => {
			untouch(FORM_NAME, "addAccount_" + key, "");
		});
		this.setState({userPressedAddAccount: false});
	}

	@autobind
  onGetAccountList() {
		const { fields } = this.props;

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
					if (!_.any(fields.accounts, (a) => a.number.value == account.number)) {
						fields.accounts.addField(account);
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
		this.props.history.replace("/");
	}

	makeInstitution(dbid: number): Institution {
		const institution: Institution = {
			dbid
		};

		institutionKeys.forEach((key: string) => {
			const field = this.props.fields[key] as ReduxForm.Field<string>;
			(institution as any)[key] = field.value || field.initialValue || "";
		});

		return institution;
	}

	makeAccounts(institutionId: number): Account[] {
		const makeAccount = (fields: AccountField) => {
			const account: Account = {
				dbid: hash(institutionId + "" + fields.number.value),
				institution: institutionId
			};

			accountKeys.forEach((key: string) => {
				const field = fields[key] as ReduxForm.Field<any>;
				(account as any)[key] = field.value;
			});

			return account;
		}

		return this.props.fields.accounts.map(makeAccount);
	}

	@autobind
	onSave(e: React.FormEvent) {
		const { updraft } = this.props;

		const time = Date.now();
		const id = Date.now();
		const institution = this.makeInstitution(id);
		const accounts = this.makeAccounts(id);

		this.props.updraftAdd(updraft,
			Updraft.makeSave(updraft.institutionTable, time)(institution),
			...accounts.map(Updraft.makeSave(updraft.accountTable, time))
		)
		.then(() => {
			this.props.history.replace("/dash");
		});
	}
}
