/// <reference path="../project.d.ts"/>

import * as React from "react";
import * as ReactCSSTransitionGroup from "react-addons-css-transition-group";


require("./fadeTransitionGroup.css");

interface Props extends React.TransitionGroupProps, React.Props<any> {}

export class FadeTransitionGroup extends React.Component<Props, any> {
  render() {
    return (
      <ReactCSSTransitionGroup component="tbody" transitionName="fadeTransition" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
        {this.props.children}
      </ReactCSSTransitionGroup>
    );
  }
}
