///<reference path="../project.d.ts"/>

import { autobind } from "core-decorators";
import * as React from "react";
import { connect } from "react-redux";
import { Button, Row, Grid, Table } from "react-bootstrap";
import * as Icon from "react-fa";
import * as reduxForm from "redux-form";
import { createSelector } from "reselect";
import { RRule } from "rrule";

import { Bill, BillChange } from "../types";
import { bindActionCreators, updraftAdd } from "../actions";
import { AddScheduleDialog } from "../dialogs";
import { AppState, UpdraftState, BillCollection, AccountCollection } from "../state";
import { formatCurrency, formatDate, t } from "../i18n";

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
    return <Grid>
      <Row>bills</Row>
      <Table>
        <thead>
          <tr>
            <th>{t("SchedulePage.nameHeader")}</th>
            <th>{t("SchedulePage.amountHeader")}</th>
            <th>{t("SchedulePage.nextOccurrenceHeader")}</th>
            <th>{t("SchedulePage.accountHeader")}</th>
            <th>{t("SchedulePage.editHeader")}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {_.map(this.props.nextBills, (bill: NextBill, index: number) => {
            const account = this.props.accounts[bill.bill.account];
            return <tr key={bill.bill.dbid}>
              <td>{bill.bill.name}</td>
              <td>{formatCurrency(bill.bill.amount)}</td>
              <td>{formatDate(bill.next || bill.last)}</td>
              <td>{account ? account.name : t("SchedulePage.noAccount")}</td>
              <td>
                <Button
                  type="button"
                  bsStyle="link"
                  onClick={() => this.onEditBill(bill.bill.dbid)}
                >
                  <Icon name="edit"/>
                </Button>
              </td>
            </tr>;
          })}
        </tbody>
      </Table>
      <AddScheduleDialog
        show={this.state.add || this.state.editing != -1}
        editing={this.state.editing}
        onSave={this.onBillSave}
        onEdit={this.onBillEdit}
        onCancel={this.onModalHide}
        onDelete={this.onDelete}
      />
      <Button onClick={this.onAddBill}>{t("SchedulePage.add")}</Button>
    </Grid>;
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
