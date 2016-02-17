///<reference path="../project.d.ts"/>
"use strict";

import * as React from "react";
import * as reactMixin from "react-mixin";
import { translate as ri_translate } from "react-i18next"; 

export var mixin = reactMixin.decorate;

export function translate(): ClassDecorator {
	return ri_translate(["translation"]);
}

export interface TranslateProps {
  t?: (key: string, options?: Object) => string;
}
