// Type definitions for react-ladda
// Project: https://github.com/jsdir/react-ladda
// Definitions by: Andrew Olson <andrew@olsononline.org>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/// <reference path="../react/react.d.ts" />

declare module "react-ladda" {
	var LaddaButton:__React.ComponentClass<LaddaButtonAttributes>;

	interface LaddaButtonAttributes extends __React.HTMLAttributes {
		active?: boolean;
	}

	export = LaddaButton;
}

interface LaddaButtonAttributes extends __React.DOMAttributes
{
	progress?:number;
	color?:string;
	size?:string;
	spinnerSize?:number;
	spinnerColor?:number;
	style?:string;
}
