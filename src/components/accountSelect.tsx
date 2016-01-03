///<reference path="../project.d.ts"/>
"use strict";

import * as React from "react";
import { connect } from "react-redux";
import { Input, InputProps } from "react-bootstrap";
import * as Icon from "react-fa";
import { createSelector } from "reselect";

import { Component } from "./component";
import { AppState, FI, t, InstitutionCollection, AccountCollection } from "../state";
import { Account, Institution } from "../types";

export interface AccountGroup {
	institution: Institution;
	accounts: Account[];
}

export const accountGroups = createSelector<AppState, AccountGroup[]>(
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


interface Props extends InputProps {
	accountGroups?: AccountGroup[];
}

@connect(
	(state: AppState) => ({accountGroups: accountGroups(state)})
)
export class AccountSelect extends Component<Props> {
	render() {
		return <Input type="select" {...this.props}>
			<option>{t("accountSelect.none")}</option>
			{_.map(this.props.accountGroups, (accountGroup) =>
				<optgroup key={accountGroup.institution.dbid} label={accountGroup.institution.name}>
					{_.map(accountGroup.accounts, (account) =>
						<option key={account.dbid} value={account.dbid as any}>
							{account.name}
						</option>
					)}
				</optgroup>
			)}
		</Input>;
	}
}
