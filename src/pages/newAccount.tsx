///<reference path="../project.d.ts"/>
"use strict";

import * as React from "react";
import { connect } from "react-redux";
import { reduxForm } from "redux-form";
import * as reactMixin from "react-mixin";
import { History } from "react-router";

import { AppState } from "../state";
import { Account } from "../types";
import { Component } from "../components";
import { mixin, historyMixin } from "../util";
import { bindActionCreators, addAccount, updatePath } from "../actions";

interface EditAccountProps {
	isNew?: boolean;
	addAccount?: (account: Account) => any;
	updatePath?: (path: string) => any;
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
@connect(null,
	(dispatch: Redux.Dispatch<any>) => bindActionCreators({ addAccount, updatePath }, dispatch)
)
export class NewAccountPage extends Component<EditAccountProps> {
	id: number = 25;

	render() {
		const {fields: {firstName, lastName, email}} = this.props;
		const handleSubmit = () => this.onAdd();

		return (
			<form>
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
