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

import { AppState, Config, UpdraftState, KnownDb, t } from "../state";
import { OpenDbDialog } from "../dialogs";
import { formatFilesize, formatRelativeTime } from "../i18n";
import { StatelessComponent } from "../components";

require("fixed-data-table/dist/fixed-data-table.min.css");

const {Table, Column, Cell} = require('fixed-data-table');


    const style = {
      position: 'absolute',
      backgroundColor: '#EEE',
      boxShadow: '0 5px 10px rgba(0, 0, 0, 0.2)',
      border: '1px solid #CCC',
      borderRadius: 3,
      marginLeft: 0,
      marginTop: -3,
      padding: 10,
      float: "left"
    };

class MyTextCell extends React.Component<any, any> {
  render() {
    const {rowIndex, field, data, selectedRow, container} = this.props;
    const cellref = "cellref" + rowIndex;
    return (
      <Cell {...this.props}
        style={{backgroundColor: rowIndex == selectedRow ? "blue" : null}}
        ref={cellref}
      >
        <div style={{ position: 'relative' }}  />
        <Overlay
          show={rowIndex == selectedRow}
          placement="bottom"
          container={container}
          target={() => ReactDOM.findDOMNode(this.refs[cellref])}
        >
          <div style={style} width="100%">
            <strong>Holy guacamole!</strong> <br/>Check this info. 
          </div>
        </Overlay>


        {data[rowIndex][field]}
      </Cell>
    );
  }
}

class MyLinkCell extends React.Component<any, any> {
  render() {
    const {rowIndex, field, data} = this.props;
    const link = data[rowIndex][field];
    return (
      <Cell {...this.props}>
        <a href={link}>{link}</a>
      </Cell>
    );
  }
}

class MyTable extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = {
      selectedRow: -1,
      myTableData: [
        {name: 'Rylan', email: 'Angelita_Weimann42@gmail.com'},
        {name: 'Amelia', email: 'Dexter.Trantow57@hotmail.com'},
        {name: 'Estevan', email: 'Aimee7@hotmail.com'},
        {name: 'Florence', email: 'Jarrod.Bernier13@yahoo.com'},
        {name: 'Tressa', email: 'Yadira1@hotmail.com'},
      ],
    };
  }

  render() {
    return (
      <Table
        rowsCount={this.state.myTableData.length}
        rowHeight={50}
        headerHeight={50}
        width={400}
        height={500}
        onRowClick={(e: any, i: number) => {
          this.setState({selectedRow: i});
        }}
      >
        <Column
          header={<Cell>Name</Cell>}
          cell={
            <MyTextCell
              data={this.state.myTableData}
              selectedRow={this.state.selectedRow}
              container={this}
              field="name"
            />
          }
          width={0}
        />
        <Column
          header={<Cell>Email</Cell>}
          cell={
            <MyLinkCell
              data={this.state.myTableData}
              field="email"
            />
          }
          width={200}
        />
      </Table>
    );
  }
}

class Example extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      show: false
    };
  }

  @autobind
  toggle() {
    this.setState({ show: !this.state.show });
  }

  render() {
    const style = {
      position: 'absolute',
      backgroundColor: '#EEE',
      boxShadow: '0 5px 10px rgba(0, 0, 0, 0.2)',
      border: '1px solid #CCC',
      borderRadius: 3,
      marginLeft: -5,
      marginTop: 5,
      padding: 10
    };

    return (
      <div style={{ height: 200, position: 'relative' }}>
        <Button ref="target" onClick={this.toggle}>
          I am an Overlay target
        </Button>

        <Overlay
          show={this.state.show}
          onHide={() => this.setState({ show: false })}
          placement="right"
          container={this}
          target={() => ReactDOM.findDOMNode(this.refs["target"])}
        >
          <div style={style}>
            <strong>Holy guacamole!</strong> Check this info.
          </div>
        </Overlay>
      </div>
    );
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
