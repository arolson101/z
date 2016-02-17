///<reference path="../project.d.ts"/>
"use strict";

import { autobind } from "core-decorators";
import * as React from "react";
import {Alert, Panel, Button, Grid, Input, Label, Modal, OverlayTrigger, Row, Col, Table, Tooltip} from "react-bootstrap";
import * as Icon from "react-fa";
import { verify } from "updraft";
import * as reduxForm from "redux-form";

import { Component, ImageCheckbox, EnumSelect, CurrencyInput, AccountSelect, DatePicker } from "../components";
import { ValidateHelper, valueOf } from "../util";
import { Budget, BudgetChange, Frequency, RRule } from "../types";
import { AppState, BudgetCollection, t } from "../state";

enum Recurrance {
	Once,
	Repeat
}


interface Props extends ReduxForm.Props, React.Props<any> {
	fields?: {
		account: ReduxForm.Field<number>;
		name: ReduxForm.Field<string>;
		recurring: ReduxForm.Field<Recurrance>;
		startingOn: ReduxForm.Field<Date>;
		frequency: ReduxForm.Field<Frequency>;
		recurrenceMultiple: ReduxForm.Field<number>;
		rrule: ReduxForm.Field<string>;
		amount: ReduxForm.Field<number>;

		// index signature to make typescript happy
		[field: string]: ReduxForm.FieldOpt;
	}
	
	budgets?: BudgetCollection;

	editing: number; // dbid of budget
	show: boolean;
	onCancel: Function;
	onSave: (account: Budget) => any;
	onEdit: (change: BudgetChange) => any;
	onDelete: Function;
}


function currentDate(): Date {
	let date = new Date();
	date.setHours(0, 0, 0, 0);
	return date;
}


function validate(values: any, props: Props): Object {
	const errors: any = { accounts: [] as any[] };
	let v = new ValidateHelper(values, errors);

	v.checkNonempty("name");
	v.checkNonempty("recurrenceMultiple");
	v.checkNumber("amount");

	return errors;
}


@reduxForm.reduxForm(
	{
		form: "addBudget",
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
			recurring: Recurrance.Repeat,
			frequency: Frequency.MONTH,
			recurrenceMultiple: 1
		},
		validate
	},
	(state: AppState) => ({budgets: state.budgets})
)
export class AddBudgetDialog extends Component<Props> {
	componentWillReceiveProps(nextProps: Props) {
		if (this.props.editing != nextProps.editing) {
			if (nextProps.editing != -1) {
				verify(nextProps.editing in nextProps.budgets, "invalid dbid");
				const src = nextProps.budgets[nextProps.editing];
				const { fields } = nextProps;
				if (src.name != valueOf(fields.name)) {
					fields.name.onChange(src.name);
				}
				const rrule = RRule.fromString(src.rruleString);
				const recurring = (rrule.options.count != 1); 
				if (recurring != (valueOf(fields.recurring) == Recurrance.Repeat)) {
					fields.recurring.onChange(recurring ? Recurrance.Repeat : Recurrance.Once);
				}
				if (rrule.options.interval != valueOf(fields.recurrenceMultiple)) {
					fields.recurrenceMultiple.onChange(rrule.options.interval);
				}
				const frequency = Frequency.fromRRuleFreq(rrule.options.freq);
				if (frequency != valueOf(fields.frequency)) {
					fields.frequency.onChange(frequency);
				}
				const startingOn = rrule.options.dtstart;
				if (startingOn != valueOf(fields.startingOn)) {
					fields.startingOn.onChange(startingOn);
				}
				if (src.amount != valueOf(fields.amount)) {
					fields.amount.onChange(src.amount);
				}
				if (src.account != valueOf(fields.account)) {
					fields.account.onChange(src.account);
				}
			}
		}
	}

	render() {
		const { fields, handleSubmit } = this.props;

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

		const adding = this.props.editing == -1;
		const recurring = valueOf(fields.recurring) == Recurrance.Repeat;

		return (
			<Modal show={this.props.show} onHide={this.onCancel}>
				<form onSubmit={handleSubmit(this.onSave)}>
					<Modal.Header closeButton>
						<Modal.Title>{adding ? t("AddBudgetDialog.addTitle") : t("AddBudgetDialog.editTitle")}</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Input
							type="text"
							label={t("AddBudgetDialog.nameLabel")}
							placeholder={t("AddBudgetDialog.namePlaceholder")}
							{...wrapError(fields.name)}
						/>
						<CurrencyInput
							label={t("AddBudgetDialog.amountLabel")}
							placeholder={t("AddBudgetDialog.amountPlaceholder") }
							{...wrapError(fields.amount) } />
						<Input label={t("AddBudgetDialog.recurLabel")}>
							<Row>
								<Col xs={4}>
									<DatePicker
										{...fields.startingOn}
									/>
								</Col>
								<Col xs={3}>
									<Input type="select" {...fields.recurring}>
										<option value="0">{t("AddBudgetDialog.once")}</option>
										<option value="1">{t("AddBudgetDialog.repeatEvery")}</option>
									</Input>
								</Col>
								{recurring &&
									<Col xs={2}>
										<Input
											style={{width:100}}
											type="number"
											min={1}
											{...wrapError(fields.recurrenceMultiple)}
										/>
									</Col>
								}
								{recurring &&
									<Col xs={3}>
										<EnumSelect {...fields.frequency} enum={Frequency}/>
									</Col>
								}
							</Row>
						</Input>
						<AccountSelect label={t("AddBudgetDialog.accountLabel")} {...fields.account}/>
					</Modal.Body>
					<Modal.Footer>
						<Button onClick={this.onCancel}>{t("AddBudgetDialog.cancel")}</Button>
						{this.props.editing != -1 &&
							<Button onClick={this.onDelete} bsStyle="danger">{t("AddBudgetDialog.delete")}</Button>
						}
						<Button
							bsStyle="primary"
							type="submit"
						>
							{adding ? t("AddBudgetDialog.add") : t("AddBudgetDialog.save")}
						</Button>
					</Modal.Footer>
				</form>
			</Modal>
		);
	}

	makeBudget(props: Props): Budget {
		const { fields, editing } = props;
		const dbid = (editing == -1) ? Date.now() : editing;
		let budget: Budget = {
			dbid,
			name: valueOf(fields.name),
			account: valueOf(fields.account),
			amount: valueOf(fields.amount)
		};

		if (valueOf(fields.recurring) == Recurrance.Repeat) {
			budget.rruleString = new RRule({
				freq: Frequency.toRRuleFreq(valueOf(fields.frequency) * 1),
				dtstart: valueOf(fields.startingOn),
				interval: valueOf(fields.recurrenceMultiple)
			}).toString();
		}
		else {
			budget.rruleString = new RRule({
				freq: RRule.MONTHLY,
				dtstart: valueOf(fields.startingOn),
				count: 1
			}).toString();
		}

		return budget;
	}

	@autobind
	onSave() {
		const { fields, resetForm, onSave, onEdit, editing } = this.props;
		const budget = this.makeBudget(this.props);
		if (editing == -1) {
			onSave(budget);
		}
		else {
			verify(editing in this.props.budgets, "invalid dbid");
			const src = this.props.budgets[editing];
			let change: BudgetChange = { dbid: src.dbid };
			_.forEach(budget, (value: any, key: string) => {
				if (value != (src as any)[key]) {
					(change as any)[key] = { $set: value } as Updraft.Mutate.setter<any>;
				}
			});
			onEdit(change);
		}
		resetForm();
	}
	
	@autobind
	onDelete() {
		const { onDelete, resetForm } = this.props;
		resetForm();
		onDelete(this.props.editing);
	}

	@autobind
	onCancel() {
		const { resetForm, onCancel } = this.props;
		resetForm();
		onCancel();
	}
}
