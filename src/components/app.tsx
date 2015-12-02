///<reference path="../project.d.ts"/>
"use strict";

import * as React from "react";
import { Link } from "react-router";
import { Component } from "./component";


export class App extends Component<React.Props<any>> {
	render() {
		return (
			<div>
				app
				<Link to="/dash">dash</Link>
				{this.props.children}
			</div>
		);
	}
}
