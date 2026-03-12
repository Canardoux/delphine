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

        abstract getMetaclass(): TMetaclass;
        protected constructor(superClass: TMetaclass | null, typeName = 'TMetaclass') {
                this.superClass = superClass;
                this.typeName = typeName;
        }
}

export class TObject {
        getMetaClass(): TMetaObject {
                return TMetaObject.metaClass;
        }
}

export class TMetaObject extends TMetaclass {
        static readonly metaClass: TMetaObject = new TMetaObject(TMetaclass.metaclass, 'TObject');

        getMetaclass(): TMetaObject {
                return TMetaObject.metaClass;
        }
        constructor(superClass: TMetaclass, name: string) {
                super(superClass, name);
        }
}
