///<reference path="../typings/main.d.ts"/>
"use strict";
import { expect } from "chai";
import { createStore } from "redux";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-addons-test-utils";
import * as sinon from "sinon";

import { dummyFI, dummyAcount, findNode, simulateChangeValue, simulateClick, simulateSubmit, frame } from "./util";

import {
  appState,
  loadLocale,
  InstitutionEditPageDisplay,
  FI,
  Account,
  AccountType,
  ReadAccountProfilesParams,
  AccountEditDialog
 } from "../src";


const simulateChangeInstitution = async function(institution: HTMLInputElement, value: string) {
  simulateChangeValue(institution, value);
  TestUtils.Simulate.keyDown(institution, { keyCode: 9, key: "Tab" });
  return frame();
};


describe("InstitutionEditPage", function() {
  before(function() {
    return loadLocale("en-US");
  });

  let component: InstitutionEditPageDisplay;
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
  let username: HTMLInputElement;
  let password: HTMLInputElement;
  let getAccountList: HTMLButtonElement;
  let addAccount: HTMLButtonElement;
  let updraftAdd: Sinon.SinonSpy;
  let readAccountProfiles: Sinon.SinonSpy;
  let readAccountProfiles_return: Promise<Account[]>;

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
    username = findNode<HTMLInputElement>(componentNode, "input#username");
    password = findNode<HTMLInputElement>(componentNode, "input#password");
    getAccountList = findNode<HTMLButtonElement>(componentNode, "button#getAccountList");
    addAccount = findNode<HTMLButtonElement>(componentNode, "button#addAccount");
  };

  beforeEach(function() {
    let store = createStore(appState);
    let state = store.getState();
    updraftAdd = sinon.spy();
    readAccountProfiles = sinon.spy(() => readAccountProfiles_return);

    filist = [
      dummyFI(0, "fi0"),
      dummyFI(1, "fi1"),
      dummyFI(2, "fi2"),
    ];

    component = TestUtils.renderIntoDocument(
      <InstitutionEditPageDisplay
        filist={filist}
        institutions={state.institutions}
        accounts={state.accounts}
        updraft={state.updraft}
        updraftAdd={updraftAdd}
        readAccountProfiles={readAccountProfiles}
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
      findNodes();
      let accountEditDialog = component.refs["accountEditDialog"] as AccountEditDialog;
      let nameInput = ReactDOM.findDOMNode<HTMLInputElement>(accountEditDialog.refs["name"]);
      let numberInput = ReactDOM.findDOMNode<HTMLInputElement>(accountEditDialog.refs["number"]);
      let form = ReactDOM.findDOMNode<HTMLFormElement>(accountEditDialog.refs["form"]);
      await simulateChangeValue(nameInput, "checking");
      await simulateChangeValue(numberInput, "12345");
      await simulateSubmit(form);
      expect(component.state.accounts).to.have.length(1);
    });


    it("downloads account list from server", async function() {
      const params: ReadAccountProfilesParams = {
        fid: "dummy fid",
        org: "dummy org",
        ofx: "dummy ofx",
        name: "dummy name",
        username: "dummy username",
        password: "dummy password",
      };
      const accounts = [
        dummyAcount(AccountType.CHECKING, "Dummy Checking", "0001230"),
        dummyAcount(AccountType.SAVINGS, "Dummy Savings", "0001231"),
        dummyAcount(AccountType.CREDITCARD, "Dummy Credit", "0001232"),
      ];
      readAccountProfiles_return = Promise.resolve(accounts);
      await simulateChangeValue(name, params.name);
      await simulateChangeValue(fid, params.fid);
      await simulateChangeValue(org, params.org);
      await simulateChangeValue(ofx, params.ofx);
      await simulateChangeValue(username, params.username);
      await simulateChangeValue(password, params.password);
      await simulateClick(getAccountList);
      expect(readAccountProfiles).to.have.been.calledOnce;
      expect(readAccountProfiles).to.have.been.calledWith(params);
      expect(component.state.accounts).to.have.length(accounts.length);
      for (let i = 0; i < accounts.length; i++) {
        expect(component.state.accounts[i].name).to.equal(accounts[i].name);
        expect(component.state.accounts[i].number).to.equal(accounts[i].number);
        expect(component.state.accounts[i].type).to.equal(accounts[i].type);
      }
    });


    it("displays error if account list download failed", async function() {
      const params: ReadAccountProfilesParams = {
        fid: "dummy fid",
        org: "dummy org",
        ofx: "dummy ofx",
        name: "dummy name",
        username: "dummy username",
        password: "dummy password",
      };
      const err = new Error("dummy error message");
      readAccountProfiles_return = Promise.reject(err);
      await simulateChangeValue(name, params.name);
      await simulateChangeValue(fid, params.fid);
      await simulateChangeValue(org, params.org);
      await simulateChangeValue(ofx, params.ofx);
      await simulateChangeValue(username, params.username);
      await simulateChangeValue(password, params.password);
      await simulateClick(getAccountList);
      expect(readAccountProfiles).to.have.been.calledOnce;
      expect(component.state.accounts).to.have.length(0);
      expect(component.state.gettingAccountsError).to.equal(err.toString());
      const msgnode = findNode<HTMLElement>(componentNode, "#gettingAccountsErrorMessage");
      expect(msgnode.textContent).to.equal(err.toString());
    });
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
