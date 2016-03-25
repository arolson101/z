///<reference path="../project.d.ts"/>

import { autobind } from "core-decorators";
import * as moment from "moment";
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
  forceRefresh?: boolean;
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
    searchCount: 0,
    forceRefresh: false
  };

  render() {
    const account = this.props.accounts[this.props.params.accountId];
    return <Grid>
      <Row>
        <Col>
          <h1>{account.name}</h1>
        </Col>
      </Row>
      {__DEVELOPMENT__ &&
        <Button onClick={this.onAddRandomData}><i className="fa fa-random"/>add random data</Button>
      }
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
      //keys: true,
      colReorder: true,
      //select: "os",

      serverSide: true,
      deferRender: true,
      scrollY: "70vh",
      scroller: {
        serverWait: 0,
        trace: true,
      } as any,
      ajax: (data: DataTables.AjaxDataRequest, callback: DataTables.FunctionAjaxCallback, settings: DataTables.SettingsLegacy) => {
        const table = this.props.updraft.transactionTable;
        //console.log(`requesting ${data.start} through ${data.length + data.start}`);

        const makeQuery = (search?: string): TransactionQuery[] => {
          let q: TransactionQuery = {
            account: this.props.params.accountId
          };
          let qs: TransactionQuery[] = [];
          if (search) {
            qs.push(_.assign({ payee: { $like: `%${Q.escape(search)}%` } }, q));
            let date = moment(search, "l");
            if (date.isValid()) {
              const start = date.toDate();
              const end = moment(date).add(1, "days").toDate();
              qs.push(_.assign({ date: { $after: start, $before: end } }, q));
            }
            let amount = filterFloat(search);
            if (!isNaN(amount)) {
              qs.push(_.assign({ amount }, q));
            }
          }
          else {
            qs.push(q);
          }
          return qs;
        };

        const countRows = (query: TransactionQuery): Promise<number> => {
          return table.find(query, { count: true }) as Promise<any>;
        };

        const updateCount = (): Promise<any> => {
          if (this.state.count != 0 && !this.state.forceRefresh) {
            return Promise.resolve();
          }
          else {
            //console.log(`calculating result count`);
            return countRows(makeQuery())
            .then((count: number) => {
              return new Promise((resolve, reject) => {
                //console.log(`result count: ${count}`);
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
          if (this.state.searchCount != 0 && this.state.search == search && !this.state.forceRefresh) {
            return Promise.resolve();
          }
          else {
            //console.log(`calculating search result count`);
            return countRows(makeQuery(search))
            .then((searchCount: number) => {
              //console.log(`search result count: ${searchCount}`);
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
          if (data.start >= this.state.offset && (data.start + data.length) < (this.state.offset + this.state.limit) && this.state.search == search && !this.state.forceRefresh) {
            //console.log(`range is already cached`);
            return Promise.resolve();
          }
          else {
            const center = data.start + Math.floor(data.length / 2);
            const offset = useBatch ? Math.max(center - Math.ceil(batchSize / 2), 0) : data.start;
            const limit = useBatch ? Math.min(batchSize, this.state.count - offset) : data.length;
            //console.log(`running query for offset ${offset}, limit ${limit}`);
            return table
            .find(makeQuery(search), { limit, offset, orderBy: { date: Updraft.OrderBy.ASC } })
            .then((rows: Transaction[]) => {
              return new Promise((resolve, reject) => {
                this.setState(
                  { rows, search, offset, limit, forceRefresh: false },
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
      ],
      createdRow: (row: Node, data: Transaction, dataIndex: number): void => {
        $("td", row).eq(1).jinplace({
          submitFunction: (opts, value) => {
            console.log("submit");
          }
        });
      }
    });
  }

  componentWillUnmount() {
    this.$table().DataTable().destroy();
  }

  @autobind
  onAddRandomData() {
    if (__DEVELOPMENT__) {
      const faker: Faker.FakerStatic = require("faker");
      const { updraft, updraftAdd } = this.props;
      const accountId = this.props.params.accountId;
      const time = Date.now();

      for (let i = 0; i < 1; i++) {
        const transactions = _.range(0, 10).map((x: number): Transaction => ({
          dbid: hash(i.toString() + time.toString() + x.toString() + accountId.toString()),
          account: accountId,
          date: faker.date.past(5),
          payee: faker.name.findName(),
          amount: parseFloat(faker.finance.amount())
        }));

        updraftAdd(
          updraft,
          ...transactions.map(Updraft.makeSave(updraft.transactionTable, time))
        ).then(() => {
          this.setState({forceRefresh: true}, () => {
            this.$table().DataTable().ajax.reload();
          });
        });
      }
    }
  }
}

function filterFloat(value: string): number {
  if (/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value)) {
    return Number(value);
  }
  else {
    return NaN;
  }
}
