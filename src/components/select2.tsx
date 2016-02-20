/// <reference path="../project.d.ts"/>

import * as React from "react";
import { Input, InputProps } from "react-bootstrap";
import { verify } from "updraft";

require("select2/dist/css/select2.css");
require("select2/dist/js/select2.js");


interface Props extends InputProps {
    onChange?(e: JQueryEventObject): any;
    opts: Select2Options;
}


export class Select2 extends React.Component<Props, any> {
  render() {
    return (
      <Input
        {...this.props}
        type="select"
        ref="input"
        className="form-control"
        style={{width: "100%"}}
      >
        {this.props.children}
      </Input>
    );
  }

  componentDidMount() {
    let input = (this.refs["input"] as any).getInputDOMNode();
    let $input = $(input);
    $input.select2($.extend({placeholder: this.props.placeholder} as Select2Options, this.props.opts));
    verify(this.props.onChange, "onChange not specified");
    $input.change(this.props.onChange);
  }

  componentWillUnmount() {
    let input = (this.refs["input"] as any).getInputDOMNode();
    let $input = $(input);
    $input.select2("destroy");
  }
}
