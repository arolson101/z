///<reference path="../project.d.ts"/>

import { connect } from "react-redux";
import { RRule } from "rrule";

import { AppState, BillCollection, UpdraftState } from "../state";
import { updraftAdd, bindActionCreators, ThunkPromise } from "../actions";
import { Bill, Transaction, TransactionQuery } from "../types";

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
  (dispatch: Redux.Dispatch<any>) => bindActionCreators(
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
    const end = moment().add("year", 1).toDate();

    const queryTransactionsForBills = (): Promise<Transaction[]> => {
      const table = this.props.updraft.transactionTable;
      const billIds = _.map(this.props.bills, (bill: Bill) => bill.dbid);
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
      const saver = Updraft.makeSave(table, now);
      const deleter = Updraft.makeDelete(table, now);
      _.forEach(this.props.bills, (bill: Bill, billId: string) => {
        const transactions = this.state.transactionsPerBill[billId];
        const hasTransactionForDate = (date: Date): boolean => {
          return _.some(transactions, (tx: Transaction) => datesEqual(tx.date, date));
        };
        let rrule = RRule.fromString(bill.rruleString);
        let occurrences = rrule.between(rrule.options.dtstart, end);
        const noTransactionForDates = _.reject(occurrences, hasTransactionForDate);
        const toAdd = _.map(noTransactionForDates, (date: Date) => transactionFromBill(bill, date));
        const toDelete = _.reject(transactions, (tx: Transaction) => _.some(occurrences, (occurrence: Date) => occurrence.getTime() == tx.date.getTime()));
        changes.push(...toAdd.map(saver));
        changes.push(...toDelete.map(tx => tx.dbid).map(deleter));
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
  return null;
}

function datesEqual(date1: Date, date2: Date): boolean {
  return date1.getTime() == date2.getTime();
}