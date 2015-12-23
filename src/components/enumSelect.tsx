///<reference path="../project.d.ts"/>
"use strict";

import * as React from "react";
import { Input, InputProps } from "react-bootstrap";
import { TypeScriptEnum } from "updraft";
import { Component } from "./component";
import { EnumEx } from "../util";


interface Props extends InputProps {
	enum: TypeScriptEnum;
	tfcn: (name: string) => string;
}


export class EnumSelect extends Component<Props> {
	render() {
		return <Input type="select" {...this.props}>
			{EnumEx.map(this.props.enum, (name: string, value: number) => 
				<option key={value} value={value as any}>{this.props.tfcn(name)}</option> 
			)}
		</Input>;
	}
}
