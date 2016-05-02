///<reference path="../typings/main.d.ts"/>
"use strict";
import { expect } from "chai";
import TestUtils = require("react-addons-test-utils");

import { FI, AccountType, Account, AccountCollection, Institution, InstitutionCollection } from "../src/index";


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


export function dummyAccount(type: AccountType, name: string, number: string, id?: number, institutionId?: number): Account {
  let acct: Account = {
    name,
    number,
    type,
    balance: 100.25
  };

  if (id) {
    acct.dbid = id;
  }

  if (institutionId) {
    acct.institution = institutionId;
  }

  return acct;
}


export function dummyInstitution(id: number, name: string): Institution {
  return {
    dbid: id,
    name,
    web: "http://" + name,
    address: "123 " + name + " st\n" + name + " City, ZZ, 12345",
    notes: "notes about " + name,
    online: true,
    fid: name + " fid",
    org: name + " org",
    ofx: name + " ofx",
    username: name + " username",
    password: name + " password"
  };
}


export function dummyInstitutionCollection(fis: FI[]): InstitutionCollection {
  const icol: InstitutionCollection = {};
  fis.forEach((fi: FI, idx: number) => {
    const id = idx + 100;
    icol[id] = {
      dbid: id,
      name: fi.name,
      web: fi.profile.siteURL,
      address: fi.profile.address1,
      notes: "notes about " + fi.name,
      online: true,
      fid: fi.fid,
      org: fi.org,
      ofx: fi.ofx,
      username: name + " username",
      password: name + " password"
    };
  });
  return icol;
}


export function dummyAccountsCollection(icol: InstitutionCollection): AccountCollection {
  const acol: AccountCollection = {};
  let id = 1000;
  _.forEach(icol, (institution: Institution) => {
    let acct = dummyAccount(AccountType.CHECKING, institution.name + " checking", institution.dbid + "001", id, institution.dbid);
    acol[acct.dbid] = acct;
    id++;

    acct = dummyAccount(AccountType.SAVINGS, institution.name + " savings", institution.dbid + "002", id, institution.dbid);
    acol[acct.dbid] = acct;
    id++;
  });
  return acol;
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


export function simulateClick(element: Element) {
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
