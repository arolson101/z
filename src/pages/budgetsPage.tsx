///<reference path="../project.d.ts"/>
"use strict";

import * as React from "react";
import { connect } from "react-redux";
import { Row, Grid, Panel } from "react-bootstrap";
import * as Icon from "react-fa";
import { createSelector } from "reselect";

import { Component } from "../components";


interface Props {
	
}

export class BudgetsPage extends Component<Props> {
	render() {
		return <Grid>
			<Row>budgets</Row>
		</Grid>;
	}
}