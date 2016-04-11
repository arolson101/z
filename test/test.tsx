///<reference path="../typings/main.d.ts"/>

import { expect } from "chai";
import * as jsdom from "jsdom";
import * as ReactDOM from "react-dom";

import { appState,
  NewAccountPageDisplay,
 } from "../src/index";

describe("NewAccountPageDisplay", function() {
  it("asdf", function() {
    let state = appState();
    // jsdom.env("<div id='foo'></div>", (errors: Error[], window: Window) => {
    //   ReactDOM.render(
    //     <NewAccountPageDisplay
    //       filist={state.filist}
    //       institutions={state.institutions}
    //       accounts={state.accounts}
    //       updraft={state.updraft}
    //     />,
    //     window.document.getElementById("foo"),
    //     (element) => {
    //       console.log("rendered");
    //     }
    //   );
    // });
  });
});
