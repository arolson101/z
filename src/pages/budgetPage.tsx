///<reference path="../project.d.ts"/>
"use strict";

import { autobind } from "core-decorators";
import * as React from "react";
import { connect } from "react-redux";
import { Button, Row, Grid, Input, Panel, Table } from "react-bootstrap";
import * as Icon from "react-fa";
import * as reduxForm from "redux-form";
import { createSelector } from "reselect";
import * as later from "later";

import { Budget, BudgetChange } from "../types";
import { t, bindActionCreators, updraftAdd, updatePath } from "../actions";
import { Component, AccountSelect, DatePicker, EnumSelect, XText } from "../components";
import { AppState, UpdraftState, BudgetCollection } from "../state";

function test() {
  let sched = later.parse.text('every 5 minutes'),
      occurrences = later.schedule(sched).next(10);

      occurrences.forEach((x, i) => console.log(x));
}

test();

enum RecurrencePeriod {
	YEAR,
	MONTH,
	WEEK,
	DAY,
}

module RecurrencePeriod {
	export function parse(idx: string): RecurrencePeriod { return (RecurrencePeriod as any)[idx]; }
	export function tr(name: string): string { return t("RecurrencePeriod." + name); }
}

interface Budget2 {
	budget: Budget;
	nextOccurrence: Date;
}

interface Props extends ReduxForm.Props {
	budgets2: Budget2[];
	updraft: UpdraftState;
	updraftAdd?: (state: UpdraftState, ...changes: Updraft.TableChange<any, any>[]) => Promise<any>;
	change?: (form: string, field: string, value: any) => any;
	fields: {
		account: ReduxForm.Field<string>;
		name: ReduxForm.Field<string>;
		recurring: ReduxForm.Field<boolean>;
		startingOn: ReduxForm.Field<Date>;
		recurrencePeriod: ReduxForm.Field<RecurrencePeriod>;
		recurrenceMultiple: ReduxForm.Field<number>;
		rrule: ReduxForm.Field<string>;
		amount: ReduxForm.Field<string>;

		// index signature to make typescript happy
		[field: string]: ReduxForm.FieldOpt;
	}
}

const FORM_NAME = "budget";

function valueOf<T>(x: ReduxForm.Field<any>) { return x.value || x.defaultValue; } 

function calculateNextOccurrence(budget: Budget): Date {
	return new Date();
}

export const calculateBudgets = createSelector(
  (state: AppState) => state.budgets,
	(budgets: BudgetCollection) => {
		let budgets2 = _.map(budgets, (budget) => ({budget, nextOccurrence: calculateNextOccurrence(budget)} as Budget2));
		return budgets2;
	}
);

function validate(values: any, props: Props): Object {
	const errors: any = { accounts: [] as any[] };

	let checkNonempty = (key: string) => {
		if (!values[key]) {
			errors[key] = t("accountDialog.validate.nonempty");
			return;
		}
	};
	
	let checkUnique = (key: string) => {
		const value = values[key];
		if (_.any(props.budgets2, (budget: Budget2) => (budget.budget as any)[key] === value)) {
			errors[key] = t("accountDialog.validate.unique");
		}
	}

	checkNonempty("name");
	checkNonempty("recurrenceMultiple");
	checkUnique("name");

	return errors;
}


function currentDate(): Date {
	let date = new Date();
	date.setHours(0, 0, 0, 0);
	return date;
}

@reduxForm.reduxForm(
	{
		form: FORM_NAME,
		fields: [
			"name",
			"recurring",
			"recurrencePeriod",
			"recurrenceMultiple",
			"startingOn",
			"account",
			"amount"
		],
		initialValues: {
			startingOn: currentDate(),
			recurring: 1,
			recurrencePeriod: RecurrencePeriod.MONTH,
			recurrenceMultiple: 1
		},
		validate
	},
	(state: AppState) => ({budgets2: calculateBudgets(state), updraft: state.updraft}),
	(dispatch: Redux.Dispatch<any>) => bindActionCreators({
		updraftAdd,
		change: reduxForm.change
	}, dispatch)
)
export class BudgetPage extends Component<Props> {
	render() {
		const { budgets2, fields, handleSubmit } = this.props;

		const wrapErrorHelper = (props: any, error: string) => {
			if (error) {
				props.bsStyle = "error";
				props.help = error;
			}
			props.hasFeedback = true;
		};

		const wrapError = (field: ReduxForm.Field<any>, supressEmptyError?: boolean) => {
			let props: any = _.extend({}, field);
			let error: string = null;
			const isEmpty = (field.value === undefined || field.value == "")
			if (field.error && field.touched && (!supressEmptyError || !isEmpty)) {
				error = field.error;
			}
			wrapErrorHelper(props, error);
			return props;
		};
		
		const recurring = valueOf(fields.recurring) != "0";

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
					{_.map(budgets2, (budget: Budget2) =>
						<tr key={budget.budget.dbid}>
							<td><XText onChange={(value: any) => this.editBudget(budget, "name", value)} value={budget.budget.name}/></td>
							<td>{budget.budget.account}</td>
							<td>
								<Button type="button" bsStyle="danger" onClick={() => this.deleteBudget(budget)}><Icon name="trash-o"/></Button>
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
							<div className="form-inline">
								<DatePicker
									{...fields.startingOn}
								/>
								{" "}
								<Input type="select" {...fields.recurring}>
									<option value="0">---once</option>
									<option value="1">---repeat every</option>
								</Input>
								{" "}
								{recurring &&
									<Input
										style={{width:100}}
										type="number"
										min={1}
										{...wrapError(fields.recurrenceMultiple)}
									/>
								}
								{" "}
								{recurring &&
									<EnumSelect {...fields.recurrencePeriod} enum={RecurrencePeriod}/>
								}
							</div>
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
		const { fields } = this.props;
		let budget: Budget = {
			dbid,
			name: valueOf(fields.name),
			account: 0, //TODO: fields.account.value,
			//amount: 
		};
		
		if (valueOf(fields.recurring) != "0") {
			// let rule = new RRule({
			// 	freq: RRule.WEEKLY,
			// })
			// budget.rrule = fields.
		}
		
		return budget;
	}

	@autobind
	onAddBudget() {
		const { updraft, updraftAdd, resetForm } = this.props;

		const dbid = Date.now();
		const budget = this.makeBudget(dbid);
		
		updraftAdd(updraft, Updraft.makeSave(updraft.budgetTable, Date.now())(budget));
		resetForm();
	}

	@autobind
	editBudget(budget: Budget2, key: string, value: any) {
		const { updraft, updraftAdd } = this.props;

		let change: BudgetChange = { dbid: budget.budget.dbid };
		(change as any)[key] = { $set: value } as Updraft.Mutate.setter<any>;

		updraftAdd(updraft, Updraft.makeChange(updraft.budgetTable, Date.now())(change));
	}
	
	@autobind
	deleteBudget(budget: Budget2) {
		const { updraft, updraftAdd } = this.props;
		updraftAdd(updraft, Updraft.makeDelete(updraft.budgetTable, Date.now())(budget.budget.dbid));
	}
}
