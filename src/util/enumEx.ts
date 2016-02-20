///<reference path="../project.d.ts"/>

import { TypeScriptEnum } from "updraft";


export interface EnumType extends TypeScriptEnum {
  parse<E>(idx: string): E;
  tr(name: string): string;
}


export class EnumEx {
  static getNames(e: any): Array<string> {
    let a: Array<string> = [];
    for (let val in e) {
      if (isNaN(val)) {
        a.push(val);
      }
    }
    return a;
  }

  static getValues<T>(e: any): Array<T> {
    let a: Array<T> = [];
    for (let val in e) {
      if (!isNaN(val)) {
        a.push(<T><any>parseInt(val, 10));
      }
    }
    return a;
  }

  static map<T, X>(e: any, cb: (name: string, value: T) => X): Array<X> {
    let a: Array<X> = [];
    for (let val in e) {
      if (!isNaN(val)) {
        let value: T = <T><any>parseInt(val, 10);
        let name = e[val];
        a.push( cb(name, value) );
      }
    }
    return a;
  }

  static each<T>(e: any, cb: (name: string, value: T) => any): void {
    for (let val in e) {
      if (!isNaN(val)) {
        let value: T = <T><any>parseInt(val, 10);
        let name = e[val];
        cb(name, value);
      }
    }
  }
}
