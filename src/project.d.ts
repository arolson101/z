///<reference path="../typings/tsd.d.ts"/>
///<reference path="../node_modules/updraft/dist/updraft.d.ts"/>


declare module "redux-router" {

	function reduxReactRouter(params: {
		 routes?: any,
		 createHistory?: any;
		 routerStateSelector?: any;
	}): any;
	function routerStateReducer(state: any, action: any): any;
}
