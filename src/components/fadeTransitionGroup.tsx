/// <reference path="../project.d.ts"/>
"use strict";

import * as React from "react";
import * as ReactCSSTransitionGroup from "react-addons-css-transition-group";


interface Props extends React.TransitionGroupProps, React.Props<any> {}

export class FadeTransitionGroup extends React.Component<Props, any> {
	render() {
		return (
			<ReactCSSTransitionGroup component="tbody" transitionName="example" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
				{this.props.children}
			</ReactCSSTransitionGroup>
		); 
	}
}
