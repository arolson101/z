///<reference path="../project.d.ts"/>
"use strict";

import * as React from "react";
import { connect } from "react-redux";
import { reduxForm } from "redux-form";
import * as reactMixin from "react-mixin";
import { History } from "react-router";

import { AppState, FI, i18nFunction } from "../state";
import { Account } from "../types";
import { Component, Select2, Select2ChangeEvent } from "../components";
import { mixin, historyMixin } from "../util";
import { bindActionCreators, addAccount, updatePath } from "../actions";

interface EditAccountProps {
	isNew?: boolean;
	addAccount?: (account: Account) => any;
	updatePath?: (path: string) => any;
	t: i18nFunction;
	filist: FI[];
	history: ReactRouter.History;
	fields: {
		firstName: string;
		lastName: string;
		email: string;
	};
}

// export var EditAccount = (props?: EditAccountProps) => {
// 	return <div>{props.isNew ? "new" : "edit"} account</div>
// }

@historyMixin
@reduxForm({
	form: "newAccount",
	fields: ["firstName", "lastName", "email"]
})
@connect(
	(state: AppState) => ({filist: state.filist, t: state.t}),
	(dispatch: Redux.Dispatch<any>) => bindActionCreators({ addAccount, updatePath }, dispatch)
)
export class NewAccountPage extends Component<EditAccountProps> {
	id: number = 25;
	
	onInstitutionChange(e: Select2ChangeEvent) {}

	render() {
		const {fields: {firstName, lastName, email}} = this.props;
		const handleSubmit = () => this.onAdd();
		const { filist, t } = this.props;
    var institutionOptions = _.map(filist, fi => <option value={fi.id.toString()} key={fi.id}>{fi.name}</option>);

		return (
			<form>
			
				<Select2
					key="institution"
					label={t("accountDialog.institutionLabel")}
					help={t("accountDialog.institutionHelp")}
					/*defaultValue={this.state.id}*/
					placeholder={t("accountDialog.institutionPlaceholder")}
					opts={{allowClear:true}}
					/*className="form-control"*/
					onChange2={(e) => this.onInstitutionChange(e)}
				>
					<option/>
					{institutionOptions}
				</Select2>
			
				<div className="form-group">
					<label>First Name
						<input type="text" className="form-control" placeholder="first name" {...firstName}/>
					</label>
				</div>
				<div>
					<label>Last Name</label>
					<input type="text" className="form-control" placeholder="last name" {...lastName}/>
				</div>
				<div>
					<label>email</label>
					<input type="text" className="form-control" placeholder="email" {...email}/>
				</div>
				<button type="button" className="btn btn-default" onClick={handleSubmit}>Submit</button>
			</form>
		);
		// <div>{this.props.isNew ? "new" : "edit"} account
		// 	<input type="text" placeholder="First Name" {...firstName}></input>
		// 	<button onClick={() => this.onAdd()}>add</button>
		// </div>
	}
	
	onAdd() {
		this.props.addAccount({dbid: this.id, name: "foo " + this.id});
		this.id++;
		this.props.history.replace("/");
	}
}
