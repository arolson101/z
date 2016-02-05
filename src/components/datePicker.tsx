/// <reference path="../project.d.ts"/>
"use strict";

import { autobind } from "core-decorators";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Icon from "react-fa";
import { Input } from "react-bootstrap";
import { verify } from "updraft";
import * as moment from "moment";

//require("bootstrap-datepicker/dist/css/bootstrap-datepicker3.css");
//require("bootstrap-datepicker/dist/js/bootstrap-datepicker.js");

interface Props {
	value: Date;
	defaultValue: Date;
	onChange(value: Date): any;
}


export class DatePicker extends React.Component<Props, any> {
	render() {
		const value = this.dateToString(this.props.value || this.props.defaultValue || new Date());
		return <Input
			type="date"
			{...{ value }}
			onChange={this.onChange}
			/*addonAfter={<Icon name="calendar"/>}*/
		/>;
	}

	dateToString(date: Date): string {
		return moment(date).format("YYYY-MM-DD");
	}

	stringToDate(value: string): Date {
		return moment(value, "YYYY-MM-DD").toDate();
	}

	@autobind
	onChange(e: any) {
		if (this.props.onChange) {
			const value = this.stringToDate(e.target.value);
			this.props.onChange(value);
		}
	}

}
