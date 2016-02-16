///<reference path="../project.d.ts"/>
"use strict";

import * as React from "react";
import { connect } from "react-redux";
import { Row, Grid, Panel } from "react-bootstrap";
import * as Icon from "react-fa";

import { AccountGroup, accountGroups, Component } from "../components";
import { AppState, FI, InstitutionCollection, AccountCollection } from "../state";
import { Account, Institution } from "../types";

interface Props {
	accountGroups: AccountGroup[];
}

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
