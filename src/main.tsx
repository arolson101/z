///<reference path="./project.d.ts"/>

import * as React from "react";
import * as ReactDOM from "react-dom";
import { createStore, applyMiddleware, compose } from "redux";
import { connect, Provider } from "react-redux";
import { syncHistory } from "redux-simple-router";
import thunk from "redux-thunk";
import { Router, Route } from "react-router";
import { createDevTools, persistState } from "redux-devtools";
import LogMonitor from "redux-devtools-log-monitor";
import DockMonitor from "redux-devtools-dock-monitor";

require("bootstrap/dist/css/bootstrap.min.css");


import * as Pages from "./pages/index";
import { Action, AccountCollection, configInit } from "./actions";
import { appState, AppState } from "./state";
import { i18nInit } from "./i18n";
import { fiInit } from "./fi";
import { history } from "./components";

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
  return (matches && matches.length > 0) ? matches[1] : null;
}


type createStoreFunction<State, Action> = (reducer: Redux.Reducer<State, Action>, initialState?: State) => Redux.Store<State, Action>


export function main(root: HTMLElement) {
  const reduxRouterMiddleware = syncHistory(history);

  const middleware: any[] = [thunk, reduxRouterMiddleware];

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

  reduxRouterMiddleware.listenForReplays(store);

  store.dispatch(configInit());
  store.dispatch(i18nInit());
  store.dispatch(fiInit());

  const requireUpdraftStore = (nextState: any, replace: any) => {
    if (!store.getState().updraft.store) {
      replace({
        pathname: "/open",
        state: { nextPathname: nextState.location.pathname }
      });
    }
  };

  ReactDOM.render(
    <Provider store={store}>
      <div>
        <Router history={history}>
          <Route path="/" component={Pages.RootPage} onEnter={requireUpdraftStore}>
            <Route path="accounts" component={Pages.AccountsPage}/>
            <Route path="accounts/:institutionId" component={Pages.NewAccountPage}/>
            <Route path="accounts/new" component={Pages.NewAccountPage}/>
            <Route path="schedule" component={Pages.SchedulePage}/>
          </Route>
          <Route path="/open" component={Pages.OpenPage}/>
        </Router>

        {__DEVELOPMENT__ &&
          <DevTools/>
        }
      </div>
    </Provider>,
    root
  );
}
