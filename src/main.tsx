///<reference path="./project.d.ts"/>
"use strict";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { connect, Provider } from "react-redux";
import { syncReduxAndRouter } from "redux-simple-router";
import { createHistory, createHashHistory } from "history";
import * as thunk from "redux-thunk";
import { Router, Route } from "react-router";

import { createDevTools, persistState } from "redux-devtools";
import LogMonitor from "redux-devtools-log-monitor";
import DockMonitor from "redux-devtools-dock-monitor";


import { App } from "./components/index";
import { AccountsPage, BudgetsPage, NewAccountPage } from "./pages/index";
import { Action, addAccount, AccountCollection } from "./actions/index";
import { appState, AppState } from "./state";
import { i18nInit } from "./i18n";
import { fiInit } from "./fi";
import { updraftInit } from "./updraft";

const DevTools = createDevTools(
	<DockMonitor toggleVisibilityKey="ctrl-h" changePositionKey="ctrl-q" defaultIsVisible={false}>
		<LogMonitor theme="tomorrow"/>
	</DockMonitor>
);

interface Props {
	accounts: AccountCollection;
}


class AccountList extends React.Component<Props, any> {
	render() {
		return <div>{Object.keys(this.props.accounts).length} accounts:
			{Object.keys(this.props.accounts).map((accountId: any) => {
				let accountIdn: number = accountId;
				let account = this.props.accounts[accountIdn];
				return <div key={accountIdn}>{account.name}</div>;
			})}
		</div>;
	}
}


@connect((state: AppState) => ({ accounts: state.accounts }))
class AppAccountList extends React.Component<any, any> {
	render() {
		return <AccountList {...this.props}/>;
	}
}


function getDebugSessionKey() {
  // You can write custom logic here!
  // By default we try to read the key from ?debug_session=<key> in the address bar
  const matches = window.location.href.match(/[?&]debug_session=([^&]+)\b/);
  return (matches && matches.length > 0)? matches[1] : null;
}


type createStoreFunction<State, Action> = (reducer: Redux.Reducer<State, Action>, initialState?: State) => Redux.Store<State, Action>


export function main(root: HTMLElement) {
	const middleware: any[] = [thunk];

	let finalCreateStore: createStoreFunction<AppState, Action>;
	if (__DEVELOPMENT__) {
		finalCreateStore = compose(
			applyMiddleware(...middleware),
			persistState(getDebugSessionKey()),
			DevTools.instrument()
		)(createStore);
	}
	else {
		finalCreateStore = applyMiddleware(...middleware)(createStore);
	}

	const store = finalCreateStore(appState);
	const history = createHistory();

	syncReduxAndRouter(history, store);

	store.dispatch(i18nInit());
	store.dispatch(fiInit());
	store.dispatch(updraftInit());
	
	// if (module.hot) {
	// 	module.hot.accept("./state", () => {
	// 		store.replaceReducer(require("./state").appState);
	// 	});
	// }

	ReactDOM.render(
		<Provider store={store}>
			<div>
				<Router history={history}>
					<Route path="/" component={App}>
						<Route path="accounts" component={AccountsPage}/>
						<Route path="budgets" component={BudgetsPage}/>
						<Route path="new" component={NewAccountPage}/>
					</Route>
				</Router>

				{__DEVELOPMENT__ &&
					<DevTools/>
				}
			</div>
		</Provider>
		, root);
}
