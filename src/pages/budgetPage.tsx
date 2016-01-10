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

import { Budget, BudgetChange } from "../types";
import { t, bindActionCreators, updraftAdd, updatePath } from "../actions";
import { Component, AccountSelect, DatePicker, EnumSelect, XText } from "../components";
import { AppState, UpdraftState, BudgetCollection } from "../state";


enum Frequency {
	YEAR,
	MONTH,
	WEEK,
	DAY,
}

module Frequency {
	export function parse(idx: string): Frequency { return (Frequency as any)[idx]; }
	export function tr(name: string): string { return t("Frequency." + name); }
	export function toRRuleFreq(value: Frequency): __RRule.Frequency {
		switch (value) {
			case Frequency.YEAR: return RRule.YEARLY;
			case Frequency.MONTH: return RRule.MONTHLY;
			case Frequency.WEEK: return RRule.WEEKLY;
			case Frequency.DAY: return RRule.DAILY;
			default:
				throw new Error("invalid Frequency value");
		}
	}
}

interface Budget2 {
	budget: Budget;
	rrule: __RRule.RRule;
	next: Date;
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
		frequency: ReduxForm.Field<Frequency>;
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

export const calculateBudget2s = createSelector(
  (state: AppState) => state.budgets,
	(budgets: BudgetCollection) => {
		let now = currentDate();
		return _.chain(budgets)
		.map((budget: Budget) => {
			let rrule = new RRule(budget.rruleOpts);
			return {
				budget,
				rrule,
				next: rrule.after(now, true)
			} as Budget2;
		})
		.sortBy((budget: Budget2) => budget.next)
		.value();
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
			"frequency",
			"recurrenceMultiple",
			"startingOn",
			"account",
			"amount"
		],
		initialValues: {
			startingOn: currentDate(),
			recurring: 1,
			frequency: Frequency.MONTH,
			recurrenceMultiple: 1
		},
		validate
	},
	(state: AppState) => ({budgets2: calculateBudget2s(state), updraft: state.updraft}),
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
							<td>{budget.next.toString()}</td>
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
									<option value="0">{t("BudgetPage.once")}</option>
									<option value="1">{t("BudgetPage.repeatEvery")}</option>
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
									<EnumSelect {...fields.frequency} enum={Frequency}/>
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
		};
		
		if (valueOf(fields.recurring) != "0") {
			budget.rruleOpts = {
				freq: Frequency.toRRuleFreq(valueOf(fields.frequency)),
				dtstart: valueOf(fields.startingOn),
			};
		}
		else {
			budget.rruleOpts = {
				freq: RRule.MONTHLY,
				dtstart: valueOf(fields.startingOn),
				count: 1
			};
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
