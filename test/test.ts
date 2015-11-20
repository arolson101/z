///<reference path='../typings/tsd.d.ts'/>

import { expect } from 'chai';

import { appState,
	nullAction,
	Account, addAccount, editAccount, deleteAccount,
	Institution, addInstitution, editInstitution, deleteInstitution
 } from "../src/index";

describe('z', function() {
	it('add/remove/delete accounts', function() {
		let state = appState();

		let acct: Account = {dbid: 123, name: "foo"};
		let add = addAccount(acct);
		let state2 = appState(state, add);
		expect(state2).not.to.deep.equal(state);
		expect(state2.accounts[123]).to.deep.equal(acct);
		
		let uacct: Account = {dbid: 123, name: "bar"};
		let change = editAccount(123, { name: {$set: "bar"} });
		let state3 = appState(state2, change);
		expect(state3.accounts[123]).to.deep.equal(uacct);

		let del = deleteAccount(123);
		let state4 = appState(state3, del);
		expect(state4).to.deep.equal(state);
	});

	it('add/remove/delete institutions', function() {
		let state = appState();

		let institution: Institution = {dbid: 123, web: "foo"};
		let add = addInstitution(institution);
		let state2 = appState(state, add);
		expect(state2).not.to.deep.equal(state);
		expect(state2.institutions[123]).to.deep.equal(institution);
		
		let uinstitution: Institution = {dbid: 123, web: "bar"};
		let change = editInstitution(123, { web: {$set: "bar"} });
		let state3 = appState(state2, change);
		expect(state3.institutions[123]).to.deep.equal(uinstitution);

		let del = deleteInstitution(123);
		let state4 = appState(state3, del);
		expect(state4).to.deep.equal(state);
	});
	

});
