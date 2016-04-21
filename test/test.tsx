///<reference path="../typings/main.d.ts"/>
"use strict";
import { expect } from "chai";
import * as ReactDOM from "react-dom";
import { createStore } from "redux";
import TestUtils = require("react-addons-test-utils");

import { appState,
  NewAccountPageDisplay,
  FI
 } from "../src/index";


describe("NewAccountPageDisplay", function() {
  it("asdf", function() {
    let store = createStore(appState);
    let state = store.getState();

    let filist: FI[] = [
      {
        id: 1,
        name: "asdf",
        fid: "asdf_fid",
        org: "asdf_org",
        ofx: "asdf_ofx",
        profile: {
          address1: "",
          address2: "",
          address3: "",
          city: "",
          state: "",
          zip: "",
          country: "",
          email: "",
          customerServicePhone: "",
          technicalSupportPhone: "",
          fax: "",
          financialInstitutionName: "",
          siteURL: "",
        }
      }
    ];

    let root = TestUtils.renderIntoDocument(
      <NewAccountPageDisplay
        filist={filist}
        institutions={state.institutions}
        accounts={state.accounts}
        updraft={state.updraft}
      />
    ) as NewAccountPageDisplay;

    //console.log(root);
    root.onInstitutionChange({value: "1", label: "any"});
    expect(root.state.fields.name.value).to.equal("asdf");

    // let select = TestUtils.findAllInRenderedTree(root, (i: Element) => {
    //   return i.tagName == "input";
    // })[0];

    // TestUtils.Simulate.change(ReactDOM.findDOMNode<HTMLInputElement>(select), { target: { value: "asdf" } } as any);
    // expect(ReactDOM.findDOMNode<HTMLInputElement>(select).value).to.equal("asdf");
    console.log("done");
  });
});
