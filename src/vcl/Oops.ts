// Opps.ts

/*
 * Copyright 2026 Canardoux.
 *
 * This file is part of the Delphine project.
 *
 * Delphine is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 (GPL3), as published by
 * the Free Software Foundation.
 *
 * Delphine is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Delphine.  If not, see <https://www.gnu.org/licenses/>.
 */

export abstract class TMetaclass {
        readonly typeName: string = 'TMetaclass';
        static metaclass: TMetaclass;
        readonly superClass: TMetaclass | null = null;

        //getMetaclass(): TMetaclass {
        //return this.metaclass;
        //}
        protected constructor(superClass: TMetaclass | null, typeName = 'TMetaclass') {
                //this.metaclass = metaclass;
                this.superClass = superClass;
                this.typeName = typeName;
        }
        getPropSpecs(): any[] {
                return [];
        }
}

export class TObject {
        metaclass: TMetaclass;
        constructor(metaclass: TMetaclass) {
                this.metaclass = metaclass;
        }
        getMetaclass(): TMetaObject {
                return this.metaclass;
        }
}

export class TMetaObject extends TMetaclass {
        static metaclass: TMetaObject = new TMetaObject(TMetaclass.metaclass, 'TObject');

        //getMetaclass(): TMetaObject {
        //return TMetaObject.metaclass;
        //}
        constructor(superClass: TMetaclass, name: string) {
                super(superClass, name);
        }
}

export function findMethod(obj: any, name: string): Function | null {
        let o = obj;
        while (o) {
                const desc = Object.getOwnPropertyDescriptor(o, name);
                if (desc && typeof desc.value === 'function') {
                        return desc.value;
                }
                o = Object.getPrototypeOf(o);
        }
        return null;
}

export function dumpObject(obj: any) {
        let o = obj;
        while (o) {
                console.log('----', o.constructor?.name);
                console.log(Object.getOwnPropertyNames(o));
                o = Object.getPrototypeOf(o);
        }
}

export type UnknownRecord = Record<string, unknown>;

// Debug.ts

export function assert(condition: unknown, message: string): asserts condition {
        if (!condition) {
                debugger;
                throw new Error(message);
        }
}

export function unreachable(message = 'Unreachable code'): never {
        debugger;
        throw new Error(message);
}

export function todo(message = 'TODO'): never {
        debugger;
        throw new Error(message);
}
