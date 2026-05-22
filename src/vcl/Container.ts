// Container.ts
// --------------

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

import type { IForm } from './IForm';
import type { TMetaclass } from './Oops';
import { TControl, TMetaControl } from './Control';
import type { PropSpec } from './IComponent';
import { TComponent } from './Component';

// This clas does not do anything except overrides allowsChildren()
export class TContainer extends TControl {
        //getMetaclass(): TMetaContainer {
        //return TMetaContainer.metaclass;
        //}

        //private get cprops(): ContainerProps {
        //return this.props as ContainerProps;
        children: TComponent[] = [];
        //nonVisualComponents: TComponent[] = [];

        //}

        constructor(metaclass: TMetaclass, name: string, form: IForm | null, parent: TControl | null) {
                super(metaclass, name, form, parent);
        }

        /*
        syncDomFromProps() {
                const el = this.htmlElement;
                if (!el) return;

                super.syncDomFromProps();
        }
                */

        allowsChildren(): boolean {
                return true;
        }
}

export class TMetaContainer extends TMetaControl {
        static metaclass: TMetaContainer = new TMetaContainer(TMetaControl.metaclass, 'TContainer');

        protected constructor(superClass: TMetaControl, name: string) {
                super(superClass, name);
        }
        //getMetaclass() {
        //return TMetaContainer.metaclass;
        //}

        create(name: string, form: IForm, parent: TControl): TContainer {
                return new TContainer(TMetaContainer.metaclass, name, form, parent);
        }

        defProps(): PropSpec<any>[] {
                return [
                        //{ name: 'caption', kind: 'string', apply: (o, v) => (o.caption = String(v)) },
                        //{ name: 'enabled', kind: 'boolean', apply: (o, v) => (o.enabled = Boolean(v)) }
                ];
        }
}
