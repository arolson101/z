///<reference path="../project.d.ts"/>

import { connect } from "react-redux";
import { Row, Grid, Col } from "react-bootstrap";
import * as faker from "faker";

import { StatelessComponent } from "../components";
import { AppState, AccountCollection } from "../state";
import { Transaction } from "../types";
import { t, formatDate, formatCurrency } from "../i18n";

interface Props {
  params?: {
    accountId?: number;
  };
  accounts?: AccountCollection;
}

interface State {
  data?: Transaction[];
}


@connect(
  (state: AppState) => ({accounts: state.accounts})
)
export class AccountDetailPage extends React.Component<Props, State> {
  state: State = {
    data: _.range(0, 1000).map((x: number): Transaction => ([
      /*date:*/ faker.date.past(1),
      /*payee:*/ faker.name.findName(),
      /*amount:*/ parseFloat(faker.finance.amount())
    ]))
  };

  render() {
    const account = this.props.accounts[this.props.params.accountId];
    return <Grid>
      <Row>
        <Col>
          <h1>{account.name}</h1>
        </Col>
      </Row>
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

  componentDidMount() {
    $(this.refs["table"]).DataTable({
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
        let out: Transaction[] = [];
        //console.log(`requesting ${data.start} through ${data.length + data.start}`)
        for (let i = data.start; i < Math.min(this.state.data.length, data.start + data.length); i++) {
          out.push(this.state.data[i]);
        }
        callback({
          draw: data.draw,
          data: out,
          recordsTotal: this.state.data.length,
          recordsFiltered: this.state.data.length
        });
      },
      columnDefs: [
        {
          render: formatDate,
          targets: 0,
          width: "80"
        }
      ]
    });
  }
}
