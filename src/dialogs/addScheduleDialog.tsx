///<reference path="../project.d.ts"/>

import { autobind } from "core-decorators";
import * as React from "react";
import { Button, FormGroup, FormControl, ControlLabel, HelpBlock, Modal, Row, Col } from "react-bootstrap";
import { connect } from "react-redux";
import * as Icon from "react-fa";
import { verify } from "updraft";

import { EnumSelect, CurrencyInput, AccountSelect, DatePicker } from "../components";
import { today } from "../actions";
import { ValidateHelper, ReForm, rruleFixEndOfMonth } from "../util";
import { Bill, BillChange, Frequency, RRule } from "../types";
import { AppState, BillCollection, t } from "../state";

enum Recurrance {
  Once,
  Repeat
}


interface Props {
  bills?: BillCollection;

  editing?: number; // dbid of bill
  show?: boolean;
  onCancel?: Function;
  onSave?: (account: Bill) => any;
  onEdit?: (change: BillChange) => any;
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
export class AddScheduleDialog extends React.Component<Props, State> implements ReForm.Component {
  reForm: ReForm.Interface;

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.editing != nextProps.editing) {
      if (nextProps.editing != -1) {
        verify(nextProps.editing in nextProps.bills, "invalid dbid");
        const src = nextProps.bills[nextProps.editing];
        const rrule = RRule.fromString(src.rruleString);
        const values = _.assign({}, src, {
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

    const adding = this.props.editing == -1;
    const recurring = fields.recurring.value == Recurrance.Repeat;

    return (
      <Modal show={this.props.show} onHide={this.onCancel}>
        <form onSubmit={handleSubmit(this.onSave)}>
          <Modal.Header closeButton>
            <Modal.Title>{adding ? t("AddBillDialog.addTitle") : t("AddBillDialog.editTitle")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup controlId="name" {...validationState(fields.name)}>
              <ControlLabel>{t("AddBillDialog.nameLabel")}</ControlLabel>
              <FormControl
                type="text"
                {...fields.name}
              />
              <FormControl.Feedback/>
              <HelpBlock>{validationHelpText(fields.name)}</HelpBlock>
            </FormGroup>
            <FormGroup controlId="name" {...validationState(fields.amount)}>
              <ControlLabel>{t("AddBillDialog.amountLabel")}</ControlLabel>
              <CurrencyInput {...fields.amount as any}/>
              <HelpBlock>{validationHelpText(fields.amount)}</HelpBlock>
            </FormGroup>
            <FormGroup controlId="notes"  {...validationState(fields.recurring)}>
              <ControlLabel>{t("AddBillDialog.recurLabel")}</ControlLabel>
              <Row>
                <Col xs={4}>
                  <DatePicker
                    {...fields.startingOn}
                  />
                </Col>
                <Col xs={3}>
                  <FormControl componentClass="select" {...fields.recurring as any}>
                    <option value="0">{t("AddBillDialog.once")}</option>
                    <option value="1">{t("AddBillDialog.repeatEvery")}</option>
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
              <ControlLabel>{t("AddBillDialog.accountLabel")}</ControlLabel>
              <AccountSelect {...fields.account as any}/>
            </FormGroup>
            <FormGroup controlId="notes" {...validationState(fields.notes)}>
              <ControlLabel>{t("AddBillDialog.notesLabel")}</ControlLabel>
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
            {this.props.editing != -1 &&
              <Button onClick={this.onDelete} bsStyle="danger" className="pull-left">{t("AddBillDialog.delete")}</Button>
            }
            {__DEVELOPMENT__ &&
              <Button onClick={this.onRandom}><Icon name="random"/> random</Button>
            }
            <Button onClick={this.onCancel}>{t("AddBillDialog.cancel")}</Button>
            <Button
              bsStyle="primary"
              type="submit"
            >
              {adding ? t("AddBillDialog.add") : t("AddBillDialog.save")}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  }

  makeBill(props: Props, state: State): Bill {
    const { fields } = state;
    const { editing } = props;
    const dbid = (editing == -1) ? Date.now() : editing;
    let bill: Bill = {
      dbid,
      name: fields.name.value,
      account: fields.account.value,
      amount: fields.amount.value,
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
    const { onSave, onEdit, editing } = this.props;
    const bill = this.makeBill(this.props, this.state);
    if (editing == -1) {
      onSave(bill);
    }
    else {
      verify(editing in this.props.bills, "invalid dbid");
      const src = this.props.bills[editing];
      let change: BillChange = { dbid: src.dbid };
      _.forEach(bill, (value: any, key: string) => {
        if (value != (src as any)[key]) {
          (change as any)[key] = { $set: value } as Updraft.Mutate.setter<any>;
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
        amount: faker.finance.amount(-500, 500),
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
    this.props.onDelete(this.props.editing);
  }

  @autobind
  onCancel() {
    this.props.onCancel();
  }
}
