/// <reference path="../project.d.ts"/>

import { autobind } from "core-decorators";
import * as moment from "moment";
import * as React from "react";
import * as Icon from "react-fa";
import { FormControl } from "react-bootstrap";

//require("bootstrap-datepicker/dist/css/bootstrap-datepicker3.css");
//require("bootstrap-datepicker/dist/js/bootstrap-datepicker.js");
require("./datePicker.css");

interface Props {
  value: Date;
  onChange(value: Date): any;
}


export class DatePicker extends React.Component<Props, any> {
  render() {
    const value = this.dateToString(this.props.value || new Date());
    return <FormControl
      {...this.props}
      type="date"
      {...{ value }}
      className="datePicker"
      onChange={this.onChange}
      addonBefore={<Icon name="calendar"/>}
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
