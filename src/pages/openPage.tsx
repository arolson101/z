///<reference path="../project.d.ts"/>

import { autobind } from "core-decorators";
import * as React from "react";
import { connect } from "react-redux";
import { Grid, Col, ListGroup, ListGroupItem } from "react-bootstrap";
import * as Icon from "react-fa";

import { bindActionCreators, updraftOpen, OpenStoreInfo, Dispatch } from "../actions";
import { history } from "../components";
import { AppState, UpdraftState, StoreInfo, t } from "../state";
import { OpenDbDialog } from "../dialogs";
import { formatFilesize, formatRelativeTime } from "../i18n";



interface PageProps {
  updraftOpen?(info: OpenStoreInfo): Promise<any>;

  locale: string;
  stores: StoreInfo[];
}


@connect(
  (state: AppState): Props => ({
    locale: state.locale,
    stores: state.stores
  }),
  (dispatch: Dispatch) => bindActionCreators(
    {
      updraftOpen
    },
    dispatch
  )
)
export class OpenPage extends React.Component<PageProps, any> {
  render() {
    return <OpenPageDisplay {...this.props} onOpened={this.onOpened}/>;
  }

  @autobind
  onOpened() {
    history.replace("/");
  }
}



interface Props {
  updraftOpen?(info: OpenStoreInfo): Promise<any>;
  onOpened?: Function;

  locale: string;
  stores: StoreInfo[];
}

interface State {
  dialogShow?: boolean;
  dialogName?: string;
}


export class OpenPageDisplay extends React.Component<Props, State> {
  state: State = {
    dialogShow: false,
  };

  render() {
    const { stores } = this.props;

    const OpenItem = (props: {
      icon: string;
      header: string;
      onClick: Function;
      className: string;
    } & React.Props<any>) => (
      <ListGroupItem
        onClick={props.onClick}
        header={[
          <Icon name={props.icon} fixedWidth size="lg" key="icon"/>,
          " ",
          props.header
        ]}
        className={props.className}
      >
        <small className="text-muted">
          {props.children}
        </small>
      </ListGroupItem>
    );

    if (!this.props.locale) {
      return this.renderNoLocale();
    }
    return (
      <Grid>
        <Col>
          <ListGroup>
            <OpenDbDialog
              ref="openDbDialog"
              show={this.state.dialogShow}
              name={this.state.dialogName}
              onCancel={this.hideDialog}
              performOpen={this.onOpenDb}
              stores={this.props.stores}
            />
            <OpenItem
              className="openPageCreateItem"
              onClick={() => this.showDialog()}
              icon="file-o"
              header={t("App.CreateDbHeader")}
            >
              {t("App.CreateDbDescription")}
            </OpenItem>
            {stores.map((store: StoreInfo) =>
              <OpenItem
                key={store.name}
                className="openPageExistingItem"
                icon="file-text-o"
                header={store.name}
                onClick={() => this.showDialog(store.name)}
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
    return <div id="waiting">
      <i className="fa fa-spinner fa-pulse fa-3x fa-fw margin-bottom"/>
      <span className="sr-only">Loading...</span>
    </div>;
  }

  @autobind
  showDialog(name?: string) {
    this.setState({
      dialogShow: true,
      dialogName: name
    });
  }

  @autobind
  hideDialog() {
    this.setState({dialogShow: false});
  }

  @autobind
  onOpenDb(name: string, password: string, failureCallback: (message: string) => any) {
    const { updraftOpen } = this.props;
    const opts = {
      name,
      password,
      create: !this.state.dialogName
    };

    updraftOpen(opts)
    .then(
      () => {
        this.hideDialog();
        this.props.onOpened();
      },
      (err: Error) => {
        failureCallback(err.message);
      }
    );
  }
}
