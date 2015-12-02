///<reference path="../project.d.ts"/>
"use strict";

import * as React from "react";


interface EditAccountProps {
	isNew?: boolean;
}

// export var EditAccount = (props?: EditAccountProps) => {
// 	return <div>{props.isNew ? "new" : "edit"} account</div>
// }

export class EditAccount extends React.Component<EditAccountProps, any> {
	constructor(props?: EditAccountProps) {
		super(props);
	}

	render() {
		return <div>{this.props.isNew ? "new" : "edit"} account</div>
	}
}

