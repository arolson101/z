///<reference path="../project.d.ts"/>

import { autobind } from "core-decorators";
import * as React from "react";
import { connect } from "react-redux";
import { Grid, Col, ListGroup, ListGroupItem } from "react-bootstrap";
import * as Icon from "react-fa";

import { AppState, UpdraftState, StoreInfo, t } from "../state";
import { OpenDbDialog } from "../dialogs";
import { formatFilesize, formatRelativeTime } from "../i18n";


interface Props extends React.Props<any> {
  locale: string;
  updraft: UpdraftState;
  stores: StoreInfo[];
}

interface State {
  dialogIsVisible?: boolean;
  dialogOpenMode?: boolean;
  dialogStoreName?: string;
}


interface OpenItemProps extends React.Props<any> {
  icon: string;
  header: string;
  onClick: Function;
}

class OpenItem extends React.Component<OpenItemProps, any> {
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
  (state: AppState): Props => ({
    locale: state.locale,
    updraft: state.updraft,
    stores: state.stores
  })
)
export class OpenPage extends React.Component<Props, State> {
  state: State = {
    dialogIsVisible: false,
    dialogOpenMode: false
  };

  render() {
    const { stores } = this.props;
    if (!this.props.locale) {
      return this.renderNoLocale();
    }
    return (
      <Grid>
        <Col>
          <ListGroup>
            <OpenDbDialog
              show={this.state.dialogIsVisible}
              open={this.state.dialogOpenMode}
              name={this.state.dialogStoreName}
              onCancel={this.onCancelDb}
            />
            <OpenItem
              onClick={() => this.onShowCreate()}
              icon="file-o"
              header={t("App.CreateDbHeader")}
            >
              {t("App.CreateDbDescription")}
            </OpenItem>
            {stores.map((store: StoreInfo) =>
              <OpenItem
                key={store.name}
                icon="file-text-o"
                header={store.name}
                onClick={() => this.onOpenDb(store.name)}
              >
                {t("App.FileSize", {fileSize: formatFilesize(store.size)})}
                <br/>
                {t("App.LastModified", {lastModified: formatRelativeTime(store.lastModified)})}
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

  showCreateDb(name: string, show: boolean, open: boolean = false) {
    this.setState({
      dialogIsVisible: show,
      dialogOpenMode: open,
      dialogStoreName: name
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
  onOpenDb(name: string) {
    this.showCreateDb(name, true, true);
  }
}
