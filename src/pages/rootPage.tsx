///<reference path="../project.d.ts"/>

import * as React from "react";
import { connect } from "react-redux";
import { verify } from "updraft";

import { Breadcrumbs } from "../components";
import { AppState, UpdraftState } from "../state";


interface Props {
  locale: string;
  updraft: UpdraftState;
  history: ReactRouter.History;
}


@connect(
  (state: AppState) => ({ locale: state.locale, updraft: state.updraft })
)
export class RootPage extends React.Component<Props, any> {
  render() {
    verify(this.props.locale, "locale data not loaded!");
    verify(this.props.updraft.store, "locale data not loaded!");
    return (
      <div>
        <Breadcrumbs items={[
          {href: "/", title: "Home"},
          {href: "/institutions", title: "institutions"},
          {href: "/schedule", title: "schedule"}
        ]}/>
        {this.props.children}
      </div>
    );
  }
}
