///<reference path='../src/typings/tsd.d.ts'/>

import { expect } from 'chai';

var z = require('../src');

describe('z', function() {
	it('should be ok', function() {
		expect(z.foo(0)).to.equal(41);
		expect(z.foo(1)).to.equal(42);
		expect(z.bar()).to.equal(41);
		var b = new z.Bar();
		b.bar();
	});
});
