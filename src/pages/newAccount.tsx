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
				<div>
					<label>First Name</label>
					<input type="text" placeholder="first name" {...firstName}/>
				</div>
				<div>
					<label>Last Name</label>
					<input type="text" placeholder="last name" {...lastName}/>
				</div>
				<div>
					<label>email</label>
					<input type="text" placeholder="email" {...email}/>
				</div>
				<button onClick={handleSubmit}>Submit</button>
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
		this.props.updatePath("/");
		//this.props.history.goBack();
	}
}
