///<reference path="../project.d.ts"/>
"use strict";

import * as React from "react";
import { connect } from "react-redux";
import { Link } from "react-router";
import { Component } from "./component";
import { Breadcrumbs } from "./breadcrumbs";
import { AppState, t } from "../state";

interface Props extends React.Props<any> {
	i18nLoaded: boolean;
}

@connect((state: AppState) => ({ i18nLoaded: state.i18nLoaded }))
export class App extends Component<Props> {
	render() {
		if (!this.props.i18nLoaded) {
			return <div>...</div>;
		}

		return (
			<div>
				<Breadcrumbs items={[
					{href: "/", title: "Home"},
					{href: "/accounts", title: "accounts"},
					{href: "/new", title: "new"},
					{href: "/budgets", title: "budgets"}
				]}/>
				{this.props.children}
			</div>
		);
	}
}
