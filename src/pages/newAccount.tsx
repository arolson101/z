///<reference path="../project.d.ts"/>
"use strict";

import * as React from "react";
import {Alert, Panel, Button, Input, Label, Modal, Row, Col, Table} from "react-bootstrap";
import * as Icon from "react-fa";
import * as LaddaButton from "react-ladda";
import { connect } from "react-redux";
import { reduxForm } from "redux-form";
import * as reactMixin from "react-mixin";
import { History } from "react-router";
import { autobind } from "core-decorators";

import { AppState, FI, i18nFunction } from "../state";
import { Account, AccountType, _Account } from "../types";
import { Component, Select2 } from "../components";
import { mixin, historyMixin } from "../util";
import { bindActionCreators, addAccount, updatePath } from "../actions";

interface AccountField extends ReduxForm.FieldSet, _Account<ReduxForm.Field, ReduxForm.Field, ReduxForm.Field, ReduxForm.Field, ReduxForm.Field> {}
interface AccountFieldArray extends ReduxForm.FieldArray<AccountField> {} 

interface EditAccountProps extends ReduxForm.Props {
	isNew?: boolean;
	addAccount?: (account: Account) => any;
	updatePath?: (path: string) => any;
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
		
		addAcct_name: ReduxForm.Field;
		addAcct_type: ReduxForm.Field;
		addAcct_number: ReduxForm.Field;
		addAcct_visible: ReduxForm.Field;
		
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

const keys = [
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
	
	"addAcct_name",
	"addAcct_type",
	"addAcct_number",
	"addAcct_visible",
];



@historyMixin
@reduxForm({
	form: "newAccount",
	fields: [...keys,
		"accounts[].name",
		"accounts[].type",
		"accounts[].number",
		"accounts[].visible"
	]
})
@connect(
	(state: AppState) => ({filist: state.filist, t: state.t}),
	(dispatch: Redux.Dispatch<any>) => bindActionCreators({ addAccount, updatePath }, dispatch)
)
export class NewAccountPage extends React.Component<EditAccountProps, State> {
	id: number = 25;
	
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
			fields.ofx.value != "" &&
			fields.username.value != "" &&
			fields.password.value != ""
		);

		return (
			<form>
			
				<Select2
					label={t("accountDialog.institutionLabel")}
					help={t("accountDialog.institutionHelp")}
					placeholder={t("accountDialog.institutionPlaceholder")}
					opts={{allowClear:true}}
					{...fields.institution}
				>
					{_.map(filist, fi => <option value={fi.id.toString()} key={fi.id}>{fi.name}</option>)}
				</Select2>

				<hr/>

				<Input
					type="text"
					label={t("accountDialog.nameLabel")}
					help={t("accountDialog.nameHelp")}
					placeholder={t("accountDialog.namePlaceholder")}
					{...fields.name}
				/>

				<Input
					type="text"
					label={t("accountDialog.webLabel")}
					placeholder={t("accountDialog.webPlaceholder")}
					{...fields.web}
				/>

				<Input
					type="textarea"
					rows={4}
					label={t("accountDialog.addressLabel")}
					placeholder={t("accountDialog.addressPlaceholder")}
					{...fields.address}
				/>

				<Input
					type="textarea"
					rows={4}
					label={t("accountDialog.notesLabel")}
					placeholder={t("accountDialog.notesPlaceholder")}
					{...fields.notes}
				/>

				<hr/>

				<Input
					type="checkbox"
					label={t("accountDialog.enableOnline")}
					{...fields.online}
					wrapperClassName="col-xs-12"
				/>
				
				{fields.online.checked &&
					<div>
						<Panel header={t("accountDialog.ofxInfo")}>
							<Input
								type="text"
								label={t("accountDialog.fidLabel")}
								help={t("accountDialog.fidHelp")}
								placeholder={t("accountDialog.fidPlaceholder")}
								{...fields.fid}
							/>
	
							<Input
								type="text"
								label={t("accountDialog.orgLabel")}
								help={t("accountDialog.orgHelp")}
								placeholder={t("accountDialog.orgPlaceholder")}
								{...fields.org}
							/>
	
							<Input
								type="text"
								label={t("accountDialog.ofxLabel")}
								help={t("accountDialog.ofxHelp")}
								placeholder={t("accountDialog.ofxPlaceholder")}
								{...fields.ofx}
							/>
						</Panel>
	
						<Panel key="pass" header={t("accountDialog.userpassInfo")}>
							<Input
								type="text"
								label={t("accountDialog.usernameLabel")}
								help={t("accountDialog.usernameHelp")}
								placeholder={t("accountDialog.usernamePlaceholder")}
								{...fields.username}
							/>
	
							<Input
								type="text"
								label={t("accountDialog.passwordLabel")}
								help={t("accountDialog.passwordHelp")}
								placeholder={t("accountDialog.passwordPlaceholder")}
								{...fields.password}
							/>
						</Panel>
	
						<Input label=" ">
							<Row>
								<Col xs={12}>
									<span className="pull-right">
										{/*<LaddaButton 
											active={this.state.gettingAccounts} 
											disabled={!canGetAccounts} 
											onClick={this.onGetAccountList}
											>
												{t("accountDialog.getAccountList")}
										</LaddaButton>*/}
									</span>
								</Col>
							</Row>
						</Input>
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
				}

				<hr/>

				<Input label="--Accounts">
					<Table hover={true}>
						<tfoot>
							<tr>
								<td>
									<Input type="select" {...fields.addAcct_type}>
										<option id="checking">checking</option>
										<option id="savings">savings</option>
									</Input>
								</td>
								<td>
									<Input type="text" {...fields.addAcct_name}/>
								</td>
								<td>
									<Input type="text" {...fields.addAcct_number}/>
								</td>
								<td>
									<Button type="button" onClick={this.onAddAccount}><Icon name="plus"/></Button>
								</td>
							</tr>
						</tfoot>
						<tbody>
							{fields.accounts.map(this.drawAccount)}
						</tbody>
					</Table>
				</Input>

				<div key="footer" className="modal-footer">
					<Button onClick={this.onClose}>{t("accountDialog.close")}</Button>
					<Button bsStyle="primary" onClick={this.onSubmit} disabled={!canSave}>{t("accountDialog.save")}</Button>
				</div>

			</form>
		);
	}
	
	drawAccount(account: AccountField, index: number) {
		return <tr key={index}>
								<td>{index}</td>
								<td><Input type="text" {...account.name}/></td>
								<td><Input type="text" {...account.number}/></td>
								<td></td>
							</tr>
	}
	
	@autobind
	onAddAccount() {
		const acct: Account = {
			name: this.props.fields.addAcct_name.value as string,
			number: this.props.fields.addAcct_number.value as string,
			type: AccountType.CHECKING, //this.props.fields.addAcct_type.value as string,
			visible: this.props.fields.addAcct_visible.value as boolean,
		};
		this.props.fields.accounts.addField(acct);
	}

	
	@autobind
	onClose() {
	}
	
	@autobind
	onSubmit(e: React.FormEvent) {
	}
	
	onAdd() {
		this.props.addAccount({dbid: this.id, name: "foo " + this.id});
		this.id++;
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
