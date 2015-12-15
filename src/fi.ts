///<reference path="./project.d.ts"/>
"use strict";

const filistPath = require("file?name=/filist.json!filist/filist.json");

import { Thunk, Dispatch, FI, fiLoaded } from "./actions";


function init() {
	return new Promise((resolve, reject) => {
		$.getJSON(filistPath, (json: FinancialInstitution[]) => {
			let filist: FI[] = _
				.sortBy(json, (fi: FinancialInstitution) => fi.name.toLowerCase())
				.map((fi: FinancialInstitution, idx: number) => {
					let fi2 = fi as FI;
					fi2.id = idx;
					return fi2;
				});
			resolve(filist);
		});
	});
}


export function fiInit(): Thunk {
	return (dispatch: Dispatch) => {
		return init().then(
			(filist: FI[]) => dispatch(fiLoaded(filist)),
			(err: Error) => console.error(err)
		);
	}
}
