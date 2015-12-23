// Type definitions for X-editable
// Project: http://vitalets.github.io/x-editable/index.html
// Definitions by: Andrew Olson <andrew@olsononline.org>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/// <reference path="../jquery/jquery.d.ts"/> 

declare module XEditable {
    
    interface SourceElement {
        value: number;
        text: string;
    }
    
    interface Options {
        ajaxOptions?: Object;
        anim?: string;
        autotext?: string;
        defaultValue?: string | Object;
        disabled?: boolean;
        display?: ((value: string, response?: any) => any) | ((value: string, sourceData: any[], response?: any) => any) | boolean;
        emptyclass?: string;
        emptytext?: string;
        error?: (response: any, newValue: any) => string;
        highlight?: string | boolean;
        mode?: string;
        name?: string;
        onblur?: string;
        params?: Object | ((params: Object) => Object);
        pk?: string | Object | (() => string | Object);
        placement?: string;
        savenochange?: boolean;
        selector?: string;
        send?: string;
        showbuttons?: boolean | string;
        success?: (response: any, newvalue: any) => string | Object;
        toggle?: string;
        type?: string;
        unsavedclass?: string;
        url?: string | ((params: any) => JQueryDeferred<any>);
        validate?: (value: any) => string;
        value?: any;
    }
    
    interface TextOptions extends Options {
        clear?: boolean;
        escape?: boolean;
        inputclass?: string;
        placeholder?: string;
        tpl?: string;
    }
    
    interface TextAreaOptions extends Options {
        escape?: boolean;
        inputclass?: string;
        placeholder?: string;
        rows?: number;
        tpl?: string;
    }
    
    interface SelectOptions extends Options {
        escape?: boolean;
        inputclass?: string;
        prepend?: string | Array<any> | Object | (() => any);
        source?: string | Array<string> | Array<SourceElement> | (() => string | Array<string> | Array<SourceElement>);
        sourceCache?: boolean;
        sourceError?: string;
        sourceOptions?: Object | (() => any);
        tpl?: string;
    }

    interface DateOptions extends Options {
        clear?: boolean | string;
        datepicker?: any;
        escape?: boolean;
        format?: string;
        inputclass?: string;
        tpl?: string;
        viewformat?: string;
    }
    
    interface DateTimeOptions extends Options {
        clear?: boolean | string;
        datetimepicker?: Object;
        escape?: boolean;
        format?: string;
        inputclass?: string;
        tpl?: string;
        viewformat?: string;
    }
    
    interface DateUiOptions extends Options {
        clear?: boolean | string;
        datepicker?: Object;
        escape?: boolean;
        format?: string;
        inputclass?: string;
        tpl?: string;
        viewformat?: string;
    }
    
    interface ComboDateOptions extends Options {
        combodate?: Object;
        escape?: boolean;
        format?: string;
        inputclass?: string;
        template?: string;
        tpl?: string;
        viewformat?: string;
    }
    
    interface Html5TypesOptions extends Options {
        clear?: boolean;
        escape?: boolean;
        inputclass?: string;
        placeholder?: string;
        tpl?: string;
    }
    
    interface ChecklistOptions extends Options {
        escape?: boolean;
        inputclass?: string;
        prepend?: string | Array<any> | Object | (() => any);
        separator?: string;
        source?: string | Array<string> | Array<SourceElement> | (() => string | Array<string> | Array<SourceElement>);
    }
    
    interface WysiHtml5 extends Options {
        escape?: boolean;
        inputclass?: string;
        placeholder?: string;
        tpl?: string;
        wysihtml5: Object;
    }
    
    interface Typeahead extends Options {
        clear?: boolean;
        escape?: boolean;
        inputclass?: string;
        prepend?: string | Array<any> | Object | (() => any);
        source?: string | Array<string> | Array<SourceElement> | (() => string | Array<string> | Array<SourceElement>);
        sourceCache?: boolean;
        sourceError?: string;
        sourceOptions?: Object | (() => any);
        tpl?: string;
        typeahead?: Object;
    }
    
    interface TypeaheadJs extends Options {
        clear?: boolean;
        escape?: boolean;
        inputclass?: string;
        placeholder?: string;
        tpl?: string;
        typeahead?: Object;
    }
    
    interface Select2SourceElement {
        id: number;
        text: string;
    }
    
    interface Select2Options extends Options {
        escape?: boolean;
        inputclass?: string;
        placeholder?: string;
        select2?: Object;
        source?: Array<Select2SourceElement> | string | (() => Array<Select2SourceElement> | string);
        tpl?: string;
        viewseparator?: string;
    }
		
		interface SaveParams {
			newValue: any;
			response?: Object;
		}
}

interface JQuery {
    editable(param?: XEditable.Options): any;
    editable(method: string, ...params: any[]): any;
}
