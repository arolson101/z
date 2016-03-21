///<reference path="../project.d.ts"/>

import { autobind } from "core-decorators";
import * as faker from "faker";
import * as ReactDOM from "react-dom";
import { connect } from "react-redux";
import { Button, Row, Grid, Col } from "react-bootstrap";
import hash = require("string-hash");
import { verify } from "updraft";

import { datatablesLoaded } from "../components";
import { AppState, AccountCollection, UpdraftState } from "../state";
import { Transaction, TransactionQuery/*, TransactionChange*/ } from "../types";
import { /*t,*/ formatDate, formatCurrency } from "../i18n";
import { bindActionCreators, updraftAdd } from "../actions";

verify(datatablesLoaded, "this is just to ensure load order");

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
    count: 0
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
      dom: "t",
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
        const query: TransactionQuery = {
          account: this.props.params.accountId
        };
        console.log(`requesting ${data.start} through ${data.length + data.start}`);

        const countRows = (): Promise<number> => {
          return table.find(query, { count: true }) as Promise<any>;
        };

        const updateCount = (): Promise<any> => {
          if (this.state.count != 0) {
            return Promise.resolve();
          }
          else {
            console.log(`calculating result count`);
            return countRows()
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

        const runQuery = (): Promise<any> => {
          return table
          .find(query, { limit: data.length, offset: data.start, orderBy: { date: Updraft.OrderBy.ASC } })
          .then((rows: Transaction[]) => {
            return new Promise((resolve, reject) => {
              this.setState(
                { rows },
                resolve
              );
            });
          });
        };

        const returnResults = () => {
          callback({
            draw: data.draw,
            data: this.state.rows,
            recordsTotal: this.state.count,
            recordsFiltered: this.state.count
          });
        };

        updateCount()
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

    const transactions = _.range(0, 1000).map((x: number): Transaction => ({
      dbid: hash("" + time + x + accountId),
      account: accountId,
      date: faker.date.past(5),
      payee: faker.name.findName(),
      amount: parseFloat(faker.finance.amount())
    }));

    updraftAdd(
      updraft,
      ...transactions.map(Updraft.makeSave(updraft.transactionTable, time))
    );
  }
}

