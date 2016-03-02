///<reference path="../project.d.ts"/>

import { autobind } from "core-decorators";
import * as moment from "moment";
require("moment-range");
import * as React from "react";
import { connect } from "react-redux";
import { Button, Row, Col, ListGroup, ListGroupItem } from "react-bootstrap";
import * as Icon from "react-fa";
import * as reduxForm from "redux-form";
import { createSelector } from "reselect";
import { RRule } from "rrule";
import { Line as LineChart } from "react-chartjs";

import { Account, Bill, BillChange } from "../types";
import { bindActionCreators, updraftAdd } from "../actions";
import { AddScheduleDialog } from "../dialogs";
import { AppState, UpdraftState, BillCollection, AccountCollection } from "../state";
import { formatCurrency, formatDate, t } from "../i18n";
//import { DateIcon } from "../components";

// TODO: refresh on day change

interface DataPoint {
  date: Date;
  change: number;
  value: number;
  description: string;
}

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
  chartData?: LinearChartData;
}

interface State {
  add?: boolean;
  editing?: number;
}

const calculateEntries = createSelector(
  (state: AppState) => state.bills,
  (bills: BillCollection) => {
    let now = currentDate();
    return _(bills)
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

interface BillOccurance {
  amount: number;
  date: Date;
}

const calculateDataset = createSelector(
  (state: AppState) => state.accounts,
  (state: AppState) => state.bills,
  (accounts: AccountCollection, bills: BillCollection): LinearChartData => {
    let start = currentDate();
    let end = moment(start).add(1, "Y").subtract(1, "d").toDate();
    //let end = moment(start).add(2, "M").subtract(1, "d").toDate();

    let nextOccurrances = _.mapValues(accounts, acct => 0);
    let accountData = _.mapValues(accounts, acct => [] as number[]);
    let accountBalances = _.mapValues(accounts, acct => acct.balance);
    let occurrancesByAccount = _(accounts)
    .mapValues((account: Account, accountId: any): BillOccurance[] => {
      return _(bills)
      .filter((bill: Bill) => bill.account == accountId)
      .map((bill: Bill): BillOccurance[] => {
        let rrule = RRule.fromString(bill.rruleString);
        let occurrances = rrule.between(start, end, true);
        return _.map(occurrances, (date: Date): BillOccurance => ({
          amount: bill.amount,
          date
        }));
      })
      .flatten<BillOccurance>()
      .sortBy((occurrance: BillOccurance) => occurrance.date)
      .value();
    })
    .value();

    let labels: string[] = [];
    let lastMonth = -1;
    moment
    .range(start, end)
    .by(
      "days",
      (currentDate: moment.Moment) => {
        if (lastMonth != currentDate.month()) {
          lastMonth = currentDate.month();
          labels.push(currentDate.format("MMMM"));
        }
        else {
          labels.push("");
        }

        _.forEach(accounts, (account: Account, accountId: any) => {
          let occurrences = occurrancesByAccount[accountId];
          let accountBalance = accountBalances[accountId];
          let occurrence: BillOccurance;
          while (
            (occurrence = occurrences[nextOccurrances[accountId]])
            && currentDate.isSame(occurrence.date, "day")
          ) {
            accountBalance += occurrence.amount;
            nextOccurrances[accountId]++;
          }
          accountData[accountId].push(accountBalance);
          accountBalances[accountId] = accountBalance;
        });
      },
      false
    );

    let chartData: LinearChartData = {
      labels,
      datasets: _(accounts)
      .map((account: Account, accountId: number): ChartDataSet => {
        let dataSet: ChartDataSet = {
          label: account.name,
          fillColor: "pink",
          strokeColor: "red",
          data: accountData[accountId]
        };
        return dataSet;
      })
      .value()
    };

    return chartData;
  }
);


function currentDate(): Date {
  let date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}


function insertNewlines(str: string): any {
  if (!str) {
    return str;
  }

  return str.split("\n").map((x: string, index: number) => <span key={index}>{x}<br/></span>);
}



@connect(
  (state: AppState) => ({
    accounts: state.accounts,
    updraft: state.updraft,
    nextBills: calculateEntries(state),
    chartData: calculateDataset(state)
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
            <Row>
              <Col xs={3} className="text-right">
                {formatDate(date)}
                <br/>
                <small className="text-muted">{next.rrule.toText()}</small>
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
      <LineChart width={500} height={500} data={this.props.chartData} options={{legendTemplate: "legend"}}/>
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
