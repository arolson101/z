///<reference path="../project.d.ts"/>

import hash = require("string-hash");


export function colorHash(text: string): string {
  let h = hash(text) % 360;
  return "hsl(" + h + ", 100%, 30%)";
}
