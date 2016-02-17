///<reference path="./project.d.ts"/>
"use strict";

import electron = require("electron");
import * as moment from "moment";
import currentLocaleFunction = require("current-locale");
import { verify } from "updraft";
import * as numeral from "numeral";
import filesize = require("filesize");
import i18next = require("i18next");
import FilesystemBackend = require("i18next-node-fs-backend");
import path = require("path");

import { Thunk, Dispatch, setLocale } from "./actions";

const appPath = electron.remote.app.getAppPath();


export const supportedLocales = [
	"en-AU",
	"en-CA",
	"en-GB",
	"en-US",
];

const fallbackLocale = "en-US";

export const i18n = i18next
  .use(FilesystemBackend);

export function loadLocale(locale: string): Promise<string> {
	return new Promise((resolve, reject) => {
    i18n
    .use(FilesystemBackend)
    .init({
        lng: locale,
        fallbackLng: "en",
        backend: {
          loadPath: "app/locales/{{ns}}.{{lng}}.json"
        }
      },
      (err: any) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(locale);
        }
      }
    );
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
