///<reference path="../project.d.ts"/>
"use strict";

import * as React from "react";
import { connect } from "react-redux";
import { Input, InputProps } from "react-bootstrap";
import * as Icon from "react-fa";
import { createSelector } from "reselect";

import { Component } from "./component";
import { AppState, FI } from "../state";
import { Account, Institution } from "../types";
import { translate, TranslateProps } from "../util";

export interface AccountGroup {
	institution: Institution;
	accounts: Account[];
}

export const accountGroups = createSelector(
  (state: AppState) => state.institutions,
  (state: AppState) => state.accounts,
	(institutions, accounts) =>
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


interface Props extends InputProps, TranslateProps {
	accountGroups?: AccountGroup[];
}


@translate()
@connect(
	(state: AppState) => ({accountGroups: accountGroups(state)})
)
export class AccountSelect extends Component<Props> {
	render() {
    const { t } = this.props;
    
		return <Input type="select" {...this.props}>
			<option>{t("AccountSelect.none")}</option>
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
