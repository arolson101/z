///<reference path="../project.d.ts"/>
"use strict";

import * as React from "react";
import { connect } from "react-redux";
import { AppState } from "../state";
import { Component } from "../components";

@connect(null, null, null)
export class Dashboard extends Component<any> {
	render() {
		return <div>dashboard</div>;
	}
}
