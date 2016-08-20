///<reference path="../project.d.ts"/>

import { autobind } from "core-decorators";
import * as React from "react";
import { Button, FormGroup, FormControl, ControlLabel, HelpBlock, Modal, Row, Col } from "react-bootstrap";
import * as ReactDOM from "react-dom";
import { connect } from "react-redux";
import * as Icon from "react-fa";
import { verify } from "updraft";

import { EnumSelect, CurrencyInput, AccountSelect, DatePicker } from "../components";
import { today } from "../actions";
import { ValidateHelper, ReForm, rruleFixEndOfMonth } from "../util";
import { Bill, BillDelta, Frequency, RRule } from "../types";
import { AppState, BillCollection, t } from "../state";

enum Recurrance {
  Once,
  Repeat
}


interface Props {
  bills?: BillCollection;

  negative?: boolean;
  editBillId?: number; // dbid of bill
  show?: boolean;
  onCancel?: Function;
  onSave?: (account: Bill) => any;
  onEdit?: (change: BillDelta) => any;
  onDelete?: Function;
}


interface State extends ReForm.State {
  fields?: {
    account: ReForm.Field<number>;
    name: ReForm.Field<string>;
    recurring: ReForm.Field<Recurrance>;
    startingOn: ReForm.Field<Date>;
    frequency: ReForm.Field<Frequency>;
    recurrenceMultiple: ReForm.Field<number>;
    rrule: ReForm.Field<string>;
    amount: ReForm.Field<number>;
    notes: ReForm.Field<string>;

    // index signature to make typescript happy
    [field: string]: ReForm.Field<any>;
  };
}


@connect(
  (state: AppState) => ({bills: state.bills} as Props)
)
@ReForm({
  defaultValues: {
    name: "",
    recurring: Recurrance.Repeat,
    frequency: Frequency.MONTH,
    recurrenceMultiple: 1,
    startingOn: today(),
    account: "",
    amount: "",
    notes: ""
  },
})
export class ScheduleEditDialog extends React.Component<Props, State> implements ReForm.Component {
  reForm: ReForm.Interface;

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.editBillId != nextProps.editBillId) {
      if (nextProps.editBillId) {
        verify(nextProps.editBillId in nextProps.bills, "invalid dbid");
        const src = nextProps.bills[nextProps.editBillId];
        const rrule = RRule.fromString(src.rruleString);
        const values = _.assign({}, src, {
          amount: (nextProps.negative ? -1 : 1) *  src.amount,
          recurring: (rrule.options.count != 1) ? Recurrance.Repeat : Recurrance.Once,
          recurrenceMultiple: rrule.options.interval,
          frequency: Frequency.fromRRuleFreq(rrule.options.freq),
          startingOn: rrule.options.dtstart,
        });
        this.reForm.setValues(values);
      }
      else {
        this.reForm.reset();
      }
    }
    else {
      this.reForm.reset();
    }
  }

  validate(values: ReForm.Values): ReForm.Errors {
    const errors: any = { accounts: [] as any[] };
    let v = new ValidateHelper(values, errors);

    v.checkNonempty("name");
    v.checkNonempty("recurrenceMultiple");
    v.checkNumber("amount");

    return errors;
  }

  @autobind
  setInitialFocus() {
    ReactDOM.findDOMNode<HTMLInputElement>(this.refs["name"]).focus();
  }

  render() {
    const { fields, submitFailed } = this.state;
    const { handleSubmit } = this.reForm;

    const validationState = (field: ReForm.Field<any>): Object => {
      if (field.error && submitFailed) {
        return { validationState: "error" };
      }
    };

    const validationHelpText = (field: ReForm.Field<any>): string => {
      if (field.error && submitFailed) {
        return field.error;
      }
    };

    const adding = !this.props.editBillId;
    const recurring = fields.recurring.value == Recurrance.Repeat;
    const bill = this.props.negative;

    const title = bill ? (adding ? t("ScheduleEditDialog.addExpenseTitle") : t("ScheduleEditDialog.editExpenseTitle"))
                       : (adding ? t("ScheduleEditDialog.addIncomeTitle") : t("ScheduleEditDialog.editIncomeTitle"));

    return (
      <Modal show={this.props.show} onEnter={this.setInitialFocus} onHide={this.onCancel}>
        <form onSubmit={handleSubmit(this.onSave)}>
          <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup controlId="name" {...validationState(fields.name)}>
              <ControlLabel>{t("ScheduleEditDialog.nameLabel")}</ControlLabel>
              <FormControl
                type="text"
                ref="name"
                {...fields.name}
              />
              <FormControl.Feedback/>
              <HelpBlock>{validationHelpText(fields.name)}</HelpBlock>
            </FormGroup>
            <FormGroup controlId="name" {...validationState(fields.amount)}>
              <ControlLabel>{t("ScheduleEditDialog.amountLabel")}</ControlLabel>
              <CurrencyInput {...fields.amount as any} min="0"/>
              <HelpBlock>{validationHelpText(fields.amount)}</HelpBlock>
            </FormGroup>
            <FormGroup controlId="notes"  {...validationState(fields.recurring)}>
              <ControlLabel>{t("ScheduleEditDialog.recurLabel")}</ControlLabel>
              <Row>
                <Col xs={4}>
                  <DatePicker
                    {...fields.startingOn}
                  />
                </Col>
                <Col xs={3}>
                  <FormControl componentClass="select" {...fields.recurring as any}>
                    <option value="0">{t("ScheduleEditDialog.once")}</option>
                    <option value="1">{t("ScheduleEditDialog.repeatEvery")}</option>
                  </FormControl>
                </Col>
                {recurring &&
                  <Col xs={2}>
                    <FormGroup componentId="recurrenceMultiple"  {...validationState(fields.recurrenceMultiple)}>
                      <FormControl
                        style={{width:100}}
                        type="number"
                        min={1}
                        {...fields.recurrenceMultiple as any}
                      />
                      <FormControl.Feedback/>
                      <HelpBlock>{validationHelpText(fields.recurrenceMultiple)}</HelpBlock>
                    </FormGroup>
                  </Col>
                }
                {recurring &&
                  <Col xs={3}>
                    <FormGroup componentId="frequency" {...validationState(fields.frequency)}>
                      <EnumSelect {...fields.frequency as any} enum={Frequency}/>
                    </FormGroup>
                  </Col>
                }
              </Row>
            </FormGroup>
            <FormGroup controlId="account" {...validationState(fields.account)}>
              <ControlLabel>{t("ScheduleEditDialog.accountLabel")}</ControlLabel>
              <AccountSelect {...fields.account as any}/>
            </FormGroup>
            <FormGroup controlId="notes" {...validationState(fields.notes)}>
              <ControlLabel>{t("ScheduleEditDialog.notesLabel")}</ControlLabel>
              <FormControl
                componentClass="textarea"
                rows={4}
                {...fields.notes}
              />
              <FormControl.Feedback/>
              <HelpBlock>{validationHelpText(fields.notes)}</HelpBlock>
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            {this.props.editBillId &&
              <Button onClick={this.onDelete} bsStyle="danger" className="pull-left">{t("ScheduleEditDialog.delete")}</Button>
            }
            {__DEVELOPMENT__ &&
              <Button onClick={this.onRandom}><Icon name="random"/> random</Button>
            }
            <Button onClick={this.onCancel}>{t("ScheduleEditDialog.cancel")}</Button>
            <Button
              bsStyle="primary"
              type="submit"
            >
              {adding ? t("ScheduleEditDialog.add") : t("ScheduleEditDialog.save")}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  }

  makeBill(props: Props, state: State): Bill {
    const { fields } = state;
    const { editBillId, negative } = props;
    const dbid = editBillId || Date.now();
    let bill: Bill = {
      dbid,
      name: fields.name.value,
      account: fields.account.value,
      amount: (negative ? -1 : 1) * fields.amount.value,
      notes: fields.notes.value
    };

    if (fields.recurring.value == Recurrance.Repeat) {
      let opts: __RRule.Options = {
        freq: Frequency.toRRuleFreq(fields.frequency.value * 1),
        dtstart: fields.startingOn.value,
        interval: fields.recurrenceMultiple.value
      };
      rruleFixEndOfMonth(opts);
      bill.rruleString = new RRule(opts).toString();
    }
    else {
      bill.rruleString = new RRule({
        freq: RRule.MONTHLY,
        dtstart: fields.startingOn.value,
        count: 1
      }).toString();
    }

    return bill;
  }

  @autobind
  onSave() {
    const { onSave, onEdit, editBillId } = this.props;
    const bill = this.makeBill(this.props, this.state);
    if (!editBillId) {
      onSave(bill);
    }
    else {
      verify(editBillId in this.props.bills, "invalid dbid");
      const src = this.props.bills[editBillId];
      let change: BillDelta = { dbid: src.dbid };
      _.forEach(bill, (value: any, key: string) => {
        if (value != (src as any)[key]) {
          (change as any)[key] = { $set: value } as Updraft.Delta.setter<any>;
        }
      });
      onEdit(change);
    }
  }

  @autobind
  onRandom() {
    if (__DEVELOPMENT__) {
      const faker: Faker.FakerStatic = require("faker");
      const recurring = Math.random() < 0.5;
      let frequency: Frequency = Frequency.MONTH;
      let recurrenceMultiple = _.random(1, 3);
      if (Math.random() < 0.2) {
        frequency = Frequency.YEAR;
        recurrenceMultiple = 1;
      } else if (Math.random() < 0.2) {
        frequency = Frequency.WEEK;
        recurrenceMultiple = _.random(1, 4);
      }
      this.reForm.setValues({
        name: faker.company.companyName(),
        amount: faker.finance.amount(1, 500),
        startingOn: faker.date.future(),
        recurring,
        frequency,
        recurrenceMultiple,
        notes: faker.lorem.sentences(_.random(1, 3))
      });
    }
  }

  @autobind
  onDelete() {
    this.props.onDelete(this.props.editBillId);
  }

  @autobind
  onCancel() {
    this.props.onCancel();
  }
}
