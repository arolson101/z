///<reference path='../typings/tsd.d.ts'/>

import { expect } from 'chai';

import { todoApp, initialState, addTodo,
	nullAction,
	Account, accountState, addAccount, editAccount, deleteAccount } from "../src/index";

describe('z', function() {
	it('add/remove/delete accounts', function() {
		let state = accountState();

		let acct: Account = {dbid: 123, name: "foo"};
		let add = addAccount(acct);
		let state2 = accountState(state, add);
		expect(state2).not.to.deep.equal(state);
		expect(state2.accounts[123]).to.deep.equal(acct);
		
		let uacct: Account = {dbid: 123, name: "bar"};
		let change = editAccount(123, { name: {$set: "bar"} });
		let state3 = accountState(state2, change);
		expect(state3.accounts[123]).to.deep.equal(uacct);

		let del = deleteAccount(123);
		let state4 = accountState(state3, del);
		expect(state4).to.deep.equal(state);
	});
});
