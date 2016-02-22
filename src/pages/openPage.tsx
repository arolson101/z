///<reference path="../project.d.ts"/>

import { autobind } from "core-decorators";
import * as React from "react";
import { connect } from "react-redux";
import { Grid, Col, ListGroup, ListGroupItem } from "react-bootstrap";
import { createSelector } from "reselect";
import * as path from "path";
import * as fs from "fs";
import * as Icon from "react-fa";

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
  dialogIsVisible?: boolean;
  dialogOpenMode?: boolean;
  dialogDbPath?: string;
}


const calculateRecentDbs = createSelector(
  (paths: string[]) => paths,
  (paths: string[]) => {
    return _(paths)
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



@connect(
  (state: AppState) => ({
    locale: state.locale,
    updraft: state.updraft
  })
)
export class OpenPage extends React.Component<Props, State> {
  state: State = {
    dialogIsVisible: false,
    dialogOpenMode: false
  };

  render() {
    if (!this.props.locale) {
      return this.renderNoLocale();
    }
    const recentDbs = calculateRecentDbs(getRecentDbs());
    return (
      <Grid>
        <Col>
          <ListGroup>
            <OpenDbDialog
              show={this.state.dialogIsVisible}
              open={this.state.dialogOpenMode}
              path={this.state.dialogDbPath}
              onCancel={this.onCancelDb}
            />
            <ListGroupItem
              onClick={() => this.onShowCreate()}
              header={[<Icon name="file-o" fixedWidth size="lg"/>, " ", t("App.CreateDbHeader")] }
            >
              <small className="text-muted">{t("App.CreateDbDescription")}</small>
            </ListGroupItem>
            <ListGroupItem
              onClick={() => this.onOpenDb()}
              header={[<Icon name="folder-open-o" fixedWidth size="lg"/>, " ", t("App.OpenDbHeader")]}
            >
              <small className="text-muted">{t("App.OpenDbDescription")}</small>
            </ListGroupItem>
            {recentDbs.map((db: KnownDb) =>
              <ListGroupItem
                key={db.path}
                header={[<Icon name="file-text-o" fixedWidth size="lg"/>, " ", db.name]}
                onClick={() => this.onOpenDb(db.path)}
              >
                <small className="text-muted">
                  {t("App.FilePath", {path: db.path})}
                  <br/>
                  {t("App.FileSize", {fileSize: formatFilesize(db.size)})}
                  <br/>
                  {t("App.LastModified", {lastModified: formatRelativeTime(db.lastModified)})}
                </small>
              </ListGroupItem>
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
