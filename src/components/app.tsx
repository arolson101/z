///<reference path="../project.d.ts"/>
"use strict";

import * as React from "react";
import { connect } from "react-redux";
import { Link } from "react-router";
import { Component } from "./component";
import { Breadcrumbs } from "./breadcrumbs";
import { AppState, i18nFunction } from "../state";

interface Props extends React.Props<any> {
	t: i18nFunction;
}

@connect((state: AppState) => ({ t: state.t }))
export class App extends Component<Props> {
	render() {
		const { t } = this.props;
		if (!t) {
			return <div>...</div>;
		}

		return (
			<div>
				<Breadcrumbs items={[{title: "Home"}, {href: "/new", title: "new"}]}/>
				app
				<Link to="/dash">dash</Link>
				<Link to="/new">new</Link>
				{this.props.children}
			</div>
		);
	}
}
