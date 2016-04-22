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


function dummyFI(id: number, name: string): FI {
  return   {
    id,
    name,
    fid: name + "_fid",
    org: name + "_org",
    ofx: name + "_ofx",
    profile: {
      address1: name + "address1",
      address2: name + "address2",
      address3: name + "address3",
      city: name + "city",
      state: name + "state",
      zip: name + "zip",
      country: name + "country",
      email: name + "email",
      customerServicePhone: name + "customerServicePhone",
      technicalSupportPhone: name + "technicalSupportPhone",
      fax: name + "fax",
      financialInstitutionName: name + "financialInstitutionName",
      siteURL: name + "siteURL",
    }
  };
}


describe("NewAccountPageDisplay", function() {
  let component: NewAccountPageDisplay;
  let filist: FI[];

  beforeEach(function() {
    let store = createStore(appState);
    let state = store.getState();

    filist = [
      dummyFI(0, "abc"),
      dummyFI(1, "bcd"),
      dummyFI(2, "cde"),
    ];

    component = TestUtils.renderIntoDocument(
      <NewAccountPageDisplay
        filist={filist}
        institutions={state.institutions}
        accounts={state.accounts}
        updraft={state.updraft}
      />
    ) as any;
  });


  it("selecting a value sets all fields", function() {
    const input = ReactDOM.findDOMNode(component.refs["institution"]).querySelector("input");

    const fi = filist[2];
    TestUtils.Simulate.focus(input);
    TestUtils.Simulate.change(input, { target: { value: fi.name } } as React.SyntheticEventData);
    TestUtils.Simulate.keyDown(input, { keyCode: 13, key: "Enter" });
    expect(component.state.fields.name.value).to.equal(fi.name);
    expect(component.state.fields.web.value).to.equal(fi.profile.siteURL);
    expect(component.state.fields.address.value).to.equal(
      fi.profile.address1 + "\n" +
      fi.profile.address2 + "\n" +
      fi.profile.address3 + "\n" +
      fi.profile.city + ", " +
      fi.profile.state + " " +
      fi.profile.zip + "\n" +
      fi.profile.country
    );
    expect(component.state.fields.notes.value).to.equal("");
    expect(component.state.fields.fid.value).to.equal(fi.fid);
    expect(component.state.fields.org.value).to.equal(fi.org);
    expect(component.state.fields.ofx.value).to.equal(fi.ofx);
  });
});
