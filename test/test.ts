///<reference path='../typings/tsd.d.ts'/>

import { expect } from 'chai';

import { todoApp, initialState, addTodo } from "../src/index";

describe('z', function() {
	it('can add a todo', function() {
		var state = todoApp();
		console.log("initial state: ", state);
		expect(state).to.deep.equal(initialState);
		
		var state2 = todoApp(state, addTodo("new"));
	});
});
