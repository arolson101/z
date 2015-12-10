///<reference path="./project.d.ts"/>
"use strict";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { connect, Provider } from "react-redux";
import { syncReduxAndRouter } from "redux-simple-router";
import { devTools } from "redux-devtools";
import { DevTools, DebugPanel, LogMonitor } from "redux-devtools/lib/react";
import { createHistory, createHashHistory } from "history";

import { App } from "./components/index";
import { Dashboard, NewAccountPage } from "./pages/index";
import { Action, addAccount, AccountCollection } from "./actions/index";
import { appState, AppState } from "./state";
import { Router, Route } from "react-router";

interface MainProps {
	store: any;
}

const DEBUG_PANEL = true;

class MainComponent extends React.Component<MainProps, any> {
	render() {
		return (
			<div>
				<Provider store={this.props.store}>
					<Router>
						<Route path="/" component={App}>
							<Route path="dash" component={Dashboard}/>
							<Route path="new" component={NewAccountPage}/>
						</Route>
					</Router>
				</Provider>
			
			{DEBUG_PANEL &&
        <DebugPanel top right bottom>
          <DevTools store={this.props.store} monitor={LogMonitor} />
        </DebugPanel>
			}
			</div>
		);
	}
}


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
	const composedCreateStore: createStoreFunction<AppState, Action> = compose(
		//applyMiddleware(m1, m2, m3),
		DEBUG_PANEL ? devTools() : (x: any) => x
	)(createStore);

	const store = composedCreateStore(appState);
	const history = createHistory();

	syncReduxAndRouter(history, store);

	store.dispatch(addAccount({dbid: 123, name: "foo"}));
	console.log(store.getState());
	
	ReactDOM.render(<MainComponent store={store}/>, root);
}
