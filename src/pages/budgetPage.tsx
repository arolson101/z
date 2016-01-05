///<reference path="../project.d.ts"/>
"use strict";

import { autobind } from "core-decorators";
import * as React from "react";
import { connect } from "react-redux";
import { Button, Row, Grid, Input, Panel, Table } from "react-bootstrap";
import * as Icon from "react-fa";
import * as reduxForm from "redux-form";
import { createSelector } from "reselect";

import { Budget, t, bindActionCreators, updraftAdd, updatePath } from "../actions";
import { Component, AccountSelect, DatePicker, XText } from "../components";
import { AppState, UpdraftState, BudgetCollection } from "../state";


interface Props extends ReduxForm.Props {
	budgets: BudgetCollection;
	updraft: UpdraftState;
	updraftAdd?: (state: UpdraftState, ...changes: Updraft.TableChange<any, any>[]) => Promise<any>;
	change?: (form: string, field: string, value: any) => any;
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

	let checkNonempty = (key: string) => {
		if (!values[key]) {
			errors[key] = t("accountDialog.validate.nonempty");
			return;
		}
	};

	checkNonempty("name");

	return errors;
}


@reduxForm.reduxForm({
	form: FORM_NAME,
	fields: [
		...budgetKeys
	],
	initialValues: {
		nextOccurrence: new Date()
	},
	validate
})
@connect(
	(state: AppState) => ({budgets: state.budgets, updraft: state.updraft}),
	(dispatch: Redux.Dispatch<any>) => bindActionCreators({
		updraftAdd,
		change: reduxForm.change
	}, dispatch)
)
export class BudgetPage extends Component<Props> {
	render() {
		const { budgets, fields, handleSubmit } = this.props;

		const wrapErrorHelper = (props: any, error: string) => {
			if (error) {
				props.bsStyle = "error";
				props.help = error;
			}
			props.hasFeedback = true;
		};

		const wrapError = (field: ReduxForm.Field<string>, supressEmptyError?: boolean) => {
			let props: any = _.extend({}, field);
			let error: string = null;
			const isEmpty = (field.value === undefined || field.value === "")
			if (field.error && field.touched && (!supressEmptyError || !isEmpty)) {
				error = field.error;
			}
			wrapErrorHelper(props, error);
			return props;
		};

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
							<td><XText onChange={() => {}} value={budget.name}/></td>
							<td>{budget.nextOccurrence.toString()}</td>
							<td>{budget.account}</td>
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
								{...wrapError(fields.name)}
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
							<Button type="button" bsStyle="success" onClick={handleSubmit(this.onAddBudget)}>
								<Icon name="plus"/>
							</Button>
						</td>
					</tr>
				</tfoot>
			</Table>
		</Grid>;
	}

	makeBudget(dbid: number): Budget {
		const budget: Budget = {
			dbid
		};

		budgetKeys.forEach((key: string) => {
			const field = this.props.fields[key] as ReduxForm.Field<string>;
			(budget as any)[key] = field.value || field.initialValue || "";
		});

		return budget;
	}

	@autobind
	onAddBudget() {
		const { updraft } = this.props;

		const time = Date.now();
		const dbid = Date.now();
		const budget = this.makeBudget(dbid);

		const makeChange = (table: Updraft.TableAny) => {
			return (value: any) => ({
				table,
				time,
				save: value
			});
		}

		this.props.updraftAdd(updraft, makeChange(updraft.budgetTable)(budget));
	}
}
