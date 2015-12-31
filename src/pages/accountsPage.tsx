///<reference path="../project.d.ts"/>
"use strict";

import * as React from "react";
import { connect } from "react-redux";
import { Row, Grid, Panel } from "react-bootstrap";
import * as Icon from "react-fa";
import { createSelector } from "reselect";

import { Component } from "../components";

import { AppState, FI, t, InstitutionCollection, AccountCollection } from "../state";
import { Account, Institution } from "../types";

interface AccountGroup {
	institution: Institution;
	accounts: Account[];
}

interface Props {
	accountGroups: AccountGroup[];
}

const accountGroups = createSelector<AppState, AccountGroup[]>(
	[
		(state: AppState) => state.institutions,
		(state: AppState) => state.accounts
	],
	(institutions: InstitutionCollection, accounts: AccountCollection) =>
		_.map(_.sortBy(institutions, "name"), 
			(institution: Institution) => ({
				institution,
				accounts: _.sortBy(
					_.filter(accounts, (account: Account) => account.institution === institution.dbid),
					"name"
				)
			} as AccountGroup)
		)
);

@connect(
	(state: AppState) => ({accountGroups: accountGroups(state)})
)
export class AccountsPage extends Component<Props> {
	render() {
		return <Grid>
			<Row>
				{_.map(this.props.accountGroups, (group: AccountGroup) =>
					<Panel
						key={group.institution.dbid}
						header={
							<h3><Icon name="university" /> {group.institution.name}</h3>
						}
					>
						<ul>
						{_.map(group.accounts, (account: Account) =>
								<li key={account.dbid}>{account.name}</li>
						)}
						</ul>
					</Panel>
				)}
			</Row>
		</Grid>;
	}
}
