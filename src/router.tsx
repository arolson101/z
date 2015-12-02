///<reference path="./project.d.ts"/>
"use strict";

import * as React from "react";
import { combineReducers, applyMiddleware, compose } from "redux";
import { Provider } from "react-redux";
import { reduxReactRouter, routerStateReducer, ReduxRouter } from "redux-router";
import { createHistory, createHashHistory } from "history";
import { Route } from "react-router";

import { App } from "./components";
import { AppLoginPage, Dashboard } from "./pages";


export class Router extends React.Component<any, any> {
  render() {
    return (
      <ReduxRouter>
        <Route path="/" component={App}>
          <Route path="dash" component={Dashboard}/>
        </Route>
      </ReduxRouter>
    );
  }
}


export function routerState() {
  return reduxReactRouter({
    createHistory: createHashHistory //createHistory
  })
};
