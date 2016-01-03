 /// <reference path="../project.d.ts"/>
 "use strict";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { Component } from "./component";


interface ChangeProps {
	onChange?: (newValue: any) => void;
}

interface Props extends React.Props<any>, ChangeProps {}
interface XEditableProps extends Props, XEditable.Options {}

export class XEditable extends Component<XEditableProps> {
    render() {
        return <a href="#" ref="a">
            {this.props.children}
        </a>;
    }

    componentDidMount() {
        let $a = $(ReactDOM.findDOMNode(this.refs["a"]));
				let cfg = $.extend({}, this.props, {unsavedClass: null});
        $a.editable(cfg);
        $a.on('save', (e, params) => this.onSave(e, params));
    }

    onSave(e: Event, params: XEditable.SaveParams) {
        let $a = $(ReactDOM.findDOMNode(this.refs["a"]));
        $a.removeClass('editable-unsaved');
        if(this.props.onChange) {
            this.props.onChange(params.newValue);
        }
    }
}


interface XSelectProps extends Props, XEditable.SelectOptions {}

export class XSelect extends Component<XSelectProps> {
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

export class XSelectForm extends Component<XSelectFormProps> {
	render() {
		return <XSelect {...this.props as any}>{this.props.children}</XSelect>;
	}
}


interface XTextProps extends Props, XEditable.TextOptions {}

export class XText extends Component<XTextProps> {
	render() {
		return <XEditable {...this.props} type="text">{this.props.children}</XEditable>;
	}
}

export class XTextForm extends Component<ReduxForm.Field<string>> {
	render() {
		return <XText mode="inline" onChange={this.props.onChange} {...this.props as any}>{this.props.value}</XText>;
	}
}
