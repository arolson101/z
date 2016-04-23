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


function findNode<T extends Element>(component: React.Component<any, any>, name: string, selector: string): T {
  expect(component.refs).to.have.property(name);
  const node = ReactDOM.findDOMNode(component.refs[name]);
  expect(node).not.to.be.null;
  const child = node.querySelector(selector);
  return child as T;
}

function simulateChangeTargetValue(element: Element, value: string) {
  TestUtils.Simulate.change(element, { target: { value } } as React.SyntheticEventData);
  return frame();
}

const simulateChangeInstitution = async function(institution: Element, value: string) {
  simulateChangeTargetValue(institution, value);
  TestUtils.Simulate.keyDown(institution, { keyCode: 9, key: "Tab" });
  return frame();
};

function frame(time: number = 0): Promise<any> {
  return new Promise((resolve, reject) => {
    setTimeout(
      function() {
        resolve();
      },
      time
    );
  });
}


describe("NewAccountPageDisplay", function() {
  let component: NewAccountPageDisplay;
  let filist: FI[];
  let institution: HTMLInputElement;
  let name: HTMLInputElement;
  let web: HTMLInputElement;
  let address: HTMLInputElement;
  let notes: HTMLInputElement;
  let fid: HTMLInputElement;
  let org: HTMLInputElement;
  let ofx: HTMLInputElement;

  const findNodes = () => {
    institution = findNode<HTMLInputElement>(component, "institution", ".Select-input input");
    name = findNode<HTMLInputElement>(component, "name", "input");
    web = findNode<HTMLInputElement>(component, "web", "input");
    address = findNode<HTMLInputElement>(component, "address", "textarea");
    notes = findNode<HTMLInputElement>(component, "notes", "textarea");
    fid = findNode<HTMLInputElement>(component, "fid", "input");
    org = findNode<HTMLInputElement>(component, "org", "input");
    ofx = findNode<HTMLInputElement>(component, "ofx", "input");
  };

  beforeEach(function() {
    let store = createStore(appState);
    let state = store.getState();

    filist = [
      dummyFI(0, "fi0"),
      dummyFI(1, "fi1"),
      dummyFI(2, "fi2"),
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

  it("selecting an institution sets fields", async function() {
    const assertFiValues = (fi: FI) => {
      findNodes();
      expect(name.value).to.equal(fi.name, "name doesn't match");
      expect(web.value).to.equal(fi.profile.siteURL, "web doesn't match");
      expect(address.value).to.equal(
        fi.profile.address1 + "\n" +
        fi.profile.address2 + "\n" +
        fi.profile.address3 + "\n" +
        fi.profile.city + ", " +
        fi.profile.state + " " +
        fi.profile.zip + "\n" +
        fi.profile.country,
        "address doesn't match"
      );
      expect(notes.value).to.equal("", "notes doesn't match");
      expect(fid.value).to.equal(fi.fid, "fid doesn't match");
      expect(org.value).to.equal(fi.org, "org doesn't match");
      expect(ofx.value).to.equal(fi.ofx, "ofx doesn't match");
    };

    findNodes();

    // changing input values changes state
    await simulateChangeTargetValue(name, "asdf");
    expect(component.state.fields.name.value).to.equal("asdf", "state.fields.name doesn't match");
    expect(name.value).to.equal("asdf");
    await simulateChangeTargetValue(name, "");

    // select institution, check fields
    let fi = filist[0];
    await simulateChangeInstitution(institution, fi.name);
    assertFiValues(fi);

    // select different institution; fields should be updated
    fi = filist[1];
    await simulateChangeInstitution(institution, fi.name);
    assertFiValues(fi);

    // select different institution; unchanged fields should be updated
    await simulateChangeTargetValue(name, "asdf");
    fi = filist[2];
    await simulateChangeInstitution(institution, fi.name);
    expect(name.value).to.equal("asdf");
    expect(web.value).to.equal(fi.profile.siteURL, "web doesn't match");

    // changing fid/org/ofx to a different value will provide a warning
    expect(findNode(component, "fid", ".glyphicon-warning-sign")).to.be.null;
    await simulateChangeTargetValue(fid, "wrong");
    expect(findNode(component, "fid", ".glyphicon-warning-sign")).to.be.not.null;
  });
});
