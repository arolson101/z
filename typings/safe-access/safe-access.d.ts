// Type definitions for safe-access
// Project: https://github.com/erictrinh/safe-access
// Definitions by: Andrew Olson <andrew@olsononline.org>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare module "safe-access" {
	interface AutoCurry {
		(path: string): any;
	}

	function access(obj: Object, path: string, ...args: any[]): any;
	function access(obj: Object): AutoCurry;
	
	export = access;
}
