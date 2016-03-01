///<reference path="../project.d.ts"/>

import { autobind } from "core-decorators";
import * as React from "react";
import { connect } from "react-redux";
import { Button, Row, Col, ListGroup, ListGroupItem, Panel } from "react-bootstrap";
import * as Icon from "react-fa";
import * as reduxForm from "redux-form";
import { createSelector } from "reselect";
import { RRule } from "rrule";

import { Bill, BillChange } from "../types";
import { bindActionCreators, updraftAdd } from "../actions";
import { AddScheduleDialog } from "../dialogs";
import { AppState, UpdraftState, BillCollection, AccountCollection } from "../state";
import { formatCurrency, formatDate, t } from "../i18n";
import { DateIcon } from "../components";

// TODO: refresh on day change

interface NextBill {
  bill: Bill;
  rrule: __RRule.RRule;
  next: Date;
  last: Date;
}

interface Props extends React.Props<any> {
  nextBills: NextBill[];
  accounts: AccountCollection;
  updraft: UpdraftState;
  updraftAdd?: (state: UpdraftState, ...changes: Updraft.TableChange<any, any>[]) => Promise<any>;
  change?: (form: string, field: string, value: any) => any;
}

interface State {
  add?: boolean;
  editing?: number;
}

export const calculateEntries = createSelector(
  (state: AppState) => state.bills,
  (bills: BillCollection) => {
    let now = currentDate();
    return _.chain(bills)
    .map((bill: Bill) => {
      let rrule = RRule.fromString(bill.rruleString);
      return {
        bill,
        rrule,
        next: rrule.after(now, true),
        last: rrule.before(now, false)
      } as NextBill;
    })
    .sortBy((bill: NextBill) => bill.next || bill.last)
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
    nextBills: calculateEntries(state),
    updraft: state.updraft
  } as Props),
  (dispatch: Redux.Dispatch<any>) => bindActionCreators(
    {
      updraftAdd,
      change: reduxForm.change
    },
    dispatch)
)
export class SchedulePage extends React.Component<Props, State> {
  state = {
    add: false,
    editing: -1
  };

  render() {
    return <div> 
      <ListGroup>
        {_.map(this.props.nextBills, (next: NextBill, index: number) => {
          const account = this.props.accounts[next.bill.account];
          const income: boolean = next.bill.amount > 0;
          const date = next.next || next.last;
          return <ListGroupItem key={next.bill.dbid}>
            <Row >
              <Col xs={1}><span style={{color: income ? "darkgreen": "darkred"}}>{formatDate(date)}</span></Col>
              <Col xs={2}>{formatCurrency(next.bill.amount)}</Col>
              <Col xs={1}>{next.bill.name}</Col>
              <Col xs={1}>{account ? account.name : t("SchedulePage.noAccount")}</Col>
              <Col xs={1}>
                <Button
                  type="button"
                  bsStyle="link"
                  onClick={() => this.onEditBill(next.bill.dbid)}
                >
                  <Icon name="edit"/>
                </Button>
              </Col>
            </Row>
          </ListGroupItem>;
        })}
      </ListGroup>
      <AddScheduleDialog
        show={this.state.add || this.state.editing != -1}
        editing={this.state.editing}
        onSave={this.onBillSave}
        onEdit={this.onBillEdit}
        onCancel={this.onModalHide}
        onDelete={this.onDelete}
      />
      <Button onClick={this.onAddBill}>
        <Icon name="calendar-plus-o"/>
        {t(" ")}
        {t("SchedulePage.add")}
      </Button>
    </div>;
  }

  @autobind
  onAddBill() {
    this.setState({add: true});
  }

  @autobind
  onEditBill(dbid: number) {
    this.setState({ editing: dbid });
  }

  @autobind
  onModalHide() {
    this.setState({ add: false, editing: -1 });
  }

  @autobind
  onBillSave(bill: Bill) {
    const { updraft, updraftAdd } = this.props;
    updraftAdd(updraft, Updraft.makeSave(updraft.billTable, Date.now())(bill));
    this.onModalHide();
  }

  @autobind
  onBillEdit(change: BillChange) {
    const { updraft, updraftAdd } = this.props;
    updraftAdd(updraft, Updraft.makeChange(updraft.billTable, Date.now())(change));
    this.onModalHide();
  }

  @autobind
  onDelete(dbid: number) {
    const { updraft, updraftAdd } = this.props;
    updraftAdd(updraft, Updraft.makeDelete(updraft.billTable, Date.now())(dbid));
    this.onModalHide();
  }
}
