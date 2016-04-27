///<reference path="../typings/main.d.ts"/>
"use strict";
import { expect } from "chai";
import * as ReactDOM from "react-dom";
import TestUtils = require("react-addons-test-utils");

import { FI } from "../src/index";


export function dummyFI(id: number, name: string): FI {
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


export function findNode<T extends Element>(component: Element, selector: string): T {
  expect(component).to.be.not.null;
  return component.querySelector(selector) as T;
}


export function simulateChangeValue(element: HTMLInputElement, value: string) {
  expect(element).to.not.be.null;
  TestUtils.Simulate.change(element, { target: { value } } as React.SyntheticEventData);
  return frame();
}


export function simulateSubmit(form: HTMLFormElement) {
  expect(form).to.not.be.null;
  TestUtils.Simulate.submit(form);
  return frame();
}


export function simulateClick(element: HTMLButtonElement) {
  TestUtils.Simulate.click(element);
  return frame();
}


export function frame(time: number = 0): Promise<any> {
  return new Promise((resolve, reject) => {
    setTimeout(
      function() {
        resolve();
      },
      time
    );
  });
}
