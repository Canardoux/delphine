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

// ------------------------------------------

export class TLabel extends TControl {
        htmlButton(): HTMLButtonElement {
                return this.htmlElement! as HTMLButtonElement;
        }

        get caption(): string {
                return (this.props.caption as string) ?? 'Caption';
        }
        set caption(caption: string) {
                this.props.caption = caption;
                const el = this.htmlElement;
                if (!el) return;
                el.textContent = this.caption;
        }

        get enabled(): boolean {
                return (this.props.enabled as boolean) ?? true;
        }
        set enabled(enabled) {
                this.props.enabled = enabled;
                this.htmlButton().disabled = !enabled;
        }

        constructor(name: string, form: IForm, parent: TControl) {
                super(TMetaLabel.metaclass, name, form, parent);
        }
}

export class TMetaLabel<T extends TLabel> extends TMetaControl {
        static metaclass = new TMetaLabel(TMetaControl.metaclass, 'TLabel');

        protected constructor(superClass: TMetaControl, name: string) {
                super(superClass, name);
        }

        create(name: string, form: IForm, parent: TControl) {
                return new TLabel(name, form, parent) as T;
        }

        defProps(): PropSpec<any>[] {
                return [
                        {
                                name: 'caption',
                                kind: 'string',
                                default: 'Caption',
                                retrieve: (o: T) => {
                                        return o.caption;
                                },
                                apply: (o, v) => (o.caption = String(v)),
                                grapes: {
                                        traitType: 'text',
                                        label: 'Caption',
                                        applyToModel: (model: any, value) => {
                                                model.components(String(value ?? 'GLOUPS'));
                                        }
                                }
                        },
                        {
                                name: 'enabled',
                                kind: 'boolean',
                                default: true,
                                retrieve: (o) => {
                                        return o.enabled;
                                },
                                apply: (o, v) => (o.enabled = Boolean(v)),

                                grapes: {
                                        traitType: 'checkbox',
                                        label: 'Enabled',
                                        applyToModel: (model, value) => {
                                                const attrs = { ...(model.getAttributes?.() ?? {}) };

                                                if (Boolean(value)) {
                                                        delete attrs.disabled;
                                                } else {
                                                        attrs.disabled = 'disabled';
                                                }
                                                model.setAttributes(attrs);
                                        }
                                }
                        }
                ];
        }

        getSchema(): ComponentSchema | null {
                return {
                        name: this.typeName,
                        label: 'TLabel',
                        category: 'Standard Control',
                        //icon: '🏷️',
                        icon: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="48" height="48">
<path d="M0 0 C0.99 0.33 1.98 0.66 3 1 C4.16796875 3.36328125 4.16796875 3.36328125 5.1875 6.3125 C5.53167969 7.27800781 5.87585937 8.24351563 6.23046875 9.23828125 C7 12 7 12 7 16 C6.01 16 5.02 16 4 16 C4 15.01 4 14.02 4 13 C2.02 13 0.04 13 -2 13 C-2 13.99 -2 14.98 -2 16 C-2.99 16 -3.98 16 -5 16 C-4.49228528 10.03435204 -2.61407872 5.36190101 0 0 Z M0 7 C0 7.99 0 8.98 0 10 C0.66 10 1.32 10 2 10 C2 9.01 2 8.02 2 7 C1.34 7 0.68 7 0 7 Z " fill="#287AFE" transform="translate(12,16)"/>
<path d="M0 0 C0.66 0 1.32 0 2 0 C2 1.32 2 2.64 2 4 C2.78375 3.95875 3.5675 3.9175 4.375 3.875 C7 4 7 4 9 6 C9.265625 7.875 9.265625 7.875 9.25 10 C9.25515625 10.70125 9.2603125 11.4025 9.265625 12.125 C9 14 9 14 7 16 C4.69 16 2.38 16 0 16 C0 10.72 0 5.44 0 0 Z M4 6 C3.34 7.65 2.68 9.3 2 11 C2.99 11.99 3.98 12.98 5 14 C6.35618499 12.87465895 6.35618499 12.87465895 6.0625 9.9375 C6.041875 8.968125 6.02125 7.99875 6 7 C5.34 6.67 4.68 6.34 4 6 Z " fill="#287DFE" transform="translate(21,16)"/>
<path d="M0 0 C1.4540625 0.0309375 1.4540625 0.0309375 2.9375 0.0625 C3.2675 1.3825 3.5975 2.7025 3.9375 4.0625 C2.2875 4.0625 0.6375 4.0625 -1.0625 4.0625 C-0.7325 5.7125 -0.4025 7.3625 -0.0625 9.0625 C1.2575 8.7325 2.5775 8.4025 3.9375 8.0625 C3.6075 9.3825 3.2775 10.7025 2.9375 12.0625 C0.93795254 12.10504356 -1.06291636 12.10330783 -3.0625 12.0625 C-4.0625 11.0625 -4.0625 11.0625 -4.1953125 8.8125 C-4.19273438 7.905 -4.19015625 6.9975 -4.1875 6.0625 C-4.19007812 5.155 -4.19265625 4.2475 -4.1953125 3.3125 C-3.98863009 -0.18894319 -3.58596978 0.07318306 0 0 Z " fill="#297DFE" transform="translate(36.0625,19.9375)"/>
<path d="M0 0 C4.62 0 9.24 0 14 0 C14 0.66 14 1.32 14 2 C9.38 2 4.76 2 0 2 C0 1.34 0 0.68 0 0 Z " fill="#2A7EFE" transform="translate(6,34)"/>
</svg>`,
                        component: this,
                        isContainer: false,
                        instanceName: 'Label',
                        tagName: 'label',
                        resizable: false,
                        droppable: false,

                        props: this.propSpecsToSchemaProps()
                };
        }
}
