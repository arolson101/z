///<reference path="../project.d.ts"/>
"use strict";

import * as React from "react";
import { connect } from "react-redux";
import { AppState } from "../state";
import { Component } from "../components";


export class LoginPage extends Component<any> {
	render() {
		return <div>login page</div>;
	}
}



export class AppLoginPage extends Component<any> {
	render() {
		return <LoginPage/>;
	}
}
