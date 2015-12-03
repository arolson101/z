///<reference path="../project.d.ts"/>
"use strict";

import * as React from "react";

// stateless component
export class Component<P> extends React.Component<P, any> {
	shouldComponentUpdate(nextProps: P, nextState: any, nextContext: any): boolean {
		return this.props !== nextProps || this.state !== nextState || this.context !== nextContext;
	}
}
