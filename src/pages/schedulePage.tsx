///<reference path="../project.d.ts"/>

import { autobind } from "core-decorators";
import * as moment from "moment";
require("moment-range");
import * as React from "react";
import { connect } from "react-redux";
import { Button, Row, Col, ListGroup, ListGroupItem } from "react-bootstrap";
import * as Icon from "react-fa";
import { createSelector } from "reselect";
import { RRule } from "rrule";

import { Account, Bill, BillChange, NextBill, makeNextBill } from "../types";
import { colorHash } from "../util";
import { bindActionCreators, Dispatch, updraftAdd } from "../actions";
import { ScheduleEditDialog } from "../dialogs";
import { AppState, UpdraftState, BillCollection, AccountCollection } from "../state";
import { formatCurrency, formatDate, t } from "../i18n";
import { CurrencyChart, CurrencyChartDataset, CurrencyChartPoint } from "../components";
//import { DateIcon } from "../components";



interface Props {
  nextBills: NextBill[];
  accounts: AccountCollection;
  updraft: UpdraftState;
  updraftAdd?: (state: UpdraftState, ...changes: Updraft.TableChange<any, any>[]) => Promise<any>;
  chartData?: CurrencyChartDataset[];
  today?: Date;
}

interface State {
  dialogShow?: boolean;
  dialogEditBillId?: number;
}


const calculateEntries = createSelector(
  (state: AppState) => state.bills,
  (state: AppState) => state.today,
  (bills: BillCollection, today: Date) => {
    return _(bills)
    .map((bill: Bill) => makeNextBill(bill, today))
    .sortBy((bill: NextBill) => bill.next || bill.last)
    .value();
  }
);

interface BillOccurrence {
  amount: number;
  date: Date;
}

const calculateDataset = createSelector(
  (state: AppState) => state.accounts,
  (state: AppState) => state.bills,
  (state: AppState) => state.today,
  (accounts: AccountCollection, bills: BillCollection, today: Date): CurrencyChartDataset[] => {
    let start = today;
    let end = moment(start).add(1, "Y").toDate();

    let occurrencesByAccount = _(accounts)
    .mapValues((account: Account, accountId: any): BillOccurrence[] => {
      return _(bills)
      .filter((bill: Bill) => bill.account == accountId)
      .map((bill: Bill): BillOccurrence[] => {
        let rrule = RRule.fromString(bill.rruleString);
        let occurrences = rrule.between(start, end, true);
        return _.map(occurrences, (date: Date): BillOccurrence => ({
          amount: bill.amount,
          date
        }));
      })
      .flatten<BillOccurrence>()
      .sortBy((occurrence: BillOccurrence) => occurrence.date)
      .value();
    })
    .value();

    let accountData = _.mapValues(occurrencesByAccount, (occurrences: BillOccurrence[], accountId: any) => {
      let balance = accounts[accountId].balance;
      let data: CurrencyChartPoint[] = [{
        date: start,
        value: balance
      }];
      let lastDate = start;
      let lastIndex = 0;
      _.forEach(occurrences, (occurrence: BillOccurrence) => {
        if (occurrence.date.getTime() != lastDate.getTime()) {
          // data.push({
          //   x: occurrence.date,
          //   y: balance
          // });
          lastDate = occurrence.date;
          lastIndex = data.length;
          data.push({
            date: occurrence.date,
            value: balance
          });
        }
        balance += occurrence.amount;
        data[lastIndex].value = balance;
      });
      return data;
    });

    let chartData: CurrencyChartDataset[] = _(accounts)
    .map((account: Account, accountId: number): CurrencyChartDataset => {
      let dataSet: CurrencyChartDataset = {
        key: account.name,
        color: colorHash(account.dbid.toString()),
        values: accountData[accountId]
      };
      return dataSet;
    })
    .value();

    return chartData;
  }
);


function insertNewlines(str: string): any {
  if (!str) {
    return str;
  }

  return str.split("\n").map((x: string, index: number) => <span key={index}>{x}<br/></span>);
}



@connect(
  (state: AppState): Props => ({
    accounts: state.accounts,
    updraft: state.updraft,
    nextBills: calculateEntries(state),
    chartData: calculateDataset(state)
  }),
  (dispatch: Dispatch) => bindActionCreators(
    {
      updraftAdd
    },
    dispatch)
)
export class SchedulePage extends React.Component<Props, State> {
  state = {
    dialogShow: false,
    dialogEditBillId: -1
  };

  render() {
    return <div>
      <ListGroup>
        {_.map(this.props.nextBills, (next: NextBill, index: number) => {
          const account = this.props.accounts[next.bill.account];
          const income: boolean = next.bill.amount > 0;
          const date = next.next || next.last;
          return <ListGroupItem key={next.bill.dbid}>
            <Row>
              <Col xs={3} className="text-right">
                {formatDate(date)}
                <br/>
                <small className="text-muted">{next.rruleFixedText}</small>
              </Col>
              <Col xs={3}>
                <span style={{color: income ? "darkgreen" : "darkred"}}>{formatCurrency(next.bill.amount)}</span>
                <br/>
                <div className="text-muted">{account ? account.name : t("SchedulePage.noAccount")}</div>
              </Col>
              <Col xs={6}>
                <Button
                  className="pull-right"
                  type="button"
                  bsStyle="link"
                  onClick={() => this.onEditBill(next.bill.dbid)}
                >
                  <Icon name="edit"/>
                </Button>

                <div>{next.bill.name}</div>
                <small className="text-muted">{insertNewlines(next.bill.notes)}</small>
              </Col>
            </Row>
          </ListGroupItem>;
        })}
      </ListGroup>
      <ScheduleEditDialog
        show={this.state.dialogShow}
        editBillId={this.state.dialogEditBillId}
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
      <CurrencyChart height={400} datasets={this.props.chartData} />
    </div>;
  }

  @autobind
  onAddBill() {
    this.setState({dialogShow: true, dialogEditBillId: -1});
  }

  @autobind
  onEditBill(dbid: number) {
    this.setState({dialogShow: true, dialogEditBillId: dbid});
  }

  @autobind
  onModalHide() {
    this.setState({dialogShow: false});
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
