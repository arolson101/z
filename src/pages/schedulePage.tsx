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

import { Account, Bill, BillChange } from "../types";
import { bindActionCreators, updraftAdd } from "../actions";
import { AddScheduleDialog } from "../dialogs";
import { AppState, UpdraftState, BillCollection, AccountCollection } from "../state";
import { formatCurrency, formatDate, t } from "../i18n";
import { ScatterChart, ScatterChartData, ScatterChartDataSet, ScatterPoint } from "../components";
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
  rruleFixedText: string;
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
  chartData?: ScatterChartData;
}

interface State {
  add?: boolean;
  editing?: number;
}


function rruleFixText(rrule: RRule): string {
  // leave recurrence text as empty
  if (rrule.origOptions.count == 1) {
    return "";
  }

  // fix text string by removing the hack to get closest date so it appears 
  // "monthly" instead of "every month on the 28th, 29th, 30th and 31st" 
  const fixedOpts = _.extend({}, rrule.origOptions) as __RRule.Options;
  delete fixedOpts.bymonthday;
  delete fixedOpts.bysetpos;
  return (new RRule(fixedOpts)).toText();
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
        last: rrule.before(now, false),
        rruleFixedText: rruleFixText(rrule)
      } as NextBill;
    })
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
  (accounts: AccountCollection, bills: BillCollection): ScatterChartData => {
    let start = currentDate();
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
      let data = _.map(occurrences, (occurrence: BillOccurrence): ScatterPoint => {
        balance += occurrence.amount;
        return {
          x: occurrence.date,
          y: balance
        };
      });
      data.unshift({
        x: currentDate(),
        y: accounts[accountId].balance
      });
      return data;
    });

    let chartData: ScatterChartData = {
      labels: [],
      datasets: _(accounts)
      .map((account: Account, accountId: number): ScatterChartDataSet => {
        let dataSet: ScatterChartDataSet = {
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
      <ScatterChart
        data={this.props.chartData}
        options={{
          animation: false,
          // xScaleOverride: true,
          // xScaleSteps: 5,
          // xScaleStartValue: currentDate(),
          legendTemplate: "legend",
          scaleType: "date",
          scaleLabel: "$<%=value%>",
          scaleDateFormat: "mmm d",
          scaleDateTimeFormat: "mmm d",
          tooltipTemplate: "<%if (datasetLabel){%><%=datasetLabel%>: <%}%><%=argLabel%> <%=valueLabel%>",
          pointDot: false,
          bezierCurve: false,
          responsive: true
        }}
        redraw
      />
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
