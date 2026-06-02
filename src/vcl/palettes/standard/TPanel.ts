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

import { TControl, TMetaControl } from '../../Control';
import { TMetaComponent } from '../../Component';
import { TMetaContainer, TContainer } from '../../Container';
import type { PropSpec } from '../../IComponent';
import type { ComponentSchema } from '../../IComponent';
import type { IForm } from '../../IForm';
import type { IControl } from '../../IControl';
import type { TMetaclass } from '../../Oops';
import { TCompositeControl, TMetaCompositeControl } from '../../CompositeControl';
import { TComponent } from '../../Component';
//import { TForm } from './Form';

// --------------------------------------

export class TPanel extends TContainer {
        constructor(name: string, form: IForm, parent: TControl) {
                super(TMetaPanel.metaclass, name, form, parent);
        }
}

export class TMetaPanel extends TMetaContainer {
        static readonly metaclass = new TMetaPanel(TMetaContainer.metaclass, 'TPanel');

        protected constructor(superClass: TMetaContainer, name: string) {
                super(superClass, name);
        }

        create(name: string, form: IForm, parent: TControl): TPanel {
                return new TPanel(name, form, parent);
        }

        defProps(): PropSpec<any>[] {
                return [
                        //{ name: 'caption', kind: 'string', apply: (o, v) => (o.caption = String(v)) },
                        //{ name: 'enabled', kind: 'boolean', apply: (o, v) => (o.enabled = Boolean(v)) }
                ];
        }

        getSchema(): ComponentSchema | null {
                return {
                        name: this.typeName,
                        label: 'TPanel',
                        category: 'Standard Control',
                        //icon: '▭',
                        icon: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="48" height="48">
<path d="M0 0 C11.88 0 23.76 0 36 0 C36 11.88 36 23.76 36 36 C24.12 36 12.24 36 0 36 C0 24.12 0 12.24 0 0 Z " fill="#E2EBF9" transform="translate(6,8)"/>
</svg>`,
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
}
