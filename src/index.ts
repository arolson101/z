console.log("hello 2");


export function foo(x: number) {
	if (x)
		return 42;
	else
		return 41;
}

export function bar() {
	return 41;
}

export class Foo {
	foo() {
		return 0;
	}
}

export class Bar extends Foo {
	bar() {
		return this.foo();
	}
}
