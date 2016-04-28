///<reference path="../typings/main.d.ts"/>
"use strict";
import { expect } from "chai";
import { createStore } from "redux";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-addons-test-utils";
import * as sinon from "sinon";

import { dummyFI, findNode, simulateChangeValue, simulateClick, simulateSubmit, frame } from "./util";

import {
  appState,
  loadLocale,
  NewAccountPageDisplay,
  FI,
  AccountType
 } from "../src/index";
import { AddAccountDialog } from "../src/dialogs";


const simulateChangeInstitution = async function(institution: HTMLInputElement, value: string) {
  simulateChangeValue(institution, value);
  TestUtils.Simulate.keyDown(institution, { keyCode: 9, key: "Tab" });
  return frame();
};


describe("NewAccountPageDisplay", function() {
  before(function() {
    return loadLocale("en-US");
  });

  let component: NewAccountPageDisplay;
  let componentNode: Element;
  let filist: FI[];
  let institution: HTMLInputElement;
  let name: HTMLInputElement;
  let web: HTMLInputElement;
  let address: HTMLInputElement;
  let notes: HTMLInputElement;
  let fid: HTMLInputElement;
  let org: HTMLInputElement;
  let ofx: HTMLInputElement;
  let addAccount: HTMLButtonElement;
  let updraftAdd: Sinon.SinonSpy;

  const findNodes = () => {
    componentNode = ReactDOM.findDOMNode(component);
    institution = findNode<HTMLInputElement>(componentNode, "input#institution");
    name = findNode<HTMLInputElement>(componentNode, "input#name");
    web = findNode<HTMLInputElement>(componentNode, "input#web");
    address = findNode<HTMLInputElement>(componentNode, "textarea#address");
    notes = findNode<HTMLInputElement>(componentNode, "textarea#notes");
    fid = findNode<HTMLInputElement>(componentNode, "input#fid");
    org = findNode<HTMLInputElement>(componentNode, "input#org");
    ofx = findNode<HTMLInputElement>(componentNode, "input#ofx");
    addAccount = findNode<HTMLButtonElement>(componentNode, "button#addAccount");
  };

  beforeEach(function() {
    let store = createStore(appState);
    let state = store.getState();
    updraftAdd = sinon.spy();

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
        updraftAdd={updraftAdd}
      />
    ) as any;

    findNodes();
  });

  describe("create accounts", function() {
    it("selecting an institution sets fields", async function() {
      const assertFiValues = (fi: FI) => {
        expect(name).to.have.property("value", fi.name, "name doesn't match");
        expect(web).to.have.property("value", fi.profile.siteURL, "web doesn't match");
        expect(address).to.have.property(
          "value",
          fi.profile.address1 + "\n" +
          fi.profile.address2 + "\n" +
          fi.profile.address3 + "\n" +
          fi.profile.city + ", " +
          fi.profile.state + " " +
          fi.profile.zip + "\n" +
          fi.profile.country,
          "address doesn't match"
        );
        expect(notes).to.have.property("value", "", "notes doesn't match");
        expect(fid).to.have.property("value", fi.fid, "fid doesn't match");
        expect(org).to.have.property("value", fi.org, "org doesn't match");
        expect(ofx).to.have.property("value", fi.ofx, "ofx doesn't match");
      };

      // quick sanity check- changing input values also changes component state
      await simulateChangeValue(name, "asdf");
      expect(component.state.fields.name).to.have.property("value", "asdf", "state.fields.name doesn't match");
      expect(name).to.have.property("value", "asdf");
      await simulateChangeValue(name, "");

      // select institution, check fields
      let fi = filist[0];
      await simulateChangeInstitution(institution, fi.name);
      assertFiValues(fi);

      // select different institution; fields should be updated
      fi = filist[1];
      await simulateChangeInstitution(institution, fi.name);
      assertFiValues(fi);

      // select different institution; unchanged fields should be updated
      await simulateChangeValue(name, "different name");
      fi = filist[2];
      await simulateChangeInstitution(institution, fi.name);
      expect(name).to.have.property("value", "different name");
      expect(web).to.have.property("value", fi.profile.siteURL, "web doesn't match");
    });


    it("shows a warning if fid/org/ofx are different", async function() {
      let fi = filist[0];
      await simulateChangeInstitution(institution, fi.name);

      for (let key of ["fid", "org", "ofx"]) {
        expect(findNode(componentNode, `input#${key} ~ .glyphicon-warning-sign`)).to.be.null;
        const node = findNode<HTMLInputElement>(componentNode, `input#${key}`);
        await simulateChangeValue(node, "different value");
        expect(findNode(componentNode, `input#${key} ~ .glyphicon-warning-sign`)).to.be.not.null;
      }
    });


    it("submit does nothing when name or accounts are empty", async function() {
      const submit = findNode<HTMLButtonElement>(componentNode, "button#submit");

      // saving initially does nothing
      await simulateClick(submit);
      expect(updraftAdd).to.have.not.been.called;

      // set name
      await simulateChangeValue(name, "dummy name");
      await simulateClick(submit);
      expect(updraftAdd).to.have.not.been.called;

      // add account
      component.onAccountSave({type: AccountType.CHECKING, name: "dummy account name", number: "1234"});
      await frame();
      await simulateClick(submit);
      expect(updraftAdd).to.have.been.calledOnce;
    });


    it("adds accounts", async function() {
      await simulateClick(addAccount);
      await frame();
      await frame();
      findNodes();
      let addAccountDialog = component.refs["addAccountDialog"] as AddAccountDialog;
      let nameInput = ReactDOM.findDOMNode<HTMLInputElement>(addAccountDialog.refs["name"]);
      let numberInput = ReactDOM.findDOMNode<HTMLInputElement>(addAccountDialog.refs["number"]);
      let form = ReactDOM.findDOMNode<HTMLFormElement>(addAccountDialog.refs["form"]);
      await simulateChangeValue(nameInput, "checking");
      await simulateChangeValue(numberInput, "12345");
      await simulateSubmit(form);
      expect(component.state.accounts).to.have.length(1);
    });


    it("downloads account list from server");
  });


  describe("editing accounts", function() {
    it("finds the institution");
    it("change name");
    it("change details");

    describe("accounts", function() {
      it("add");
      it("remove");
      it("rename");
      it("change number");
    });
  });
});
