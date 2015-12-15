///<reference path="../typings/tsd.d.ts"/>
///<reference path="../node_modules/filist/filist.d.ts"/>
///<reference path="../node_modules/updraft/dist/updraft.d.ts"/>

declare var __DEVELOPMENT__: boolean;


declare module "redux-simple-router" {
	function syncReduxAndRouter(history: any, store: any): any;
	function routeReducer(state: any, action: any): any;
	function updatePath(path: string): any;
}

declare module "redux-form" {
	import { ClassDecorator } from "react-redux";

	interface FormInfo {
		form: string; // unique name for this form
		fields: string[]; // all the fields in your form
	}
	
	function reducer(state: any, action: any): any;
	function reduxForm(info: FormInfo): ClassDecorator;
}
