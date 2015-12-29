///<reference path="../project.d.ts"/>
"use strict";

import * as React from "react";
import { connect } from "react-redux";
import { Component } from "../components";

import { AppState, FI, i18nFunction, InstitutionCollection, AccountCollection } from "../state";
import { Account, Institution } from "../types";

interface Props {
	t: i18nFunction,
	institutions: InstitutionCollection,
	accounts: AccountCollection
}

@connect(
	(state: AppState) => ({institutions: state.institutions, accounts: state.accounts, t: state.t})
)
export class Dashboard extends Component<Props> {
	render() {
		return <div>
			<p>{Object.keys(this.props.institutions).length} institutions:</p>
			<ul>
				{_.map(this.props.institutions, (institution: Institution) =>
					<li key={institution.dbid}>{institution.name}</li>
				)}
			</ul>
		</div>;
	}
}
