///<reference path="../project.d.ts"/>
"use strict";

import * as React from "react";
import { Component } from "./component";
import { Input, InputProps } from "react-bootstrap";


interface Props extends InputProps {
	locale: string;
}


export class CurrencyInput extends Component<Props> {
	render() {
		return (
			<Input type="number" {...this.props} />
		);
	}
}
