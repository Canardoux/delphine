// StdCtrls.ts

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

import { TControl, TMetaControl } from './Control';
import { TMetaComponent } from './Component';
import { TMetaContainer, TContainer } from './Container';
import type { PropSpec } from './IComponent';
import type { ComponentSchema } from './IComponent';
import type { IForm } from './IForm';
import type { IControl } from './IControl';
import type { TMetaclass } from './Oops';
import { TCompositeControl, TMetaCompositeControl } from './CompositeControl';
import { TComponent } from './Component';
//import { TForm } from './Form';

// --------------------------------------

export class TNonVisualComponents extends TContainer {
        constructor(name: string, form: IForm, parent: TControl) {
                super(TMetaNonVisualComponents.metaclass, name, form, parent);
        }
}

export class TMetaNonVisualComponents extends TMetaContainer {
        static readonly metaclass = new TMetaNonVisualComponents(TMetaContainer.metaclass, 'TNonVisualComponents');

        protected constructor(superClass: TMetaContainer, name: string) {
                super(superClass, name);
        }

        create(name: string, form: IForm, parent: TControl): TContainer {
                return new TNonVisualComponents(name, form, parent);
        }

        defProps(): PropSpec<any>[] {
                return [
                        //{ name: 'caption', kind: 'string', apply: (o, v) => (o.caption = String(v)) },
                        //{ name: 'enabled', kind: 'boolean', apply: (o, v) => (o.enabled = Boolean(v)) }
                ];
        }

        /*
        getSchema(): ComponentSchema | null {
                return {
                        name: this.typeName,
                        label: 'TPanel',
                        category: 'Standard Control',
                        icon: '▭',
                        component: TMetaPanel.metaclass,
                        isContainer: true,
                        instanceName: 'Panel',
                        tagName: 'div',
                        resizable: true,

                        //hoverable: true,
                        //layerable: true,
                        //removable: true,
                        //draggable: true,
                        droppable: true,
                        //copyable: true,

                        props: this.propSpecsToSchemaProps()
                };
        }
                */
}

// ------------------------------------------
