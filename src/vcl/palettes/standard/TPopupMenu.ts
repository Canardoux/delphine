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

export class TPopupMenu extends TComponent {
        constructor(name: string, form: IForm, parent: TControl) {
                super(TMetaPopupMenu.metaclass, name, form, parent);
        }
}

export class TMetaPopupMenu extends TMetaComponent {
        static readonly metaclass = new TMetaPopupMenu(TMetaComponent.metaclass, 'TPopupMenu');

        protected constructor(superClass: TMetaComponent, name: string) {
                super(superClass, name);
        }

        create(name: string, form: IForm, parent: TControl): TPopupMenu {
                return new TPopupMenu(name, form, parent);
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
                        label: 'TPopupMenu',
                        category: 'Standard Control',
                        icon: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="48" height="48">
<path d="M0 0 C7.92 0 15.84 0 24 0 C24.125 10.125 24.125 10.125 24.11767578 13.28173828 C24.18812667 18.39495694 24.18812667 18.39495694 26.39794922 22.84716797 C27.920193 24.24438146 29.45928039 25.62318673 31 27 C31.3671875 29.5546875 31.3671875 29.5546875 30.875 31.875 C30.72804688 32.65617187 30.58109375 33.43734375 30.4296875 34.2421875 C30.21699219 35.11230469 30.21699219 35.11230469 30 36 C28.02 36.66 26.04 37.32 24 38 C23.505 35.525 23.505 35.525 23 33 C21.02 33.495 21.02 33.495 19 34 C19 33.34 19 32.68 19 32 C12.73 32 6.46 32 0 32 C0 21.44 0 10.88 0 0 Z " fill="#C8D6EC" transform="translate(8,8)"/>
<path d="M0 0 C5.94 0 11.88 0 18 0 C18 2.97 18 5.94 18 9 C12.06 9 6.12 9 0 9 C0 6.03 0 3.06 0 0 Z " fill="#EFEFEF" transform="translate(9,30)"/>
<path d="M0 0 C4.55118301 1.13779575 5.96189605 2.53993717 9 6 C9 6.66 9 7.32 9 8 C8.34 8 7.68 8 7 8 C7.33 9.98 7.66 11.96 8 14 C6.68 13.67 5.36 13.34 4 13 C4 12.01 4 11.02 4 10 C2.68 10.33 1.36 10.66 0 11 C0 7.37 0 3.74 0 0 Z " fill="#F8F8F8" transform="translate(28,29)"/>
<path d="M0 0 C2 2 2 2 2.1953125 4.8203125 C2.16050781 6.45613281 2.16050781 6.45613281 2.125 8.125 C2.10695313 9.22070312 2.08890625 10.31640625 2.0703125 11.4453125 C2.04710937 12.28835937 2.02390625 13.13140625 2 14 C2.99 14 3.98 14 5 14 C5.33 14.99 5.66 15.98 6 17 C6.99 17.33 7.98 17.66 9 18 C8.67 16.02 8.34 14.04 8 12 C8.66 12 9.32 12 10 12 C8.02 9.36 6.04 6.72 4 4 C9.88235294 6.94117647 9.88235294 6.94117647 12 10 C12.0371782 13.07516791 11.59214059 15.98780658 11 19 C9.02 19.66 7.04 20.32 5 21 C4.67 19.35 4.34 17.7 4 16 C2.68 16.33 1.36 16.66 0 17 C0 11.39 0 5.78 0 0 Z " fill="#A0A0A0" transform="translate(27,25)"/>
</svg>`,
                        component: TMetaPopupMenu.metaclass,
                        isContainer: false,
                        instanceName: 'PopupMenu',
                        tagName: 'div',
                        resizable: false,

                        //hoverable: true,
                        //layerable: true,
                        //removable: true,
                        //draggable: true,
                        droppable: false,
                        //copyable: true,

                        props: this.propSpecsToSchemaProps()
                };
        }
}
