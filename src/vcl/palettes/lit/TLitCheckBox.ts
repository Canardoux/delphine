// TLitCheckBox.ts
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

import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { TControl, TMetaControl } from '../../Control';
import type { PropSpec } from '../../IComponent';
import type { ComponentSchema } from '../../IComponent';
import type { IForm } from '../../IForm';
import { TLitMetaComponent, TLitComponent, TLitControlElement } from './lit';

// --------------------------------------

//@customElement('lit-checkbox')
class DelphineLitCheckbox extends TLitControlElement {
        static properties = {
                caption: { type: String },
                checked: { type: Boolean },
                enabled: { type: Boolean }
        };

        caption = 'Caption';
        checked = false;
        enabled = true;

        // @property({ type: String })
        // caption?: string = 'Caption';

        // @property({ type: Boolean })
        // checked?: boolean = false;

        // @property({ type: Boolean })
        // enabled?: boolean = true;

        // createRenderRoot() {
        //         return this;
        // }

        render() {
                //const chk = this.checked ? 'checked' : '';
                //const dis = this.enabled ? '' : 'disabled';
                console.log('LitCheckbox render: checked=', this.checked, 'enabled=', this.enabled);
                return html`
                        <label>
                                <input type="checkbox" .checked=${this.checked} ?disabled=${!this.enabled} />
                                <span>${this.caption}</span>
                        </label>
                `;
        }
}
customElements.define('lit-checkbox', DelphineLitCheckbox);

// --------------------------------------

// export class TLitCheckbox extends TLitComponent {
//         //chk = this.htmlElement!.children.namedItem('chk');
//         //lab = this.htmlElement!.children.namedItem('lab');
//         get litElement(): DelphineLitCheckbox {
//                 return this.htmlElement as DelphineLitCheckbox;
//         }

//         get caption(): string {
//                 //const litCheckBox: LitCheckbox = DelphineLitCheckbox;
//                 return this.litElement.caption ?? 'Caption';
//         }
//         set caption(caption: string) {
//                 //const litCheckBox: LitCheckbox = this.htmlElement as LitCheckbox;
//                 this.litElement.caption = caption;
//         }

//         get enabled(): boolean {
//                 //const litCheckBox: LitCheckbox = this.htmlElement as LitCheckbox;
//                 return this.litElement.enabled ?? true;
//         }
//         set enabled(enabled) {
//                 //const litCheckBox: LitCheckbox = this.htmlElement as LitCheckbox;
//                 this.litElement.enabled = enabled;
//         }

//         get checked(): boolean {
//                 //const litCheckBox: LitCheckbox = this.htmlElement as LitCheckbox;
//                 return this.litElement.checked ?? false;
//         }
//         set checked(checked: boolean) {
//                 //const litCheckBox: LitCheckbox = this.htmlElement as LitCheckbox;
//                 this.litElement.checked = checked;
//         }

//         constructor(name: string, form: IForm, parent: TControl) {
//                 super(TLitMetaCheckbox.metaclass, name, form, parent);
//         }
// }

// --------------------------------------

export class TLitMetaCheckbox extends TLitMetaComponent {
        static metaclass = new TLitMetaCheckbox(TLitMetaComponent.metaclass, 'TLitCheckbox');

        //         protected constructor(superClass: TLitMetaComponent, name: string) {
        //                 super(superClass, name);
        //         }

        //         create(name: string, form: IForm, parent: TControl) {
        //                 return new TLitCheckbox(name, form, parent) as T;
        //         }

        //         defProps(): PropSpec<any>[] {
        //                 return [
        //                         {
        //                                 name: 'caption',
        //                                 kind: 'string',
        //                                 default: 'Caption',
        //                                 retrieve: (o: T) => {
        //                                         return o.caption;
        //                                 },
        //                                 apply: (o, v) => (o.caption = String(v)),
        //                                 grapes: {
        //                                         traitType: 'text',
        //                                         label: 'Caption',
        //                                         applyToModel: (model: any, value) => {
        //                                                 const attrs = { ...(model.getAttributes?.() ?? {}) };
        //                                                 attrs['data-delphine-caption'] = String(value ?? '');
        //                                                 model.setAttributes(attrs);
        //                                         }
        //                                 }
        //                         },

        //                         {
        //                                 name: 'enabled',
        //                                 kind: 'boolean',
        //                                 default: true,
        //                                 retrieve: (o) => {
        //                                         return o.enabled;
        //                                 },
        //                                 apply: (o, v) => (o.enabled = Boolean(v)),

        //                                 grapes: {
        //                                         traitType: 'checkbox',
        //                                         label: 'Enabled',

        //                                         applyToModel: (model, value) => {
        //                                                 const rootAttrs = { ...(model.getAttributes?.() ?? {}) };
        //                                                 rootAttrs['data-delphine-enabled'] = String(Boolean(value));
        //                                                 model.setAttributes(rootAttrs);
        //                                         }
        //                                 }
        //                         },

        //                         {
        //                                 name: 'checked',
        //                                 kind: 'boolean',
        //                                 default: false,
        //                                 retrieve: (o) => {
        //                                         return o.checked;
        //                                 },
        //                                 apply: (o, v) => (o.checked = Boolean(v)),

        //                                 grapes: {
        //                                         traitType: 'checkbox',
        //                                         label: 'Checked',

        //                                         applyToModel: (model, value) => {
        //                                                 const checked = Boolean(value);

        //                                                 const rootAttrs = { ...(model.getAttributes?.() ?? {}) };
        //                                                 rootAttrs['data-delphine-checked'] = String(checked);
        //                                                 model.setAttributes(rootAttrs);
        //                                         }
        //                                 }
        //                         }
        //                 ];
        //         }

        //         getSchema(): ComponentSchema | null {
        //                 return {
        //                         name: this.typeName,
        //                         label: 'TLitCheckbox',
        //                         category: 'Lit',
        //                         //icon: '☑️',
        //                         icon: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="48" height="48">
        // <path d="M0 0 C1.46566406 -0.00386719 1.46566406 -0.00386719 2.9609375 -0.0078125 C3.98445313 -0.00007812 5.00796875 0.00765625 6.0625 0.015625 C7.08601563 0.00789062 8.10953125 0.00015625 9.1640625 -0.0078125 C10.14117188 -0.00523438 11.11828125 -0.00265625 12.125 0 C13.02347656 0.00225586 13.92195313 0.00451172 14.84765625 0.00683594 C17.0625 0.265625 17.0625 0.265625 19.0625 2.265625 C19.32128906 4.48046875 19.32128906 4.48046875 19.328125 7.203125 C19.33199219 8.66878906 19.33199219 8.66878906 19.3359375 10.1640625 C19.32820313 11.18757813 19.32046875 12.21109375 19.3125 13.265625 C19.32023437 14.28914063 19.32796875 15.31265625 19.3359375 16.3671875 C19.33335938 17.34429688 19.33078125 18.32140625 19.328125 19.328125 C19.32586914 20.22660156 19.32361328 21.12507813 19.32128906 22.05078125 C19.0625 24.265625 19.0625 24.265625 17.0625 26.265625 C14.84765625 26.52441406 14.84765625 26.52441406 12.125 26.53125 C11.14789062 26.53382812 10.17078125 26.53640625 9.1640625 26.5390625 C8.14054687 26.53132813 7.11703125 26.52359375 6.0625 26.515625 C5.03898437 26.52335937 4.01546875 26.53109375 2.9609375 26.5390625 C1.98382813 26.53648438 1.00671875 26.53390625 0 26.53125 C-0.89847656 26.52899414 -1.79695313 26.52673828 -2.72265625 26.52441406 C-4.9375 26.265625 -4.9375 26.265625 -6.9375 24.265625 C-7.19628906 22.05078125 -7.19628906 22.05078125 -7.203125 19.328125 C-7.20570312 18.35101562 -7.20828125 17.37390625 -7.2109375 16.3671875 C-7.20320312 15.34367187 -7.19546875 14.32015625 -7.1875 13.265625 C-7.19523438 12.24210937 -7.20296875 11.21859375 -7.2109375 10.1640625 C-7.20835938 9.18695313 -7.20578125 8.20984375 -7.203125 7.203125 C-7.20086914 6.30464844 -7.19861328 5.40617187 -7.19628906 4.48046875 C-6.66091121 -0.10155752 -3.93677013 0.00988429 0 0 Z " fill="#E5E8EC" transform="translate(17.9375,10.734375)"/>
        // <path d="M0 0 C1.46566406 -0.00386719 1.46566406 -0.00386719 2.9609375 -0.0078125 C3.98445313 -0.00007812 5.00796875 0.00765625 6.0625 0.015625 C7.08601563 0.00789062 8.10953125 0.00015625 9.1640625 -0.0078125 C10.14117188 -0.00523438 11.11828125 -0.00265625 12.125 0 C13.02347656 0.00225586 13.92195313 0.00451172 14.84765625 0.00683594 C17.0625 0.265625 17.0625 0.265625 19.0625 2.265625 C19.32128906 4.48046875 19.32128906 4.48046875 19.328125 7.203125 C19.33199219 8.66878906 19.33199219 8.66878906 19.3359375 10.1640625 C19.32820313 11.18757813 19.32046875 12.21109375 19.3125 13.265625 C19.32023437 14.28914063 19.32796875 15.31265625 19.3359375 16.3671875 C19.33335938 17.34429688 19.33078125 18.32140625 19.328125 19.328125 C19.32586914 20.22660156 19.32361328 21.12507813 19.32128906 22.05078125 C19.0625 24.265625 19.0625 24.265625 17.0625 26.265625 C14.84765625 26.52441406 14.84765625 26.52441406 12.125 26.53125 C11.14789062 26.53382812 10.17078125 26.53640625 9.1640625 26.5390625 C8.14054687 26.53132813 7.11703125 26.52359375 6.0625 26.515625 C5.03898437 26.52335937 4.01546875 26.53109375 2.9609375 26.5390625 C1.98382813 26.53648438 1.00671875 26.53390625 0 26.53125 C-0.89847656 26.52899414 -1.79695313 26.52673828 -2.72265625 26.52441406 C-4.9375 26.265625 -4.9375 26.265625 -6.9375 24.265625 C-7.19628906 22.05078125 -7.19628906 22.05078125 -7.203125 19.328125 C-7.20570312 18.35101562 -7.20828125 17.37390625 -7.2109375 16.3671875 C-7.20320312 15.34367187 -7.19546875 14.32015625 -7.1875 13.265625 C-7.19523438 12.24210937 -7.20296875 11.21859375 -7.2109375 10.1640625 C-7.20835938 9.18695313 -7.20578125 8.20984375 -7.203125 7.203125 C-7.20086914 6.30464844 -7.19861328 5.40617187 -7.19628906 4.48046875 C-6.66091121 -0.10155752 -3.93677013 0.00988429 0 0 Z M-4.9375 3.265625 C-5.18785974 6.57079434 -5.12271952 9.88958541 -5.125 13.203125 C-5.13724609 14.13576172 -5.14949219 15.06839844 -5.16210938 16.02929688 C-5.16404297 16.92068359 -5.16597656 17.81207031 -5.16796875 18.73046875 C-5.17207764 19.551521 -5.17618652 20.37257324 -5.18041992 21.21850586 C-5.1248988 23.49079724 -5.1248988 23.49079724 -2.9375 25.265625 C-1.03521695 25.57465789 -1.03521695 25.57465789 1.125 25.53125 C1.92164063 25.53382812 2.71828125 25.53640625 3.5390625 25.5390625 C4.37179688 25.53132813 5.20453125 25.52359375 6.0625 25.515625 C6.89523438 25.52335937 7.72796875 25.53109375 8.5859375 25.5390625 C9.78089844 25.53519531 9.78089844 25.53519531 11 25.53125 C11.73089844 25.52899414 12.46179688 25.52673828 13.21484375 25.52441406 C15.30947364 25.42011061 15.30947364 25.42011061 17.0625 23.265625 C17.35600396 21.15029291 17.35600396 21.15029291 17.29296875 18.73046875 C17.29103516 17.83908203 17.28910156 16.94769531 17.28710938 16.02929688 C17.27486328 15.09666016 17.26261719 14.16402344 17.25 13.203125 C17.2490332 11.79836914 17.2490332 11.79836914 17.24804688 10.36523438 C17.62019467 5.98125968 17.62019467 5.98125968 16.0625 2.265625 C14.58597336 2.16681703 13.10482764 2.13483255 11.625 2.1328125 C10.73039062 2.13152344 9.83578125 2.13023438 8.9140625 2.12890625 C7.50253906 2.13470703 7.50253906 2.13470703 6.0625 2.140625 C5.12148438 2.13675781 4.18046875 2.13289062 3.2109375 2.12890625 C1.86902344 2.13083984 1.86902344 2.13083984 0.5 2.1328125 C-0.73943359 2.13450439 -0.73943359 2.13450439 -2.00390625 2.13623047 C-3.94429039 2.05297693 -3.94429039 2.05297693 -4.9375 3.265625 Z " fill="#619DF8" transform="translate(17.9375,10.734375)"/>
        // <path d="M0 0 C0.99 0.33 1.98 0.66 3 1 C1.49087042 5.98012761 -1.55661849 9.24259942 -5 13 C-8.22485192 12.28706786 -9.98130248 11.72524165 -12 9 C-12 7.68 -12 6.36 -12 5 C-9.61435923 5.57584432 -7.33317216 6.22227595 -5 7 C-3.35 4.69 -1.7 2.38 0 0 Z " fill="#3F8AFB" transform="translate(29,17)"/>
        // <path d="M0 0 C0.33 0 0.66 0 1 0 C1.05790353 3.29159316 1.09356261 6.58305603 1.125 9.875 C1.14175781 10.81214844 1.15851562 11.74929687 1.17578125 12.71484375 C1.18222656 13.61074219 1.18867187 14.50664062 1.1953125 15.4296875 C1.20578613 16.25710449 1.21625977 17.08452148 1.22705078 17.93701172 C1 20 1 20 -1 22 C-3.21484375 22.25878906 -3.21484375 22.25878906 -5.9375 22.265625 C-6.91460938 22.26820312 -7.89171875 22.27078125 -8.8984375 22.2734375 C-9.92195313 22.26570313 -10.94546875 22.25796875 -12 22.25 C-13.02351563 22.25773437 -14.04703125 22.26546875 -15.1015625 22.2734375 C-16.07867187 22.27085938 -17.05578125 22.26828125 -18.0625 22.265625 C-18.96097656 22.26336914 -19.85945313 22.26111328 -20.78515625 22.25878906 C-23 22 -23 22 -25 20 C-25.22705078 18.02880859 -25.22705078 18.02880859 -25.1953125 15.6484375 C-25.18886719 14.79765625 -25.18242187 13.946875 -25.17578125 13.0703125 C-25.15902344 12.18085938 -25.14226563 11.29140625 -25.125 10.375 C-25.11597656 9.4778125 -25.10695313 8.580625 -25.09765625 7.65625 C-25.0740497 5.43723414 -25.0411231 3.21874923 -25 1 C-24.67 1 -24.34 1 -24 1 C-23.95101563 2.20398438 -23.90203125 3.40796875 -23.8515625 4.6484375 C-23.77653657 6.22398198 -23.70098867 7.79950166 -23.625 9.375 C-23.5940625 10.1690625 -23.563125 10.963125 -23.53125 11.78125 C-23.48183579 16.36667375 -23.48183579 16.36667375 -21 20 C-19.09771695 20.30903289 -19.09771695 20.30903289 -16.9375 20.265625 C-16.14085937 20.26820312 -15.34421875 20.27078125 -14.5234375 20.2734375 C-13.69070312 20.26570313 -12.85796875 20.25796875 -12 20.25 C-11.16726562 20.25773437 -10.33453125 20.26546875 -9.4765625 20.2734375 C-8.28160156 20.26957031 -8.28160156 20.26957031 -7.0625 20.265625 C-6.33160156 20.26336914 -5.60070312 20.26111328 -4.84765625 20.25878906 C-2.75302636 20.15448561 -2.75302636 20.15448561 -1 18 C-0.63168919 16.06742145 -0.63168919 16.06742145 -0.5859375 13.8671875 C-0.54726563 13.06152344 -0.50859375 12.25585938 -0.46875 11.42578125 C-0.42234375 10.16314453 -0.42234375 10.16314453 -0.375 8.875 C-0.33632813 8.02550781 -0.29765625 7.17601562 -0.2578125 6.30078125 C-0.16343506 4.20088316 -0.08062414 2.10047109 0 0 Z " fill="#2C7FFD" transform="translate(36,15)"/>
        // </svg>`,
        //                         component: this,
        //                         isContainer: false,
        //                         instanceName: 'LitCheckbox',
        //                         tagName: 'lit-checkbox',
        //                         resizable: false,
        //                         //type: 'Delphine-TCheckBox',
        //                         //draggable: true,

        //                         //selectable: true,
        //                         //draggable: true,
        //                         droppable: false,
        //                         //copyable: true,
        //                         //removable: true,
        //                         //editable: false,
        //                         //hoverable: true,
        //                         //layerable: true,

        //                         attributes: {
        //                                 'data-delphine-component': this.typeName,

        //                                 'data-delphine-name': this.typeName
        //                         },
        //                         //droppable: false,
        //                         //selectable: true,
        //                         components: [],

        //                         //attributes: {
        //                         //'data-delphine-component': 'TCheckBox'
        //                         //},

        //                         props: this.propSpecsToSchemaProps()
        //                 };
        //         }
}
