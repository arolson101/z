/// <reference path="../project.d.ts"/>
"use strict";

import { autobind } from "core-decorators";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Icon from "react-fa";
import { Input } from "react-bootstrap";
import { verify } from "updraft";
import * as moment from "moment";

import { connect, AppState } from "../state";

interface YMD {
  year: number;
  month: number;
  day: number;
}

interface Options {
  autoclose?: boolean;
  beforeShowDay?: (date: Date) => any;
  beforeShowMonth?: (date: Date) => any;
  beforeShowYear?: (date: Date) => any;
  calendarWeeks?: boolean;
  clearBtn?: boolean;
  container?: string;
  datesDisabled?: string[];
  daysOfWeekDisabled?: number[];
  daysOfWeekHighlighted?: number[];
  defaultViewDate?: YMD;
  disableTouchKeyboard?: boolean;
  enableOnReadonly?: boolean;
  endDate?: string;
  forceParse?: boolean;
  format?: string;
  immediateUpdates?: boolean;
  keyboardNavigation?: boolean;
  language?: string;
  maxViewMode?: string;
  multidate?: boolean;
  multidateSeparator?: string;
  orientation?: string;
  showOnFocus?: boolean;
  startDate?: string;
  startView?: string;
  title?: string;
  todayBtn?: boolean;
  todayHighlight?: boolean;
  toggleActive?: boolean;
  weekStart?: number;
  zIndexOffset?: number;
}

interface Props extends React.Props<any> {
	locale?: string;
  options?: Options;
  onChange?: (newValue: string) => any;
  value?: Date;
	defaultValue?: Date;
}


@connect(
	(state: AppState) => ({locale: state.locale})
)
export class DatePicker extends React.Component<Props, any> {
  render() {
    return <div className="input-group date" style={{width: 200}}>
			<input type="text" ref="input" className="form-control" onKeyDown={this.onKeyDown}/>
      <div className="input-group-addon">
        <i className="fa fa-calendar"></i>
      </div>
    </div>;
  }
	
	@autobind
	onKeyDown(e: any) {
		const TAB = 9;
		const ENTER = 13;
		if (e.keyCode == TAB || e.keyCode == ENTER) {
			this.$ref("input").datepicker("update", this.toValue(e.target.value));
		}
	}
	
	$ref(name: string): any {
    var input = ReactDOM.findDOMNode(this.refs[name] as any);
    return $(input);
	}
	
	@autobind
	toValue(date: string): Date {
		let { locale } = this.props;
		const format = moment.localeData(locale).longDateFormat("L");
		let d = moment(date, format, locale).toDate();
		return d;
	}
	
	@autobind
	toDisplay(date: Date): string {
		let { locale } = this.props;
		const momentFormat = moment.localeData(locale).longDateFormat("L");
		let str = moment.utc(date).format(momentFormat);
		return str;
	}

  componentDidMount() {
		let { locale } = this.props;
		var $input = this.$ref("input");
		$input.datepicker(_.merge({
			autoclose: true,
			todayHighlight: true,
			language: locale,
			format: {
				toDisplay: this.toDisplay,
				toValue: this.toValue
			}
		}, this.props.options))
		.on('changeDate', (e: any) => {
			if(this.props.onChange) {
				this.props.onChange(e.date);
			}
		});
		$input.datepicker("update", this.props.value || this.props.defaultValue || new Date());
  }
	
	componentWillUnmount() {
		var $input = this.$ref("input");
		$input.datepicker("remove");
	}
}
