///<reference path="./project.d.ts"/>
"use strict";

import { Thunk, Dispatch, FI, fiLoaded } from "./actions";


function init() {
	const json: FinancialInstitution[] = require("filist");
	let filist: FI[] = _(json)
	.sortBy((fi: FinancialInstitution) => fi.name.toLowerCase())
	.map((fi: FinancialInstitution, idx: number) => {
		let fi2 = fi as FI;
		fi2.id = idx;
		return fi2;
	})
	.value();
	return filist;
}


export function fiInit(): Thunk {
	return (dispatch: Dispatch) => {
		const filist = init();
		dispatch(fiLoaded(filist));
	}
}
