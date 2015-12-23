///<reference path="../project.d.ts"/>
"use strict";

export class EnumEx {
    static getNames(e: any): Array<string> {
        var a: Array<string> = [];
        for (var val in e) {
            if (isNaN(val)) {
                a.push(val);
            }
        }
        return a;
    }

    static getValues<T>(e: any): Array<T> {
        var a: Array<T> = [];
        for (var val in e) {
            if (!isNaN(val)) {
                a.push(<T><any>parseInt(val, 10));
            }
        }
        return a;
    }
    
    static map<T,X>(e: any, cb: (name: string, value: T) => X): Array<X> {
        var a: Array<X> = [];
        for(var val in e) {
            if(!isNaN(val)) {
                var value: T = <T><any>parseInt(val, 10);
                var name = e[val];
                a.push( cb(name, value) );
            }
        }
        return a;
    }
    
    static each<T>(e: any, cb: (name: string, value: T) => any): void {
        for(var val in e) {
            if(!isNaN(val)) {
                var value: T = <T><any>parseInt(val, 10);
                var name = e[val];
                cb(name, value);
            }
        }
    }
}
