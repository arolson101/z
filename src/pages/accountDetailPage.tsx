///<reference path="../project.d.ts"/>

import { autobind } from "core-decorators";
import * as faker from "faker";
import * as ReactDOM from "react-dom";
import { connect } from "react-redux";
import { Button, Row, Grid, Col } from "react-bootstrap";
import hash = require("string-hash");
import { verify, Query as Q } from "updraft";

import { datatablesLoaded } from "../components";
import { AppState, AccountCollection, UpdraftState } from "../state";
import { Transaction, TransactionQuery/*, TransactionChange*/ } from "../types";
import { /*t,*/ formatDate, formatCurrency } from "../i18n";
import { bindActionCreators, updraftAdd } from "../actions";

verify(datatablesLoaded, "this is just to ensure load order");

const batchSize = 500;
const useBatch = true;

interface Props {
  params?: {
    accountId?: number;
  };
  updraftAdd?: (state: UpdraftState, ...changes: Updraft.TableChange<any, any>[]) => Promise<any>;
  accounts?: AccountCollection;
  updraft?: UpdraftState;
}

interface State {
  rows?: Transaction[];
  offset?: number;
  limit?: number;
  count?: number;
  search?: string;
  searchCount?: number;
}


@connect(
  (state: AppState) => ({
    accounts: state.accounts,
    updraft: state.updraft,
  }),
  (dispatch: Redux.Dispatch<any>) => bindActionCreators(
    {
      updraftAdd,
    },
    dispatch)
)
export class AccountDetailPage extends React.Component<Props, State> {
  state: State = {
    rows: [],
    count: 0,
    search: "",
    searchCount: 0
  };

  render() {
    const account = this.props.accounts[this.props.params.accountId];
    return <Grid>
      <Row>
        <Col>
          <h1>{account.name}</h1>
        </Col>
      </Row>
      <Button onClick={this.onAddRandomData}>add random data</Button>
      <Row>
        <Col>
          <table className="table table-striped table-bordered" ref="table" cellSpacing="0" width="100%">
            <thead>
              <tr>
                <th>Date</th>
                <th>Payee</th>
                <th>Amount</th>
              </tr>
            </thead>
          </table>
        </Col>
      </Row>
    </Grid>;
  }

  $table() {
    return $(ReactDOM.findDOMNode(this.refs["table"]));
  }

  componentDidMount() {
    this.$table().DataTable({
      buttons: [
        "colvis"
      ],
      //dom: "Bfrtip",
      //dom: "t",
      responsive: {
        details: {
          /*renderer: function ( api: Object, rowIdx: number, columns: any[] ): string | boolean {
                let data = $.map( columns, function ( col, i ) {
                    return col.hidden ?
                        `<tr data-dt-row="${col.rowIndex}" data-dt-column="${col.columnIndex}">` +
                            `<td>${col.title}:</td> ` +
                            `<td>${col.data}</td>` +
                        `</tr>` :
                        "";
                } ).join("");

                return data ?
                    $("<table/>").append( data ) as any :
                    false;
          }*/
        }
      },
      keys: true,
      colReorder: true,
      select: "os",

      serverSide: true,
      deferRender: true,
      scrollY: "70vh",
      scroller: {
        serverWait: 0,
        trace: true,
      } as any,
      ajax: (data: DataTables.AjaxDataRequest, callback: DataTables.FunctionAjaxCallback, settings: DataTables.SettingsLegacy) => {
        const table = this.props.updraft.transactionTable;
        console.log(`requesting ${data.start} through ${data.length + data.start}`);

        const makeQuery = (search?: string): TransactionQuery => {
          let q: TransactionQuery = {
            account: this.props.params.accountId
          };
          if (search) {
            q.payee = { $like: `%${Q.escape(search)}%` };
          }
          return q;
        };

        const countRows = (query: TransactionQuery): Promise<number> => {
          return table.find(query, { count: true }) as Promise<any>;
        };

        const updateCount = (): Promise<any> => {
          if (this.state.count != 0) {
            return Promise.resolve();
          }
          else {
            console.log(`calculating result count`);
            return countRows(makeQuery())
            .then((count: any) => {
              return new Promise((resolve, reject) => {
                this.setState(
                  { count },
                  resolve
                );
              });
            });
          }
        };

        const updateSearchCount = (): Promise<any> => {
          const search = data.search.value;
          if (this.state.searchCount != 0 && this.state.search == search) {
            return Promise.resolve();
          }
          else {
            console.log(`calculating search result count`);
            return countRows(makeQuery(search))
            .then((searchCount: any) => {
              return new Promise((resolve, reject) => {
                this.setState(
                  { searchCount },
                  resolve
                );
              });
            });
          }
        };

        const runQuery = (): Promise<any> => {
          const search = data.search.value;
          if (data.start >= this.state.offset && (data.start + data.length) < (this.state.offset + this.state.limit) && this.state.search == search) {
            console.log(`range is already cached`);
            return Promise.resolve();
          }
          else {
            const center = data.start + Math.floor(data.length / 2);
            const offset = useBatch ? Math.max(center - Math.ceil(batchSize / 2), 0) : data.start;
            const limit = useBatch ? Math.min(batchSize, this.state.count - offset) : data.length;
            console.log(`running query for offset ${offset}, limit ${limit}`);
            return table
            .find(makeQuery(search), { limit, offset, orderBy: { date: Updraft.OrderBy.ASC } })
            .then((rows: Transaction[]) => {
              return new Promise((resolve, reject) => {
                this.setState(
                  { rows, search, offset, limit },
                  resolve
                );
              });
            });
          }
        };

        const returnResults = () => {
          const start = data.start - this.state.offset;
          const end = start + data.length;
          callback({
            draw: data.draw,
            data: this.state.rows.slice(start, end),
            recordsTotal: this.state.count,
            recordsFiltered: this.state.searchCount
          });
        };

        updateCount()
        .then(updateSearchCount)
        .then(runQuery)
        .then(returnResults);
      },
      columnDefs: [
        {
          data: "date",
          render: formatDate,
          targets: 0
        },
        {
          data: "payee",
          targets: 1
        },
        {
          data: "amount",
          render: formatCurrency,
          targets: 2
        }
      ]
    });
  }

  componentWillUnmount() {
    this.$table().DataTable().destroy();
  }

  @autobind
  onAddRandomData() {
    const { updraft, updraftAdd } = this.props;
    const accountId = this.props.params.accountId;
    const time = Date.now();

    for (let i = 0; i < 1; i++) {
      const transactions = _.range(0, 10000).map((x: number): Transaction => ({
        dbid: hash(i.toString() + time.toString() + x.toString() + accountId.toString()),
        account: accountId,
        date: faker.date.past(5),
        payee: faker.name.findName(),
        amount: parseFloat(faker.finance.amount())
      }));

      updraftAdd(
        updraft,
        ...transactions.map(Updraft.makeSave(updraft.transactionTable, time))
      );

      this.forceUpdate();
    }
  }
}

