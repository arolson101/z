///<reference path="../project.d.ts"/>

import { connect } from "react-redux";
import { RRule } from "rrule";
import hash = require("string-hash");
import * as moment from "moment";

import { AppState, BillCollection, UpdraftState } from "../state";
import { updraftAdd, bindActionCreators, Dispatch, ThunkPromise } from "../actions";
import { Bill, Transaction, TransactionQuery, TransactionStatus } from "../types";

interface Props {
  bills?: BillCollection;
  updraft?: UpdraftState;
  updraftAdd?(state: UpdraftState, ...changes: Updraft.TableChange<any, any>[]): ThunkPromise;
}


type TransactionGroup = _.Dictionary<Transaction[]>;

interface State {
  transactionsPerBill?: TransactionGroup;
}


@connect(
  (state: AppState): Props => ({
    bills: state.bills,
    updraft: state.updraft,
  }),
  (dispatch: Dispatch) => bindActionCreators(
    {
      updraftAdd,
    },
    dispatch)
)
export class BillTransactionSync extends React.Component<Props, State> {
  render() {
    return null as JSX.Element;
  }

  componentWillMount() {
    this.runUpdate();
  }

  shouldComponentUpdate(nextProps: Props, nextState: State, nextContext: any): boolean {
    return (this.props !== nextProps || this.state !== nextState || this.context !== nextContext);
  }

  componentWillUpdate(nextProps: Props, nextState: State) {
    if (this.props !== nextProps) {
      this.runUpdate();
    }
  }

  runUpdate() {
    if (!this.props.updraft.store) {
      return;
    }

    console.log("running update");
    const end = moment().add(1, "year").toDate();

    const queryTransactionsForBills = (): Promise<Transaction[]> => {
      const table = this.props.updraft.transactionTable;
      const billIds = _.map(this.props.bills, (bill: Bill) => bill.dbid);
      // TODO: remove deleted bills
      const query: TransactionQuery = {
        bill: { $in: billIds }
      };
      return table.find(query, { orderBy: { date: Updraft.OrderBy.ASC }});
    };

    const updateTransactionsPerBill = (transactions: Transaction[]): Promise<any> => {
      const transactionsPerBill = _.groupBy(transactions, (transaction: Transaction) => transaction.bill);
      return new Promise((resolve, reject) => {
        this.setState({ transactionsPerBill }, resolve);
      });
    };

    const validateTransactions = () => {
      const changes: Updraft.TableChange<any, any>[] = [];
      const table = this.props.updraft.transactionTable;
      const now = Date.now();
      const creator = Updraft.makeCreate(table, now);
      const deleter = Updraft.makeDelete(table, now);
      _.forEach(this.props.bills, (bill: Bill, billId: string) => {
        if (bill.account) {
          const transactions = this.state.transactionsPerBill[billId];
          const hasTransactionForDate = (date: Date): boolean => {
            return _.some(transactions, (tx: Transaction) => datesEqual(tx.date, date));
          };
          let rrule = RRule.fromString(bill.rruleString);
          let occurrences = rrule.between(rrule.options.dtstart, end, true);
          const noTransactionForDates = _.reject(occurrences, hasTransactionForDate);
          const toAdd = _.map(noTransactionForDates, (date: Date) => transactionFromBill(bill, date));
          const toDelete = _.reject(transactions, (tx: Transaction) => _.some(occurrences, (occurrence: Date) => occurrence.getTime() == tx.date.getTime()));
          changes.push(...toAdd.map(creator));
          changes.push(...toDelete.map(tx => tx.dbid).map(deleter));
        }
      });

      const { updraftAdd, updraft } = this.props;
      if (changes.length) {
        return updraftAdd(updraft, ...changes);
      }
    };

    return Promise.resolve()
    .then(queryTransactionsForBills)
    .then(updateTransactionsPerBill)
    .then(validateTransactions);
  }
}


function transactionFromBill(bill: Bill, date: Date): Transaction {
  const dbid = hash(bill.account.toString() + bill.dbid.toString() + date.toString());
  return {
    dbid,
    account: bill.account,
    date,
    payee: bill.name,
    amount: bill.amount,
    bill: bill.dbid,
    status: TransactionStatus.Scheduled
  };
}

function datesEqual(date1: Date, date2: Date): boolean {
  return date1.getTime() == date2.getTime();
}
