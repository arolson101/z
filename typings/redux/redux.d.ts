// Type definitions for Redux v1.0.0
// Project: https://github.com/rackt/redux
// Definitions by: William Buchwalter <https://github.com/wbuchwalter/>, Vincent Prouillet <https://github.com/Keats/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare module Redux {

    interface ActionCreator<Action> extends Function {
        (...args: any[]): Action;
    }

    interface Reducer<State, Action> extends Function {
        (state?: State, action?: Action): State;
    }

    interface Dispatch<Action> extends Function {
        (action: Action): any;
    }

    interface StoreMethods<State, Action> {
        dispatch: Dispatch<Action>;
        getState(): State;
    }


    interface MiddlewareArg<Action> {
        dispatch: Dispatch<Action>;
        getState: Function;
    }

    interface Middleware<Action> extends Function {
        (obj: MiddlewareArg<Action>): Function;
    }

    class Store<State, Action> {
        getReducer(): Reducer<State, Action>;
        replaceReducer(nextReducer: Reducer<State, Action>): void;
        dispatch(action: Action | Function): State;
        getState(): State;
        subscribe(listener: Function): Function;
    }

    function createStore<State, Action>(reducer: Reducer<State, Action>, initialState?: State): Store<State, Action>;
    function bindActionCreators<T, Action>(actionCreators: T, dispatch: Dispatch<Action>): T;
    function combineReducers<State, Action>(reducers: any): Reducer<State, Action>;
    function applyMiddleware<Action>(...middleware: Middleware<Action>[]): Function;
    function compose<T extends Function>(...functions: Function[]): T;
}

declare module "redux" {
    export = Redux;
}
