///<reference path="../project.d.ts"/>
"use strict";

import * as React from "react";
import { Link } from "react-router";
import { Component } from "./component";
import { Breadcrumbs } from "./breadcrumbs";


export class App extends Component<React.Props<any>> {
	render() {
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
