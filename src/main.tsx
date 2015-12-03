///<reference path="./project.d.ts"/>
"use strict";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { connect, Provider } from "react-redux";
import { ReduxRouter } from "redux-router";
import { devTools } from "redux-devtools";
import { DevTools, DebugPanel, LogMonitor } from "redux-devtools/lib/react";

import { Dashboard, EditAccount } from "./pages";
import { Action, addAccount, AccountCollection } from "./actions";
import { appState, AppState } from "./state";
import { routerState, Router } from "./router";

interface MainProps {
	store: any;
}


class MainComponent extends React.Component<MainProps, any> {
	render() {
		return (
			<div>
				<Provider store={this.props.store}>
					<Router/>
				</Provider>
			
        <DebugPanel top right bottom>
          <DevTools store={this.props.store} monitor={LogMonitor} />
        </DebugPanel>
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

export function main(root: HTMLElement) {
const store: Redux.Store<AppState, Action> = compose(
		//applyMiddleware(m1, m2, m3),
		routerState(),
		devTools()
	)(createStore)(appState);
	//let store2= createStore(appState);

	store.dispatch(addAccount({dbid: 123, name: "foo"}));
	console.log(store.getState());
	
	ReactDOM.render(<MainComponent store={store}/>, root);
}
