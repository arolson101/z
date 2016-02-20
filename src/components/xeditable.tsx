 /// <reference path="../project.d.ts"/>

import * as React from "react";
import * as ReactDOM from "react-dom";
import { autobind } from "core-decorators";
import { StatelessComponent } from "./component";

// require("x-editable/dist/bootstrap3-editable/css/bootstrap-editable.css");
// require("x-editable/dist/bootstrap3-editable/js/bootstrap-editable.js");

interface ChangeProps {
  onChange?: (newValue: any) => void;
}

interface Props extends React.Props<any>, ChangeProps {}
interface XEditableProps extends Props, XEditable.Options {}

export class XEditable extends StatelessComponent<XEditableProps> {
  render() {
    return <a href="#" ref="a">
      {this.props.children}
    </a>;
  }

  $a(): any {
    return $(ReactDOM.findDOMNode(this.refs["a"]));
  }

  componentDidMount() {
    let { $a } = this.$a();
    $a.editable(this.props);
    $a.on("save", this.onSave);
  }

  componentWillReceiveProps(nextProps: Props) {
    let { $a } = this.$a();
    $a.editable(this.props);
  }

  componentWillUnmount() {
    let { $a } = this.$a();
    $a.editable("destroy");
  }

  @autobind
  onSave(e: Event, params: XEditable.SaveParams) {
    let { $a } = this.$a();
    $a.removeClass("editable-unsaved");
    if (this.props.onChange) {
      this.props.onChange(params.newValue);
    }
  }
}


interface XSelectProps extends Props, XEditable.SelectOptions {}

export class XSelect extends StatelessComponent<XSelectProps> {
  render() {
    return <XEditable {...this.props} type="select">{this.props.children}</XEditable>;
  }
}


interface XSelectFormProps extends ReduxForm.Field<number>, React.Props<any> {
  source: {
    value: number;
    text: string;
  }[];
}

export class XSelectForm extends StatelessComponent<XSelectFormProps> {
  render() {
    return <XSelect {...this.props as any}>{this.props.children}</XSelect>;
  }
}


interface XTextProps extends Props, XEditable.TextOptions {}

export class XText extends StatelessComponent<XTextProps> {
  render() {
    return <XEditable {...this.props} type="text">{this.props.children}</XEditable>;
  }
}

export class XTextForm extends StatelessComponent<ReduxForm.Field<string>> {
  render() {
    return <XText mode="inline" onChange={this.props.onChange} {...this.props as any}>{this.props.value}</XText>;
  }
}
