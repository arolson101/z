///<reference path="../typings/tsd.d.ts"/>

declare var __DEVELOPMENT__: boolean;


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
	
	type FieldOpt = Field | FieldArray<FieldSet>;
	
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
