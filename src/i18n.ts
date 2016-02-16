///<reference path="./project.d.ts"/>
"use strict";

import * as i18n from "i18next-client";
import * as moment from "moment";
import currentLocaleFunction = require("current-locale");
import { verify } from "updraft";
import * as numeral from "numeral";
import filesize = require("filesize");

import { Thunk, Dispatch, setLocale } from "./actions";


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
