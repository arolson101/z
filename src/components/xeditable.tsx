 /// <reference path="../project.d.ts"/>
 "use strict";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { Component } from "./component";


interface Props extends React.Props<any>, XEditable.Options {
    onChange?: (newValue: any) => void;
}


export class XEditable extends Component<Props> {
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


export class XSelect extends Component<Props> {
		render() {
			return <XEditable {...this.props} type="select">{this.props.children}</XEditable>;
		}
}


export class XText extends Component<Props> {
		render() {
			return <XEditable {...this.props} type="text">{this.props.children}</XEditable>;
		}
}


export class XTextForm extends Component<ReduxForm.Field> {
		render() {
			return <XText mode="inline" onChange={this.props.onChange}>{this.props.value}</XText>;
		}
}