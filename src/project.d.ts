///<reference path="../typings/tsd.d.ts"/>
///<reference path="../node_modules/updraft/dist/updraft.d.ts"/>


declare module "redux-simple-router" {
	function syncReduxAndRouter(history: any, store: any): any;
	function routeReducer(state: any, action: any): any;
}
