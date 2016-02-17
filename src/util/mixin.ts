///<reference path="../project.d.ts"/>
"use strict";

import * as React from "react";
import * as reactMixin from "react-mixin";
import { translate } from "react-i18next"; 

export var mixin = reactMixin.decorate;

export { translate };
export interface TranslateProps {
  t?: (key: string, options?: Object) => string;
}
