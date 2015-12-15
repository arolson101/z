///<reference path="./project.d.ts"/>
"use strict";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { connect, Provider } from "react-redux";
import { syncReduxAndRouter } from "redux-simple-router";
import { devTools, persistState } from "redux-devtools";
import { DevTools, DebugPanel, LogMonitor } from "redux-devtools/lib/react";
import { createHistory, createHashHistory } from "history";
import * as thunk from "redux-thunk";
import { Router, Route } from "react-router";

import { App } from "./components/index";
import { Dashboard, NewAccountPage } from "./pages/index";
import { Action, addAccount, AccountCollection } from "./actions/index";
import { appState, AppState } from "./state";
import { i18nInit } from "./i18n";


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

type createStoreFunction<State, Action> = (reducer: Redux.Reducer<State, Action>, initialState?: State) => Redux.Store<State, Action>

export function main(root: HTMLElement) {
	const middleware: any[] = [thunk];

	let finalCreateStore: createStoreFunction<AppState, Action>;
	if (__DEVELOPMENT__) {
		finalCreateStore = compose(
			applyMiddleware(...middleware),
			persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/)),
			devTools()
		)(createStore);
	}
	else {
		finalCreateStore = applyMiddleware(...middleware)(createStore);
	}

	const store = finalCreateStore(appState);
	const history = createHistory();

	syncReduxAndRouter(history, store);

	store.dispatch(i18nInit());

	store.dispatch(addAccount({dbid: 123, name: "foo"}));
	console.log(store.getState());
	
	ReactDOM.render(
		<div>
			<Provider store={store}>
				<Router history={history}>
					<Route path="/" component={App}>
						<Route path="dash" component={Dashboard}/>
						<Route path="new" component={NewAccountPage}/>
					</Route>
				</Router>
			</Provider>
		
		{__DEVELOPMENT__ &&
			<DebugPanel top right bottom>
				<DevTools store={store} monitor={LogMonitor} visibleOnLoad={false}/>
			</DebugPanel>
		}
		</div>
		, root);
}
