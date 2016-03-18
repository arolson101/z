///<reference path="../project.d.ts"/>

import { autobind } from "core-decorators";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { connect } from "react-redux";
import { Grid, Col, ListGroup, ListGroupItem, Button, Overlay } from "react-bootstrap";
import { createSelector } from "reselect";
import * as path from "path";
import * as fs from "fs";
import * as Icon from "react-fa";

require("datatables.net");
require("datatables.net-bs");
require("datatables.net-bs/css/dataTables.bootstrap.css");
require("datatables.net-buttons");
require("datatables.net-buttons/js/buttons.colVis");
require("datatables.net-buttons-bs");
require("datatables.net-buttons-bs/css/buttons.bootstrap.css");
require("datatables.net-colreorder");
require("datatables.net-colreorder-bs/css/colReorder.bootstrap.css");
require("datatables.net-keytable");
require("datatables.net-keytable-bs/css/keyTable.bootstrap.css");
require("datatables.net-responsive");
require("datatables.net-responsive-bs/css/responsive.bootstrap.css");
require("datatables.net-scroller");
require("datatables.net-scroller-bs/css/scroller.bootstrap.css");
require("datatables.net-select");
require("datatables.net-select-bs/css/select.bootstrap.css");

import { AppState, Config, UpdraftState, KnownDb, t } from "../state";
import { OpenDbDialog } from "../dialogs";
import { formatFilesize, formatRelativeTime } from "../i18n";
import { StatelessComponent } from "../components";


class MyTable extends React.Component<any, any> {
  // shouldComponentUpdate(nextProps: any, nextState: any): boolean {
  //   // never re-render
  //   return false;
  // }

  render() {
    return <table className="table table-striped table-bordered" ref="table" cellSpacing="0" width="100%">
      <thead>
        <tr>
          <th>Name</th>
          <th>Position</th>
          <th>Office</th>
        </tr>
      </thead>
      <tfoot>
        <tr>
          <th>Name</th>
          <th>Position</th>
          <th>Office</th>
        </tr>
      </tfoot>
      <tbody>
        <tr>
          <td>Tiger Nixon</td>
          <td>System Architect</td>
          <td>Edinburgh</td>
        </tr>
        <tr>
          <td>Tiger Nixon2</td>
          <td>System Architect</td>
          <td>Edinburgh</td>
        </tr>
        <tr>
          <td>Tiger Nixon3</td>
          <td>System Architect</td>
          <td>Edinburgh</td>
        </tr>
      </tbody>
    </table>;
  }

  componentDidMount() {
    $(this.refs["table"]).DataTable({
      buttons: [
        "colvis"
      ],
      dom: 'Bfrtip',
      responsive: true,
      keys: true,
      colReorder: true,
      select: "os",
      //scroller: true
    } as any);
  }
}



interface Props extends React.Props<any> {
  locale: string;
  updraft: UpdraftState;
  recentDbs: KnownDb[];
}

interface State {
  dialogIsVisible?: boolean;
  dialogOpenMode?: boolean;
  dialogDbPath?: string;
}


const calculateRecentDbs = createSelector(
  (config: Config) => config.recentDbs,
  (recentDbs: Set<string>) => {
    return _(recentDbs)
    .keys()
    .uniq()
    .map((p: string) => {
      try {
        const stat = fs.statSync(p);
        return {
          name: path.basename(p),
          path: p,
          size: stat.size,
          lastModified: stat.mtime
        } as KnownDb;
      }
      catch (e) {}
    })
    .filter(x => x)
    .sortBy(x => x.lastModified)
    .reverse()
    .value();
  }
);


interface OpenItemProps extends React.Props<any> {
  icon: string;
  header: string;
  onClick: Function;
}

class OpenItem extends StatelessComponent<OpenItemProps> {
  render() {
    return <ListGroupItem
      onClick={this.props.onClick}
      header={[
        <Icon name={this.props.icon} fixedWidth size="lg" key="icon"/>,
        " ",
        this.props.header
      ]}
    >
      <small className="text-muted">
        {this.props.children}
      </small>
    </ListGroupItem>;
  }
}


@connect(
  (state: AppState) => ({
    locale: state.locale,
    updraft: state.updraft,
    recentDbs: calculateRecentDbs(state.config)
  } as Props)
)
export class OpenPage extends React.Component<Props, State> {
  state: State = {
    dialogIsVisible: false,
    dialogOpenMode: false
  };

  render() {
    const { recentDbs } = this.props;
    if (!this.props.locale) {
      return this.renderNoLocale();
    }
    return (
      <Grid>
        <Col>
          <MyTable/>
        </Col>
        <Col>
          <ListGroup>
            <OpenDbDialog
              show={this.state.dialogIsVisible}
              open={this.state.dialogOpenMode}
              path={this.state.dialogDbPath}
              onCancel={this.onCancelDb}
            />
            <OpenItem
              onClick={() => this.onShowCreate()}
              icon="file-o"
              header={t("App.CreateDbHeader")}
            >
              {t("App.CreateDbDescription")}
            </OpenItem>
            <OpenItem
              onClick={() => this.onOpenDb()}
              icon="folder-open-o"
              header={t("App.OpenDbHeader")}
            >
              {t("App.OpenDbDescription")}
            </OpenItem>
            {recentDbs.map((db: KnownDb) =>
              <OpenItem
                key={db.path}
                icon="file-text-o"
                header={db.name}
                onClick={() => this.onOpenDb(db.path)}
              >
                {t("App.FilePath", {path: db.path})}
                <br/>
                {t("App.FileSize", {fileSize: formatFilesize(db.size)})}
                <br/>
                {t("App.LastModified", {lastModified: formatRelativeTime(db.lastModified)})}
              </OpenItem>
            )}
          </ListGroup>
        </Col>
      </Grid>
    );
  }

  renderNoLocale() {
    return <div>...</div>;
  }

  showCreateDb(path: string, show: boolean, open: boolean = false) {
    this.setState({
      dialogIsVisible: show,
      dialogOpenMode: open,
      dialogDbPath: path
    });
  }

  @autobind
  onShowCreate() {
    this.showCreateDb(undefined, true, false);
  }

  @autobind
  onCancelDb() {
    this.showCreateDb(undefined, false);
  }

  @autobind
  onOpenDb(name: string = "") {
    this.showCreateDb(name, true, true);
  }
}
