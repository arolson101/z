///<reference path="../project.d.ts"/>
"use strict";

import * as React from "react";
import { connect } from "react-redux";
import { AppState } from "../state";
import { Account } from "../types";
import { bindActionCreators, addAccount, updatePath } from "../actions";

interface EditAccountProps {
	isNew?: boolean;
	addAccount?: (account: Account) => any;
	updatePath?: (path: string) => any;
}

// export var EditAccount = (props?: EditAccountProps) => {
// 	return <div>{props.isNew ? "new" : "edit"} account</div>
// }


@connect(null,
	(dispatch: Redux.Dispatch<any>) => bindActionCreators({ addAccount, updatePath }, dispatch)
)
export class EditAccount extends React.Component<EditAccountProps, any> {
	id: number = 25;

	render() {
		return <div>{this.props.isNew ? "new" : "edit"} account
			<input type="text"></input>
			<button type="button" onClick={() => this.onAdd()}>add</button>
		</div>
	}
	
	onAdd() {
		this.props.addAccount({dbid: this.id, name: "foo " + this.id});
		this.id++;
		this.props.updatePath("/");
	}
}
