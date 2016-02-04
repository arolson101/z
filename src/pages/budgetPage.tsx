///<reference path="../project.d.ts"/>
"use strict";

import { autobind } from "core-decorators";
import * as React from "react";
import { connect } from "react-redux";
import { Button, Row, Grid, Input, Panel, Table } from "react-bootstrap";
import * as Icon from "react-fa";
import * as reduxForm from "redux-form";
import { createSelector } from "reselect";
import RRule = require("rrule");

import { Budget, BudgetChange, Frequency } from "../types";
import { t, bindActionCreators, updraftAdd, updatePath } from "../actions";
import { Component } from "../components";
import { AddBudgetDialog } from "../dialogs";
import { AppState, UpdraftState, BudgetCollection } from "../state";
import { valueOf, ValidateHelper } from "../util";
import { formatCurrency, formatDate } from "../i18n";

// TODO: refresh on day change

interface Budget2 {
	budget: Budget;
	rrule: __RRule.RRule;
	next: Date;
	last: Date;
}

interface Props extends ReduxForm.Props {
	budgets2: Budget2[];
	accounts: AccountCollection;
	updraft: UpdraftState;
	updraftAdd?: (state: UpdraftState, ...changes: Updraft.TableChange<any, any>[]) => Promise<any>;
	change?: (form: string, field: string, value: any) => any;
}

interface State {
	add?: boolean;
	editing?: number;
}

export const calculateBudget2s = createSelector(
  (state: AppState) => state.budgets,
	(budgets: BudgetCollection) => {
		let now = currentDate();
		return _.chain(budgets)
		.map((budget: Budget) => {
			let rrule = RRule.fromString(budget.rruleString);
			return {
				budget,
				rrule,
				next: rrule.after(now, true),
				last: rrule.before(now, false)
			} as Budget2;
		})
		.sortBy((budget: Budget2) => budget.next || budget.last)
		.value();
	}
);


function currentDate(): Date {
	let date = new Date();
	date.setHours(0, 0, 0, 0);
	return date;
}

@connect(
	(state: AppState) => ({
		accounts: state.accounts,
		budgets2: calculateBudget2s(state),
		updraft: state.updraft
	}),
	(dispatch: Redux.Dispatch<any>) => bindActionCreators({
		updraftAdd,
		change: reduxForm.change
	}, dispatch)
)
export class BudgetPage extends React.Component<Props, State> {
	state = {
		add: false,
		editing: -1
	}
	
	render() {
		const { budgets2, fields, handleSubmit } = this.props;

		return <Grid>
			<Row>budgets</Row>
			<Table>
				<thead>
					<tr>
						<th>{t("BudgetPage.nameHeader")}</th>
						<th>{t("BudgetPage.amountHeader")}</th>
						<th>{t("BudgetPage.nextOccurrenceHeader")}</th>
						<th>{t("BudgetPage.accountHeader")}</th>
						<th>{t("BudgetPage.editHeader")}</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{_.map(budgets2, (budget: Budget2, index: number) => {
						const account = this.props.accounts[budget.budget.account];
						return <tr key={budget.budget.dbid}>
							<td>{budget.budget.name}</td>
							<td>{formatCurrency(budget.budget.amount)}</td>
							<td>{formatDate(budget.next || budget.last)}</td>
							<td>{account ? account.name : t("BudgetPage.noAccount")}</td>
							<td>
								<Button
									type="button"
									bsStyle="link"
									onClick={() => this.onEditBudget(budget.budget.dbid)}
								>
									<Icon name="edit"/>
								</Button>
							</td>
						</tr>
					})}
				</tbody>
			</Table>
			<AddBudgetDialog
				show={this.state.add || this.state.editing != -1}
				editing={this.state.editing}
				onSave={this.onBudgetSave}
				onEdit={this.onBudgetEdit}
				onCancel={this.onModalHide}
				onDelete={this.onDelete}
			/>
			<Button onClick={this.onAddBudget}>{t("BudgetPage.add")}</Button>
		</Grid>;
	}
	
	@autobind
	onAddBudget() {
		this.setState({add: true});
	}
	
	@autobind
	onEditBudget(dbid: number) {
		this.setState({editing: dbid})
	}

	@autobind
	onModalHide() {
		this.setState({add: false, editing: -1});
	}

	@autobind
	onBudgetSave(budget: Budget) {
		const { updraft, updraftAdd, resetForm } = this.props;
		updraftAdd(updraft, Updraft.makeSave(updraft.budgetTable, Date.now())(budget));
		this.onModalHide();
	}
	
	@autobind
	onBudgetEdit(change: BudgetChange) {
		const { updraft, updraftAdd } = this.props;
		updraftAdd(updraft, Updraft.makeChange(updraft.budgetTable, Date.now())(change));
		this.onModalHide();
	}

	@autobind
	onDelete(dbid: number) {
		const { updraft, updraftAdd } = this.props;
		updraftAdd(updraft, Updraft.makeDelete(updraft.budgetTable, Date.now())(dbid));
		this.onModalHide();
	}
}
