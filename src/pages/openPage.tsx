///<reference path="../project.d.ts"/>

import { autobind } from "core-decorators";
import * as React from "react";
import { connect } from "react-redux";
import { Grid, Col, ListGroup, ListGroupItem } from "react-bootstrap";
import { createSelector } from "reselect";
import * as path from "path";
import * as fs from "fs";

import { AppState, UpdraftState, KnownDb, t } from "../state";
import { OpenDbDialog } from "../dialogs";
import { formatFilesize, formatRelativeTime } from "../i18n";
import { getRecentDbs } from "../actions";


interface Props extends React.Props<any> {
  locale: string;
  updraft: UpdraftState;
  history: ReactRouter.History;
}

interface State {
  createDbDialogShown?: boolean;
  createDbDialogOpen?: boolean;
  createDbDialogPath?: string;
}


const calculateRecentDbs = createSelector(
  (paths: string[]) => paths,
  (paths: string[]) => {
    return _(paths)
    .uniq()
    .map((p: string) => {
      const stat = fs.statSync(p);
      return {
        name: path.basename(p),
        path: p,
        size: stat.size,
        lastModified: stat.mtime
      } as KnownDb;
    })
    .value();
  }
);


@connect(
  (state: AppState) => ({ updraft: state.updraft })
)
export class OpenPage extends React.Component<Props, State> {
  state: State = {
    createDbDialogShown: false,
    createDbDialogOpen: false
  };

  render() {
    const recentDbs = calculateRecentDbs(getRecentDbs());
    return (
      <Grid>
        <Col>
          <ListGroup>
            {recentDbs.map((db: KnownDb) =>
              <ListGroupItem
                key={db.name}
                header={db.name}
                onClick={() => this.onOpenDb(db.path)}
              >
                {t("App.FilePath", {path: db.path})}
                <br/>
                {t("App.FileSize", {fileSize: formatFilesize(db.size)})}
                <br/>
                {t("App.LastModified", {lastModified: formatRelativeTime(db.lastModified)})}
              </ListGroupItem>
            )}
            <OpenDbDialog
              show={this.state.createDbDialogShown}
              open={this.state.createDbDialogOpen}
              path={this.state.createDbDialogPath}
              onCancel={this.onCancelDb}
            />
            <ListGroupItem onClick={() => this.onOpenDb()} header={t("App.OpenDbHeader")}>
              {t("App.OpenDbDescription")}
            </ListGroupItem>
            <ListGroupItem onClick={() => this.onShowCreate()} header={t("App.CreateDbHeader")}>
              {t("App.CreateDbDescription")}
            </ListGroupItem>
          </ListGroup>
        </Col>
      </Grid>
    );
  }

  showCreateDb(path: string, show: boolean, open: boolean = false) {
    this.setState({
      createDbDialogShown: show,
      createDbDialogOpen: open,
      createDbDialogPath: path
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
