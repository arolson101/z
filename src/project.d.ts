///<reference path="../typings/tsd.d.ts"/>
///<reference path="../node_modules/filist/filist.d.ts"/>
///<reference path="../node_modules/updraft/dist/updraft.d.ts"/>

declare var __DEVELOPMENT__: boolean;


declare module "redux-simple-router" {
	function syncReduxAndRouter(history: any, store: any): any;
	function routeReducer(state: any, action: any): any;
	function updatePath(path: string): any;
}


declare module ReduxForm {
	interface Info {
		form: string; // unique name for this form
		fields: string[]; // all the fields in your form
	}
	
	interface Field {
		active: boolean;
		checked: boolean;
		dirty: boolean;
		error: string;
		initialValue: any;
		invalid: boolean;
		name: string;
		onBlur(e: Event | string | number): any;
		onChange(e: Event | string | number): any;
		onDragStart(): any;
		onDrop(): any;
		onFocus(): any;
		onUpdate(e: Event | string | number): any;
		pristine: boolean;
		touched: boolean;
		valid: boolean;
		value: boolean | string;
		visited: boolean;
	}
	
	interface FieldSet {
		[fieldName: string]: Field;
	}
	
	interface FieldArray<T> extends Array<T> {
		addField(value?: any, index?: number): any;
		removeField(index?: number): any;
	}
	
	type FieldOpt = Field | FieldArray<FieldSet>;
	
	interface Props {
		active: string;
		asyncValidate: Function;
		asyncValidating: boolean;
		destroyForm: Function;
		dirty?: boolean;
		error?: string;
		fields?: { [fieldName: string]: FieldOpt };
		handleSubmit?(e: any): any;
		initializeForm?(data: Object): any;
		invalid: boolean;
		pristine: boolean;
		resetForm(): any;
		formKey: string;
		submitting: boolean;
		submitFailed: boolean;
		touch(...field: string[]): any;
		touchAll(): any;
		untouch(...field: string[]): any;
		untouchAll(): any;
		valid: boolean;
		values: {
			[fieldName: string]: string;
		}
	}	
}

declare module "redux-form" {
	import { ClassDecorator } from "react-redux";
	function reducer(state: any, action: any): any;
	function reduxForm(info: ReduxForm.Info, mapStateToProps?: Function, mapDispatchToProps?: Object): ClassDecorator;
}
