///<reference path="./project.d.ts"/>
"use strict";

import * as i18n from "i18next-client";
import * as moment from "moment";
import currentLocaleFunction = require("current-locale");
import { verify } from "updraft";
import * as numeral from "numeral";
import filesize = require("filesize");

import { Thunk, Dispatch, setLocale } from "./actions";

require("file?name=/locales/translation.dev.json!./locales/translation.dev.json");
require("file?name=/locales/translation.en.json!./locales/translation.en.json");
require("file?name=/locales/translation.en-AU.json!./locales/translation.en-AU.json");
require("file?name=/locales/translation.en-CA.json!./locales/translation.en-CA.json");
require("file?name=/locales/translation.en-GB.json!./locales/translation.en-GB.json");
require("file?name=/locales/translation.en-US.json!./locales/translation.en-US.json");

// TODO: make these separate loads, rather than bundled in via webpack
//require("moment/locale/en-us"); - implicit default
require("moment/locale/en-au");
require("moment/locale/en-ca");
require("moment/locale/en-gb");


export const supportedLocales = [
	"en-AU",
	"en-CA",
	"en-GB",
	"en-US",
];

const fallbackLocale = "en-US";

export function loadLocale(locale: string): Promise<string> {
	return new Promise((resolve, reject) => {
		i18n.init({
			lng: locale,
			resGetPath: 'locales/__ns__.__lng__.json'
		}, (err: any) => {
			if (err) {
				reject(err);
			}
			else {
				resolve(locale);
			}
		})
	});
}


export function i18nInit(): Thunk {
	var currentLocale = currentLocaleFunction({
		supportedLocales,
		fallbackLocale
	});

	let localeUsed = moment.locale(currentLocale);
	verify(currentLocale.indexOf(localeUsed) != -1, "moment does not support this locale");

	return (dispatch: Dispatch) => {
		return loadLocale(currentLocale).then(
			() => dispatch(setLocale(currentLocale)),
			(err: Error) => console.error(err)
		);
	}
}


export function formatCurrency(amount: number): string {
	let n = numeral(amount);
	return n.format("($0,0.00)");
}

export function formatDate(date: Date): string {
	return moment(date).format("l");
}

export function formatRelativeTime(date: Date): string {
	return moment(date).fromNow();
}

export function formatFilesize(size: number): string {
  return filesize(size);
}
