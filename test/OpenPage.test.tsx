///<reference path="../typings/main.d.ts"/>
"use strict";
import { expect } from "chai";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-addons-test-utils";
import * as sinon from "sinon";

import { findNode, simulateChangeValue, simulateClick, simulateSubmit, frame } from "./util";

import {
  sys,
  t,
  loadLocale,
  OpenPageDisplay,
  OpenStoreInfo,
  StoreInfo
 } from "../src/index";
import { OpenDialog } from "../src/dialogs";


function dummyStoreInfo(name: string): StoreInfo {
  return {
    name,
    path: name + " path",
    size: 1024,
    lastModified: new Date()
  };
}

describe("OpenPageDisplay", function() {
  before(function() {
    return loadLocale("en-US");
  });

  let component: OpenPageDisplay;
  let componentNode: Element;

  const findNodes = () => {
    componentNode = ReactDOM.findDOMNode(component);
  };

  const setup = (
    updraftOpen: (info: OpenStoreInfo) => Promise<any>,
    onOpened: Function,
    locale: string,
    stores: StoreInfo[]
  ) => {
    component = TestUtils.renderIntoDocument(
      <OpenPageDisplay
        updraftOpen={updraftOpen}
        onOpened={onOpened}
        locale={locale}
        stores={stores}
      />
    ) as any;
    findNodes();
  };

  it("doesn't render unless locale is set", function() {
    setup(null, null, "", []);

    expect(componentNode.id).to.equal("waiting");

    setup(null, null, "en-US", []);
    expect(componentNode.id).not.to.equal("waiting");
  });

  it("displays available stores", function() {
    const stores: StoreInfo[] = [
      dummyStoreInfo("store1"),
      dummyStoreInfo("store2"),
      dummyStoreInfo("store3"),
    ];
    setup(null, null, "en-US", stores);

    let items = componentNode.querySelectorAll(".openPageExistingItem");
    expect(items).to.have.length(stores.length);
  });

  describe("creating stores", function() {
    it("can create a store", async function() {
      const updraftOpen = sinon.spy(() => Promise.resolve());
      const onOpened = sinon.spy();
      setup(updraftOpen, onOpened, "en-US", []);

      let createItem = componentNode.querySelector(".openPageCreateItem");
      await simulateClick(createItem);

      const openDialog = component.refs["openDialog"] as OpenDialog;
      let nameInput = ReactDOM.findDOMNode<HTMLInputElement>(openDialog.refs["name"]);
      let password1Input = ReactDOM.findDOMNode<HTMLInputElement>(openDialog.refs["password1"]);
      let password2Input = ReactDOM.findDOMNode<HTMLInputElement>(openDialog.refs["password2"]);
      let form = ReactDOM.findDOMNode<HTMLFormElement>(openDialog.refs["form"]);

      const opts: OpenStoreInfo = {
        name: "dummy name",
        password: "dummy password",
        create: true
      };
      await simulateChangeValue(nameInput, opts.name);
      if (sys.supportsPassword()) {
        await simulateChangeValue(password1Input, opts.password);
        await simulateChangeValue(password2Input, opts.password);
      }
      else {
        delete opts.password;
      }
      await simulateSubmit(form);

      expect(updraftOpen).to.have.been.calledWith(opts);
      expect(onOpened).to.have.callCount(1);
    });

    it("won't overwrite existing stores", async function() {
      const updraftOpen = sinon.spy(() => Promise.resolve());
      const onOpened = sinon.spy();
      const existingDbName = "existing";
      const password = "dummy password";
      setup(updraftOpen, onOpened, "en-US", [dummyStoreInfo(existingDbName)]);

      let createItem = componentNode.querySelector(".openPageCreateItem");
      await simulateClick(createItem);

      const openDialog = component.refs["openDialog"] as OpenDialog;
      let nameInput = ReactDOM.findDOMNode<HTMLInputElement>(openDialog.refs["name"]);
      let password1Input = ReactDOM.findDOMNode<HTMLInputElement>(openDialog.refs["password1"]);
      let password2Input = ReactDOM.findDOMNode<HTMLInputElement>(openDialog.refs["password2"]);
      let form = ReactDOM.findDOMNode<HTMLFormElement>(openDialog.refs["form"]);

      await simulateChangeValue(nameInput, existingDbName);
      if (sys.supportsPassword()) {
        await simulateChangeValue(password1Input, password);
        await simulateChangeValue(password2Input, password);
      }
      await simulateSubmit(form);

      expect(updraftOpen).not.to.have.been.called;
      expect(onOpened).not.to.have.been.called;
    });

    it("passwords must match", async function() {
      const updraftOpen = sinon.spy();
      const onOpened = sinon.spy();
      setup(updraftOpen, onOpened, "en-US", []);

      expect(sys.supportsPassword()).to.be.true;
      expect(t("validate.unique")).to.be.ok; // string translation must return *something* otherwise errors won't be recognized

      let createItem = componentNode.querySelector(".openPageCreateItem");
      await simulateClick(createItem);

      const openDialog = component.refs["openDialog"] as OpenDialog;
      let nameInput = ReactDOM.findDOMNode<HTMLInputElement>(openDialog.refs["name"]);
      let password1Input = ReactDOM.findDOMNode<HTMLInputElement>(openDialog.refs["password1"]);
      let password2Input = ReactDOM.findDOMNode<HTMLInputElement>(openDialog.refs["password2"]);
      let form = ReactDOM.findDOMNode<HTMLFormElement>(openDialog.refs["form"]);

      await simulateChangeValue(nameInput, "dummy store");
      if (sys.supportsPassword()) {
        await simulateChangeValue(password1Input, "dummy password");
        await simulateChangeValue(password2Input, "different password");
      }
      await simulateSubmit(form);

      expect(updraftOpen).not.to.have.been.called;
      expect(onOpened).not.to.have.been.called;
    });
  });

  it("can open existing stores", async function() {
    const updraftOpen = sinon.spy(() => Promise.resolve());
    const onOpened = sinon.spy();
    const stores: StoreInfo[] = [
      dummyStoreInfo("store1"),
      dummyStoreInfo("store2"),
      dummyStoreInfo("store3"),
    ];
    setup(updraftOpen, onOpened, "en-US", stores);

    const openIndex = 1;
    const opts: OpenStoreInfo = {
      name: stores[openIndex].name,
      password: "dummy password",
      create: false
    };

    let openItem = componentNode.querySelectorAll(".openPageExistingItem")[openIndex];
    await simulateClick(openItem);

    const openDialog = component.refs["openDialog"] as OpenDialog;
    let nameInput = ReactDOM.findDOMNode<HTMLInputElement>(openDialog.refs["name"]);
    let password1Input = ReactDOM.findDOMNode<HTMLInputElement>(openDialog.refs["password1"]);
    let form = ReactDOM.findDOMNode<HTMLFormElement>(openDialog.refs["form"]);

    expect(nameInput.value).to.equal(opts.name);

    if (sys.supportsPassword()) {
      await simulateChangeValue(password1Input, opts.password);
    }
    else {
      delete opts.password;
    }
    await simulateSubmit(form);

    expect(updraftOpen).to.have.callCount(1);
    expect(updraftOpen).to.have.been.calledWith(opts);
    expect(onOpened).to.have.callCount(1);
  });

  it("displays error message if open fails", async function() {
    const errmsg = "test error message";
    const updraftOpen = sinon.spy(() => Promise.reject(new Error(errmsg)));
    const onOpened = sinon.spy();
    const stores: StoreInfo[] = [
      dummyStoreInfo("store1"),
    ];
    setup(updraftOpen, onOpened, "en-US", stores);

    const openIndex = 0;
    const opts: OpenStoreInfo = {
      name: stores[openIndex].name,
      password: "dummy password",
      create: false
    };

    let openItem = componentNode.querySelectorAll(".openPageExistingItem")[openIndex];
    await simulateClick(openItem);

    const openDialog = component.refs["openDialog"] as OpenDialog;
    let nameInput = ReactDOM.findDOMNode<HTMLInputElement>(openDialog.refs["name"]);
    let password1Input = ReactDOM.findDOMNode<HTMLInputElement>(openDialog.refs["password1"]);
    let form = ReactDOM.findDOMNode<HTMLFormElement>(openDialog.refs["form"]);

    expect(nameInput.value).to.equal(opts.name);

    if (sys.supportsPassword()) {
      await simulateChangeValue(password1Input, opts.password);
    }
    else {
      delete opts.password;
    }
    await simulateSubmit(form);

    expect(updraftOpen).to.have.been.calledWith(opts);
    expect(onOpened).to.have.callCount(0);
  });

});
