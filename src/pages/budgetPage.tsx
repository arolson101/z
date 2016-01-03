///<reference path="../project.d.ts"/>
"use strict";

import * as React from "react";
import { connect } from "react-redux";
import { Button, Row, Grid, Input, Panel, Table } from "react-bootstrap";
import * as Icon from "react-fa";
import * as reduxForm from "redux-form";
import { createSelector } from "reselect";

import { Budget, t } from "../actions";
import { Component, AccountSelect, DatePicker } from "../components";
import { AppState, BudgetCollection } from "../state";


interface Props extends ReduxForm.Props {
	budgets: BudgetCollection;
	fields: {
		account: ReduxForm.Field<string>;
		name: ReduxForm.Field<string>;
		nextOccurrence: ReduxForm.Field<Date>;
		rrule: ReduxForm.Field<string>;
		amount: ReduxForm.Field<string>;
		
		// index signature to make typescript happy
		[field: string]: ReduxForm.FieldOpt;
	}
}

const FORM_NAME = "budget";

const budgetKeys = [
	"account",
	"name",
	"nextOccurrence",
	"rrule",
	"amount"
];

function validate(values: any): Object {
  const errors: any = { accounts: [] as any[] };
  return errors;
}


@reduxForm.reduxForm({
	form: FORM_NAME,
	fields: [
		...budgetKeys
	],
	initialValues: {
	},
  validate
})
@connect(
	(state: AppState) => ({budgets: state.budgets})
)
export class BudgetPage extends Component<Props> {
	render() {
		const { budgets, fields } = this.props;

		return <Grid>
			<Row>budgets</Row>
			<Table>
				<thead>
					<tr>
						<th>{t("BudgetPage.nameHeader")}</th>
						<th>{t("BudgetPage.nextOccurrenceHeader")}</th>
						<th>{t("BudgetPage.accountHeader")}</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{_.map(budgets, (budget: Budget) =>
						<tr key={budget.dbid}>
							<td>{budget.name}</td>
							<td>{budget.nextOccurrence}</td>
							<td>
								<Button type="button" bsStyle="danger" onClick={() => console.log("todo")}><Icon name="trash-o"/></Button>
							</td>
						</tr>
					)}
				</tbody>
				<tfoot>
					<tr>
						<td>
							<Input
								type="text"
								placeholder={t("BudgetPage.namePlaceholder")}
								{...fields.name}
							/>
						</td>
						<td>
							<DatePicker
								{...fields.nextOccurrence}
							/>
						</td>
						<td>
							<AccountSelect {...fields.account}/>
						</td>
						<td>
							<Button
								type="button"
								onClick={this.onAddBudget}
							>
								<Icon name="plus"/>
							</Button>
						</td>
					</tr>
				</tfoot>
			</Table>
		</Grid>;
	}
	
	onAddBudget() {
		console.log("todo: add budget");
	}
}