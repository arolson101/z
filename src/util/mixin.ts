///<reference path="../project.d.ts"/>
"use strict";

import * as React from "react";
import * as reactMixin from "react-mixin";
import { History as HistoryMixin } from "react-router";

export var mixin = reactMixin.decorate;

export function historyMixin(target: Function) {
	reactMixin.onClass(target, HistoryMixin);
	(target as any).contextTypes = {
		router: React.PropTypes.func
	}
}
