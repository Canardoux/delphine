// ComponentRegistry.ts
// --------------------

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

import { TControl, TMetaControl, TColor, THandler } from './Control';
import type { PropSpec, PropKind } from './Component';
import type { IForm } from './IForm';
//import { TMetaForm, TForm } from './Form';
//import { TMetaObject, TMetaclass, TObject } from './Oops';
//import { TMetaButton, TMetaPanel } from './StdCtrls';
//import { TApplication } from './Application';
import { TMetaclass, TObject } from './Oops';
import type { IPluginHost } from './IPlugin';
import { getApplication } from './IApplication';
import type { IApplication } from './IApplication';
import { TPluginHost } from './Plugin';

export type ComponentFactory = (name: string, form: IForm, owner: TControl) => TControl;

export class TMetaComponentRegistry extends TMetaclass {
        static readonly metaclass: TMetaComponentRegistry = new TMetaComponentRegistry(TMetaclass.metaclass, 'TComponentTypeRegistry');

        protected constructor(superClass: TMetaclass, name: string) {
                super(superClass, name);
        }
        //getMetaclass(): TMetaComponentRegistry {
        //return TMetaComponentRegistry.metaclass;
        //}
}

export class TComponentRegistry extends TObject {
        //_toto: Toto = new Toto();
        //getMetaclass(): TMetaComponentRegistry {
        //return TMetaComponentRegistry.metaclass;
        //}

        private instances = new Map<string, TControl>();

        constructor() {
                super(TMetaComponentRegistry.metaclass);
        }

        registerInstance(name: string, c: TControl) {
                this.instances.set(name, c);
        }
        get<T extends TControl = TControl>(name: string): T | undefined {
                return this.instances.get(name) as T | undefined;
        }

        clear() {
                this.instances.clear();
        }

        // ==================================================================================

        // English comments as requested.

        // Cache: per metaclass -> (propName -> nearest PropSpec or null if not found)
        //private readonly _propSpecCache = new WeakMap<TMetaComponent, Map<string, PropSpec<any> | null>>();
}
