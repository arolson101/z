///<reference path="../project.d.ts"/>

import * as React from "react";
import { connect } from "react-redux";
import { verify } from "updraft";

import { Breadcrumbs } from "./breadcrumbs";
import { AppState, UpdraftState } from "../state";
import { StatelessComponent } from "./component";


interface Props extends React.Props<any> {
  locale: string;
  updraft: UpdraftState;
  history: ReactRouter.History;
}


@connect(
  (state: AppState) => ({ locale: state.locale, updraft: state.updraft })
)
export class App extends StatelessComponent<Props> {
  render() {
    verify(this.props.locale, "locale data not loaded!");
    verify(this.props.updraft.store, "locale data not loaded!");
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
