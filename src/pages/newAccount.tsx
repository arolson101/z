///<reference path="../project.d.ts"/>
"use strict";

import access = require("safe-access");
import * as React from "react";
import {Alert, Panel, Button, Collapse, Grid, Input, Label, Modal, OverlayTrigger, Row, Col, Table, Tooltip} from "react-bootstrap";
import * as Icon from "react-fa";
import * as LaddaButton from "react-ladda";
import { connect } from "react-redux";
import * as reduxForm from "redux-form";
import * as reactMixin from "react-mixin";
import { History } from "react-router";
import { autobind } from "core-decorators";
import * as ReactCSSTransitionGroup from "react-addons-css-transition-group";

import { AppState, FI, i18nFunction } from "../state";
import { Account, AccountType, _Account } from "../types";
import {
	Component,
	Select2,
	FadeTransitionGroup,
	ImageCheckbox,
	XTextForm,
	XSelectForm,
	EnumSelect
 } from "../components";
import { mixin, historyMixin, EnumEx } from "../util";
import { bindActionCreators, addAccount, updatePath } from "../actions";

interface AccountField extends ReduxForm.FieldSet, _Account<ReduxForm.Field, ReduxForm.Field, ReduxForm.Field, ReduxForm.Field, ReduxForm.Field> {}
interface AccountFieldArray extends ReduxForm.FieldArray<AccountField> {} 

interface EditAccountProps extends ReduxForm.Props {
	isNew?: boolean;
	addAccount?: (account: Account) => any;
	updatePath?: (path: string) => any;
	change?: (form: string, field: string, value: string) => any;
	t: i18nFunction;
	filist: FI[];
	history: ReactRouter.History;
	fields: {
		name: ReduxForm.Field;
		web: ReduxForm.Field;
		address: ReduxForm.Field;
		notes: ReduxForm.Field;
		institution: ReduxForm.Field;
		id: ReduxForm.Field;

		online: ReduxForm.Field;

		fid: ReduxForm.Field;
		org: ReduxForm.Field;
		ofx: ReduxForm.Field;

		username: ReduxForm.Field;
		password: ReduxForm.Field;

		addAccount_visible: ReduxForm.Field;
		addAccount_type: ReduxForm.Field;
		addAccount_number: ReduxForm.Field;
		addAccount_name: ReduxForm.Field;
		
		accounts: AccountFieldArray;
		
		// index signature to make typescript happy
		[field: string]: ReduxForm.FieldOpt;
	};
}

interface State {
	userPressedAddAccount?: boolean;
	gettingAccounts?: boolean;
	gettingAccountsSuccess?: number;
	gettingAccountsError?: boolean;
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

function validate(values: any): Object {
  const errors: any = { accounts: [] as any[] };
  const accountNames: any = {};
  const accountNumbers: any = {};
	
	let checkNonempty = (key: string) => {
		if (!values[key]) {
			errors[key] = "accountDialog.validate.nonempty";
			return;
		}
	};
	
	checkNonempty("name");
	
	let checkUniqueAccountField = (key: string) => {
		const field = "addAccount_" + key;
		const value = values[field]; 
		let found = _.any(values.accounts, (account: any) => account[key] == value);
		if (found) {
			errors[field] = "accountDialog.validate.unique";
			return;
		}
	};
	
	checkUniqueAccountField("name");
	checkUniqueAccountField("number");
	
	if (!values.accounts.length) {
		errors["accounts"] = "accountDialog.validate.noAccounts";
	}
	
  return errors;
}


@historyMixin
@reduxForm.reduxForm({
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
})
@connect(
	(state: AppState) => ({filist: state.filist, t: state.t}),
	(dispatch: Redux.Dispatch<any>) => bindActionCreators({
		addAccount,
		updatePath,
		change: reduxForm.change
	}, dispatch)
)
export class NewAccountPage extends React.Component<EditAccountProps, State> {
	constructor() {
		super();
		this.state = {}
	}
	
	render() {
		const { fields, filist, t, handleSubmit } = this.props;
		const canGetAccounts: boolean = (
			fields.ofx.value as boolean &&
			fields.username.value as boolean &&
			fields.password.value as boolean
		);
		
		const wrapProps = (field: ReduxForm.Field, supressEmptyError?: boolean) => {
			let props: any = _.extend({}, field);
			const isEmpty = (field.value === undefined || field.value === "")
			if (field.error && field.touched && (!supressEmptyError || !isEmpty)) {
				props.bsStyle = "error";
				props.help = t(field.error);
			}
			props.hasFeedback = true;
			return props;
		};
		
		const AccountTypes_t = (name: string) => t("AccountTypes." + name);

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
              {...wrapProps(fields.name)}
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
	
						{this.state.gettingAccountsSuccess &&
							<Alert
								bsStyle="success"
								onDismiss={() => this.setState({gettingAccountsSuccess: 0})}
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
                    <XSelectForm {...account.type} source={EnumEx.map(AccountType, (name: string, value: number) => ({value: value, text: AccountTypes_t(name)}))}/>
                  </td>
                  <td {...tdStyle}>
                    <XTextForm {...account.name}/>
                  </td>
                  <td {...tdStyle}>
                    <XTextForm {...account.number}/>
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
									<EnumSelect {...fields.addAccount_type} enum={AccountType} tfcn={AccountTypes_t}/>
								</td>
								<td>
									<Input
										type="text"
										placeholder={t("accountDialog.accountNamePlaceholder")}
										{...wrapProps(fields.addAccount_name, !this.state.userPressedAddAccount)}
									/>
								</td>
								<td>
									<Input
										type="text"
										placeholder={t("accountDialog.accountNumberPlaceholder")}
										{...wrapProps(fields.addAccount_number, !this.state.userPressedAddAccount)}
									/>
								</td>
								<td>
									<Button
										type="button"
										onClick={this.onAddAccount}
									>
										<Icon name="plus"/>
									</Button>
								</td>
							</tr>
						</tfoot>
					</Table>

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
  
  fiForOptionValue(value: string | boolean): FI {
    if (!value) {
      return null;
    }
    let v: number = parseInt(value as string, 10);
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
      let field = fields[stateKey] as ReduxForm.Field;
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
	
	@autobind
	onAddAccount() {
		const { fields, change, touch, untouch } = this.props;
		
		if (fields.addAccount_name.invalid || fields.addAccount_number.invalid) {
			touch(...addAccountKeys);
			this.setState({userPressedAddAccount: true});
			return;
		}

		let account: Account = {
			visible: fields.addAccount_visible.value as boolean,
			type: fields.addAccount_type.value as any,
			name: fields.addAccount_name.value as string,
			number: fields.addAccount_number.value as string,
		};

		fields.accounts.addField(account);
		
		change(FORM_NAME, "addAccount_visible", true as any);
		change(FORM_NAME, "addAccount_type", AccountType.CHECKING as any);
		change(FORM_NAME, "addAccount_name", "");
		change(FORM_NAME, "addAccount_number", "");

		accountKeys.forEach((key: string) => {
			untouch(FORM_NAME, "addAccount_" + key, "");
		});
		this.setState({userPressedAddAccount: false});
	}
  
	@autobind
	onClose() {
		this.props.history.replace("/");
	}
	
	// canSave(): ActiveButtonProps {
	// 	const { fields, t } = this.props;
	// 	let enabled = true;
	// 	let reason = "";
	// 	if (!fields.name.value) {
	// 		enabled = false;
	// 		reason = t("accountDialog.canSaveReason.noName");
	// 	}
	// 	else if (!fields.accounts.length) {
	// 		enabled = false;
	// 		reason = t("accountDialog.canSaveReason.noAccounts");
	// 	}
	// 	return {
	// 		enabled,
	// 		reason,
	// 		id: "canSave",
	// 		title: t("accountDialog.errorTitle")
	// 	}
	// }
	
	@autobind
	onSave(e: React.FormEvent) {
		// this.props.addAccount({dbid: this.id, name: "foo " + this.id});
		// this.id++;
		this.props.history.replace("/");
	}
	

	@autobind
  onGetAccountList() {
    // function convAccountType(acctType: ofx4js.domain.data.banking.AccountType): AccountType {
    //   var str = ofx4js.domain.data.banking.AccountType[acctType];
    //   return AccountType[str];
    // }

    // this.setState({
    //   gettingAccounts: true,
    //   gettingAccountsSuccess: 0,
    //   gettingAccountsError: null
    // });

    // readAccountProfiles({
    //   name: this.state.name,
    //   fid: this.state.fid,
    //   org: this.state.org,
    //   ofx: this.state.ofx,
    //   username: this.state.username,
    //   password: this.state.password
    // })
    // .then((accounts: IAccount[]) => {
    //   var resolvedAccounts = _.union(this.state.accounts, accounts);
    //   resolvedAccounts = _.uniq(resolvedAccounts, account => account.number);
    //   this.setState({
    //     gettingAccounts: false,
    //     gettingAccountsSuccess: accounts.length,
    //     accounts: resolvedAccounts
    //   });
    // })
    // .catch((err) => {
    //   this.setState({
    //     gettingAccounts: false,
    //     gettingAccountsError: err.toString()
    //   });
    // });
  }

}
