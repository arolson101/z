///<reference path="../project.d.ts"/>
"use strict";

import access = require("safe-access");
import * as React from "react";
import {Alert, Panel, Button, Collapse, Grid, Input, Label, Modal, Row, Col, Table} from "react-bootstrap";
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
import { Component, Select2, FadeTransitionGroup, XTextForm, XSelect, EnumSelect } from "../components";
import { mixin, historyMixin } from "../util";
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
	
	let checkUnique = (key: string) => {
		const field = "addAccount_" + key;
		if (!(field in values)) {
			return;
		}
		const value = values[field]; 
		let found = _.any(values.accounts, (account: any) => account[key] == value);
		if (found) {
			errors[field] = "must be unique";
			return;
		}
	};
	
	checkUnique("name");
	checkUnique("number");
	
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
		const { fields } = this.props;
		const handleSubmit = () => this.onAdd();
		const { filist, t } = this.props;
    const canSave = false; //(fields.name.value && fields.accounts.length > 0);
		const canGetAccounts: boolean = (
			fields.ofx.value as boolean &&
			fields.username.value as boolean &&
			fields.password.value as boolean
		);
		
		let canAdd = _.all(addAccountKeys, (key: string) => (fields[key] as ReduxForm.Field).dirty && !(fields[key] as ReduxForm.Field).error);
		
		const wrapProps = (field: ReduxForm.Field) => {
			let props: any = _.extend({}, field);
			if (field.error) {
				props.bsStyle = "error";
				props.help = field.error;
			}
			props.hasFeedback = true;
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
              {_.map(filist, fi => <option value={this.optionValueForFi(fi)} key={fi.id}>{fi.name}</option>)}
            </Select2>
          </Col>
        </Row>

				<hr/>

        <Row>
          <Col xs={12} md={6}>
            <Input
              type="text"
              label={t("accountDialog.nameLabel")}
              help={t("accountDialog.nameHelp")}
              placeholder={t("accountDialog.namePlaceholder")}
              {...fields.name}
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

				<hr/>

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
	
						<Panel key="pass" header={t("accountDialog.userpassInfo")}>
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

				<hr/>

				<Panel header="---Accounts">
					<Table>
            <thead>
              <tr>
                <th>--visible</th>
                <th>--type</th>
                <th>--name</th>
                <th>--number</th>
                <th></th>
              </tr>
            </thead>
						<FadeTransitionGroup component="tbody">
							{fields.accounts.map((account: AccountField, index: number) =>
                <tr key={index}>
                  <td>
                    <XTextForm {...account.visible}/>
                  </td>
                  <td>
                    <XTextForm {...account.type}/>
                  </td>
                  <td>
                    <XTextForm {...account.name}/>
                  </td>
                  <td>
                    <XTextForm {...account.number}/>
                  </td>
                  <td>
                    <Button type="button" bsStyle="danger" onClick={() => fields.accounts.removeField(index)}><Icon name="trash-o"/></Button>
                  </td>
                </tr>
              )}
						</FadeTransitionGroup>
						<tfoot>
							<tr>
								<td>
									<Input
										type="text"
										placeholder="--visible"
										{...wrapProps(fields.addAccount_visible)}
									/>
								</td>
								<td>
									<EnumSelect {...wrapProps(fields.addAccount_type)} enum={AccountType} tfcn={(name) => this.props.t("AccountTypes." + name)}/>
								</td>
								<td>
									<Input
										type="text"
										placeholder="--name"
										{...wrapProps(fields.addAccount_name)}
									/>
								</td>
								<td>
									<Input
										type="text"
										placeholder="--number"
										{...wrapProps(fields.addAccount_number)}
									/>
								</td>
								<td>
									<Button type="button" onClick={this.onAddAccount} disabled={!canAdd}><Icon name="plus"/></Button>
								</td>
							</tr>
						</tfoot>
					</Table>
					
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

				<div key="footer" className="modal-footer">
					<Button onClick={this.onClose}>{t("accountDialog.close")}</Button>
					<Button bsStyle="primary" onClick={this.onSubmit} disabled={!canSave}>{t("accountDialog.save")}</Button>
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
		const { fields, change } = this.props;
		let account: any = {};
		let keys = ["name", "type", "number", "visible"];
		
		keys.forEach((key: string) => {
			const field = "addAccount_" + key;
			account[key] = (fields[field] as ReduxForm.Field).value;
			change(FORM_NAME, field, "");
		});

		fields.accounts.addField(account);

		keys.forEach((key: string) => {
			change(FORM_NAME, "addAccount_" + key, "");
		});
	}
  
	@autobind
	onClose() {
	}
	
	@autobind
	onSubmit(e: React.FormEvent) {
	}
	
	onAdd() {
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
