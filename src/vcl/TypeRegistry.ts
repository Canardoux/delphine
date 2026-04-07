// TypeRegistry.ts
// ---------------

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

import { TMetaObject, TObject } from './Oops';
import { TMetaComponent } from './Component';
import type { IMetaComponent } from './IComponent';
import type { ComponentSchema } from './IComponent';

/*
export class TMetaTypeRegistry extends TMetaObject {
        static readonly metaclass: TMetaTypeRegistry = new TMetaTypeRegistry(TMetaObject.metaclass, 'TComponentTypeRegistry');
        protected constructor(superClass: TMetaObject, name: string) {
                super(superClass, name);
                // et vous changez juste le nom :
        }
        //getMetaclass(): TMetaComponentTypeRegistry {
        //return TMetaComponentTypeRegistry.metaclass;
        //}
}
        */

export class TTypeRegistry /*extends TObject*/ {
        // We store heterogeneous metas, so we keep them as TMetaComponent<any>.
        //getMetaclass(): TMetaComponentTypeRegistry {
        //return TMetaComponentTypeRegistry.metaclass;
        //}
        private readonly componentsClass = new Map<string, TMetaComponent>();

        getAll(): IMetaComponent[] {
                return [...this.componentsClass.values()];
        }

        register(mc: TMetaComponent) {
                if (this.componentsClass.has(mc.typeName)) {
                        throw new Error(`Component type already registered: ${mc.typeName}`);
                }
                this.componentsClass.set(mc.typeName, mc);
        }

        // If you just need "something meta", return any-meta.
        get(typeName: string) {
                return this.componentsClass.get(typeName);
        }

        has(typeName: string): boolean {
                return this.componentsClass.has(typeName);
        }

        list(): string[] {
                return [...this.componentsClass.keys()].sort();
        }
}
