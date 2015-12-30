///<reference path="./project.d.ts"/>
"use strict";

import * as i18n from "i18next-client";

import { Thunk, Dispatch, i18nLoaded } from "./actions";

require("file?name=/locales/translation.en-US.json!./locales/translation.dev.json");
require("file?name=/locales/translation.en.json!./locales/translation.en.json");
require("file?name=/locales/translation.dev.json!./locales/translation.en-US.json");

function init() {
	return new Promise((resolve, reject) => {
		i18n.init({
			resGetPath: 'locales/__ns__.__lng__.json'
		}, (err: any) => {
			if (err) {
				reject(err);
			}
			else {
				resolve();
			}
		})
	});
}


export function i18nInit(): Thunk {
	return (dispatch: Dispatch) => {
		return init().then(
			() => dispatch(i18nLoaded()),
			(err: Error) => console.error(err)
		);
	}
}
