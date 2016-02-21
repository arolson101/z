///<reference path="../project.d.ts"/>
"use strict";

import { autobind } from "core-decorators";
import * as React from "react";
import { connect } from "react-redux";
import { Grid, Col, ListGroup, ListGroupItem } from "react-bootstrap";
import { createSelector } from "reselect";
import * as path from "path";
import * as fs from "fs";

import { Breadcrumbs } from "./breadcrumbs";
import { AppState, UpdraftState, KnownDb, t } from "../state";
import { OpenDbDialog } from "../dialogs/openDbDialog";
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
  (state: AppState) => ({ locale: state.locale, updraft: state.updraft })
)
export class App extends React.Component<Props, State> {
  state = {
    createDbDialogShown: false,
    createDbDialogOpen: false
  };

  render() {
    if (!this.props.locale) {
      return this.renderNoLocale();
    }
    else if (!this.props.updraft.store || this.state.createDbDialogShown) {
      return this.renderNoStore();
    }
    else {
      return this.renderMain();
    }
  }

  renderNoLocale() {
    return <div>...</div>;
  }

  renderNoStore() {
    const recentDbs = calculateRecentDbs(getRecentDbs());
    return (
      <Grid>
        <Col>
          <ListGroup>
            {recentDbs.map((db: KnownDb) =>
              <ListGroupItem
                key={db.name}
                header={db.name}
                onClick={() => this.onOpenDb(db.name)}
              >
                {t("App.FileSize", {fileSize: formatFilesize(db.size)})}
                <br/>
                {t("App.LastModified", {lastModified: formatRelativeTime(db.lastModified)})}
              </ListGroupItem>
            )}
            <OpenDbDialog
              show={this.state.createDbDialogShown}
              open={this.state.createDbDialogOpen}
              onCancel={this.onCancelDb}
            />
            <ListGroupItem onClick={this.onOpenDb} header={t("App.OpenDbHeader")}>
              {t("App.OpenDbDescription")}
            </ListGroupItem>
            <ListGroupItem onClick={this.onShowCreate} header={t("App.CreateDbHeader")}>
              {t("App.CreateDbDescription")}
            </ListGroupItem>
          </ListGroup>
        </Col>
      </Grid>
    );
  }

  showCreateDb(show: boolean, open: boolean = false) {
    this.setState({createDbDialogShown: show, createDbDialogOpen: open});
  }

  @autobind
  onShowCreate() {
    this.showCreateDb(true, false);
  }

  @autobind
  onCancelDb() {
    this.showCreateDb(false);
  }

  @autobind
  onOpenDb(name: string) {
    this.showCreateDb(true, true);
  }


  renderMain() {
    return (
      <div>
        <Breadcrumbs items={[
          {href: "/", title: "Home"},
          {href: "/accounts", title: "accounts"},
          {href: "/newAccount", title: "new account"},
          {href: "/budgets", title: "budgets"}
        ]}/>
        {this.props.children}
      </div>
    );
  }
}
