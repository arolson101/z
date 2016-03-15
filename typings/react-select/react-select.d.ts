// Type definitions for react-select v0.9.10
// Project: https://github.com/JedWatson/react-select
// Definitions by: ESQUIBET Hugo <https://github.com/Hesquibet/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

///<reference path="../react/react.d.ts"/>

// Typings for https://github.com/JedWatson/react-select
//***Usage***
// import ReactSelect = require('react-select');
//  <ReactSelect options={this.options} name="form-field-name" onChange={this._onSelect} value={this.state.Type} />

declare module __ReactSelect {
    // Import React
    import React = __React;

    interface Option{
        label : string;
        value : string;
    }

    interface ReactSelectProps extends React.Props<ReactSelectClass>{
        addLabelText? : string;
        allowCreate? : boolean;
        autoload? : boolean;
        backspaceRemoves? : boolean;
        cacheAsyncResults? : boolean;
        className? : string;
        clearable? : boolean;
        clearAllText? : string;
        clearValueText? : string;
        delimiter? : string;
        disabled? : boolean;
        filterOption? : (option : Option,filterString : string)=>Option;
        filterOptions? : (options:Array<Option>,filterString : string,values : Array<Object>)=>Array<Option>;
        ignoreCase? : boolean; // default true	whether to perform case-insensitive filtering
        inputProps? : Object;
        isLoading? : boolean;
        labelKey? : string;
        matchPos? : string;
        matchProp? : string;
        multi? : boolean;
        name? : string;
        newOptionCreator? : ()=>Option;
        noResultsText? : string;
        onBlur? : (event : Event)=>void;
        onChange? : (newValue : Option)=>void;
        onFocus? : (event : Event)=>void;
        onInputChange? : (inputValue : string)=>void;
        onOptionLabelClick? : (value : string, event : Event)=>void;
        optionRenderer? : ()=>void;
        options? : Array<Option>;
        placeholder? : string;
        searchable? : boolean;
        searchingText? : string;
        searchPromptText? : string;
        value? : Option | string;
        valueKey? : string;
        valueRenderer? : ()=>void;
    }

    interface ReactAsyncSelectProps extends React.Props<ReactSelectClass>{
        cache? : any;
        loadOptions? : ()=>void;
        ignoreAccents? : boolean;
        isLoading? : boolean;
        loadingPlaceholder? : string;
    }

    interface ReactSelect extends  React.ReactElement<ReactSelectProps> { }
    interface ReactSelectClass extends React.ComponentClass<ReactSelectProps>{}

    interface SelectWithAsync extends ReactSelectClass {
        Async? : ReactAsyncSelectProps;
    }
}

declare module "react-select" {
  var ReactSelect: __ReactSelect.SelectWithAsync;
  export = ReactSelect;
}
