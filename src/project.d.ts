///<reference path="../typings/tsd.d.ts"/>

declare var __DEVELOPMENT__: boolean;


// version 3 isn't in tsd (yet)
declare module "redux-devtools" {
	import * as React from "react";
	class DevTools extends React.Component<any, any> {
		instrument(): any;
	}
	export function createDevTools(arg: any): any;
	export function persistState(sessionId: any, stateDeserializer?: Function, actionDeserializer?: Function): Function;
}

declare module "redux-devtools-log-monitor" {
	import * as React from "react";
	export default class LogMonitor extends React.Component<any, any> {}
}

declare module "redux-devtools-dock-monitor" {
	import * as React from "react";
	export default class DockMonitor extends React.Component<any, any> {}
}


declare module "redux-simple-router" {
	function syncReduxAndRouter(history: any, store: any): any;
	function routeReducer(state: any, action: any): any;
	function updatePath(path: string): any;
}


declare module ReduxForm {

  interface Action {
    type: string;
    form: string;
    field: string;
    value?: string;
    touch?: boolean;
  }

  interface ActionTypes {
    ADD_ARRAY_VALUE: string;
    BLUR: string;
    CHANGE: string;
    DESTROY: string;
    FOCUS: string;
    INITIALIZE: string;
    REMOVE_ARRAY_VALUE: string;
    RESET: string;
    START_ASYNC_VALIDATION: string;
    START_SUBMIT: string;
    STOP_ASYNC_VALIDATION: string;
    STOP_SUBMIT: string;
    SUBMIT_FAILED: string;
    TOUCH: string;
    UNTOUCH: string;
  }

	interface Info {
		form: string; // unique name for this form
		fields: string[]; // all the fields in your form
		asyncBlurFields?: string[];
		asyncValidate?: (values: Object, dispatch: Function, props: Object) => Promise<any>;
		destroyOnUnmount?: boolean;
		formKey?: string;
		getFormState?: Function;
		initialValues?: any;
		onSubmit?: Function;
		propNamespace?: string;
		readonly?: boolean;
		reduxMountPoint?: string;
		returnRejectedSubmitPromise?: boolean;
		touchOnBlur?: boolean;
		touchOnChange?: boolean;
		validate?: (values: Object, props: Object) => Object;
	}

	interface Field<type> {
		active: boolean;
		checked: boolean;
		defaultValue: type;
		dirty: boolean;
		error: string;
		initialValue: type;
		invalid: boolean;
		name: string;
		onBlur(e: Event): any;
		onChange(e: Event | type): any;
		onDragStart(): any;
		onDrop(): any;
		onFocus(): any;
		onUpdate(e: Event | type): any;
		pristine: boolean;
		touched: boolean;
		valid: boolean;
		value: type;
		visited: boolean;
	}

	type FieldOpt = Field<any> | FieldArray<FieldSet>;

	interface FieldSet {
		[fieldName: string]: FieldOpt;
	}

	interface FieldArray<T> extends Array<T> {
		addField(value?: any, index?: number): any;
		removeField(index?: number): any;
	}

	interface Props {
		active: string;
		asyncValidate: Function;
		asyncValidating: boolean;
		destroyForm: Function;
		dirty?: boolean;
		error?: string;
		fields?: FieldSet;
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

  interface ReducerPluginSet {
    [formName: string]: Redux.Reducer<any, any>;
  }
}

declare module "redux-form" {
	import { ClassDecorator } from "react-redux";
  module reducer {
    function plugin(plugins: ReduxForm.ReducerPluginSet): any;
  }
	function reducer(state: any, action: any): any;
	function reduxForm(info: ReduxForm.Info, mapStateToProps?: Function, mapDispatchToProps?: Object): ClassDecorator;
  var actionTypes: ReduxForm.ActionTypes;

  function blur(form: string, field: string, value: string): ReduxForm.Action;
  function change(form: string, field: string, value: string): ReduxForm.Action;
  function changeWithKey(form: string, formKey: string, field: string, value: string): ReduxForm.Action;
  function focus(form: string, field: string): ReduxForm.Action;
  function initialize(form: string, data: Object, fields: string[]): ReduxForm.Action;
  function initializeWithKey(form: string, formKey: string, data: Object, fields: string[]): ReduxForm.Action;
  function reset(form: string): ReduxForm.Action;
  function startAsyncValidation(form: string): ReduxForm.Action;
  function startSubmit(form: string): ReduxForm.Action;
  function stopSubmit(form: string, errors: Object): ReduxForm.Action;
  function stopAsyncValidation(form: string, errors: Object): ReduxForm.Action;
  function touch(form: string, ...fields: string[]): ReduxForm.Action;
  function touchWithKey(form: string, formKey: string, ...fields: string[]): ReduxForm.Action;
  function untouch(form: string, ...fields: string[]): ReduxForm.Action;
  function untouchWithKey(form: string, formKey: string, ...fields: string[]): ReduxForm.Action;
  function destroy(form: string, field: string, value: string): ReduxForm.Action;
}



declare module "string-hash" {
	function hash(input: string): number;
	export = hash;
}


interface WebpackHMR {
	accept(dependencies: string[], callback: (updatedDependencies: any) => void): void;
	accept(dependency: string, callback: () => void): void;
	decline(dependencies: string[]): void;
	decline(dependency: string): void;
	decline(): void;
	dispose(callback: (data: Object) => void): void;
	addDisposeHandler(callback: (data: Object) => void): void;
	removeDisposeHandler(callback: (data: Object) => void): void;
}

interface NodeModule {
	hot?: WebpackHMR;
}


declare module "reselect" {
	type Selector<State, Return> = (state: State) => Return;
	function createSelector<State, ReturnType, Result1>(
    selector1: Selector<State, Result1>,
    resultFunc: (result1: Result1) => ReturnType
  ): (state: State) => ReturnType;
	function createSelector<State, ReturnType, Result1, Result2>(
    selector1: Selector<State, Result1>, 
    selector2: Selector<State, Result2>, 
    resultFunc: (result1: Result1, result2: Result2) => ReturnType
  ): (state: State) => ReturnType;
	function createSelector<State, ReturnType, Result1, Result2, Result3>(
    selector1: Selector<State, Result1>, 
    selector2: Selector<State, Result2>, 
    selector3: Selector<State, Result3>, 
    resultFunc: (result1: Result1, result2: Result2, result3: Result3) => ReturnType
  ): (state: State) => ReturnType;
	function createSelector<State, ReturnType>(
    selectors: Selector<State, any>[],
    resultFunc: (...args: any[]) => ReturnType
  ): (state: State) => ReturnType;
}


declare module "current-locale" {
	function currentLocaleFunction(opts: {
		supportedLocales: string[],
		fallbackLocale: string
	}): string;
	export = currentLocaleFunction;
}


declare module __RRule {
	interface Frequency {}
	interface Day {}
	type integer = number;
	
	interface Options {
		freq: Frequency;
		dtstart?: Date;
		interval?: number;
		wkst?: Day | integer;
		count?: integer;
		until?: Date;
		bysetpos?: integer | integer[];
		bymonth?: integer | integer[]; 
		bymonthday?: integer | integer[]; 
		byyearday?: integer | integer[]; 
		byweekno?: integer | integer[]; 
		byweekday?: integer | integer[] | Day | Day[]; 
		byhour?: integer | integer[]; 
		byminute?: integer | integer[]; 
		bysecond?: integer | integer[]; 
	}
	
	interface Language {}
	
	interface Iterator {
		(date: Date, i: number): boolean;
	}
	
	module RRule {
		var YEARLY: Frequency;
		var MONTHLY: Frequency;
		var WEEKLY: Frequency;
		var DAILY: Frequency;
		var HOURLY: Frequency;
		var MINUTELY: Frequency;
		var SECONDLY: Frequency;
		
		var MO: Day;
		var TU: Day;
		var WE: Day;
		var TH: Day;
		var FR: Day;
		var SA: Day;
		var SU: Day;
	}
	
	class RRule {
		options: Options;
		origOptions: Options;
		constructor(options: Options, noCache?: boolean);
		all(iterator?: Iterator): Date[];
		between(after: Date, before: Date, inc?: boolean, iterator?: Iterator): Date[];
		before(dt: Date, inc?: boolean): Date;
		after(dt: Date, inc?: boolean): Date;
		toString(): string;
		static optionsToString(options: Options): string;
		static fromString(rfcString: string): RRule;
		static parseString(rfcString: string): Options;
		toText(gettext?: (token: string) => string, language?: Language): string;
		isFullyConvertibleToText(): boolean;
		static fromText(text: string, language?: Language): RRule;
		static parseText(text?: string, language?: Language): Options;
	}
	
	class RRuleSet {
		constructor(noCache?: boolean);
		rrule(rrule: RRule): any;
		rdate(dt: Date): any;
		exrule(rrule: RRule): any;
		exdate(dt: Date): any;
		all(iterator?: Iterator): Date[];
		between(after: Date, before: Date, inc?: boolean, iterator?: Iterator): Date[];
		before(dt: Date, inc?: boolean): Date;
		after(dt: Date, inc?: boolean): Date;
	}
}

declare module "rrule" {
	export = __RRule.RRule;
}