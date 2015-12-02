///<reference path="../typings/tsd.d.ts"/>
///<reference path="../node_modules/updraft/dist/updraft.d.ts"/>


declare module "redux-router" {
	import React = __React
	function reduxReactRouter(params: {
		 routes?: any,
		 createHistory?: any;
		 routerStateSelector?: any;
	}): any;
	function routerStateReducer(state: any, action: any): any;
	const ReduxRouter: React.ComponentClass<any>;
}
