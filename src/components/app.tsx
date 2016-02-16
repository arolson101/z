///<reference path="../project.d.ts"/>
"use strict";

import { autobind } from "core-decorators";
import * as React from "react";
import { connect } from "react-redux";
import { Link } from "react-router";
import { Grid, Col, Button, ListGroup, ListGroupItem } from "react-bootstrap";
import * as Icon from "react-fa";

import { Breadcrumbs } from "./breadcrumbs";
import { AppState, t, UpdraftState, KnownDb } from "../state";
import { CreateDbDialog, NewDbInfo } from "../dialogs/createDbDialog";

interface Props extends React.Props<any> {
	locale: string;
  updraft: UpdraftState;
}

interface State {
  promptDbName: boolean;
}

@connect((state: AppState) => ({ locale: state.locale, updraft: state.updraft }))
export class App extends React.Component<Props, State> {
  state = {
    promptDbName: false
  }
  
	render() {
		if (!this.props.locale) {
			return this.renderNoLocale();
		}
    else if (!this.props.updraft.store) {
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
    return (
      <Grid>
        <Col>
          <ListGroup>
            {this.props.updraft.knownDbs.map((db: KnownDb) => 
              <ListGroupItem
                key={db.name}
                header={db.name}
                onClick={() => this.onOpenDb(db.name)}
              >
                1234 bytes
                <br/> last modified: yesterday
              </ListGroupItem>
            )}
            <CreateDbDialog
              show={this.state.promptDbName}
              onSave={this.onCreateDb}
              onCancel={this.onCancelDb}
            />
            <ListGroupItem bsStyle="info" onClick={this.onAddDb} header={t("App.AddDbHeader")}>
              {t("App.AddDbDescription")}
            </ListGroupItem>
          </ListGroup>
        </Col>
      </Grid>
    );
  }
  
  showAddDb(show: boolean) {
    this.setState({promptDbName: show});
  }
  
  @autobind
  onAddDb() {
    this.showAddDb(true);
  }
  
  @autobind
  onCreateDb(info: NewDbInfo) {
  }
  
  @autobind
  onCancelDb() {
    this.showAddDb(false);
  }
  
  @autobind
  onOpenDb(name: string) {
    
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
