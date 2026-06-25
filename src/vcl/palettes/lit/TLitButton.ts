// TLitButton.ts

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
import { LitElement, html } from 'lit';
import { TLitMetaComponent, TLitComponent, TLitControlElement } from './lit';

export class DelphineLitButton extends TLitControlElement {
        static properties = {
                caption: { type: String },
                enabled: { type: Boolean }
        };

        caption = 'Caption';
        enabled = true;

        render() {
                return html`<button ?disabled=${!this.enabled}>${this.caption}</button>`;
        }
}
customElements.define('lit-button', DelphineLitButton);

// export class TButton extends TControl {
//         //getMetaclass() {
//         //return TMetaControl.metaclass;
//         //}

//         htmlButton(): HTMLButtonElement {
//                 return this.htmlElement! as HTMLButtonElement;
//         }

//         //_caption: string = '';
//         //_enabled: boolean = true;
//         /*
//         protected get bprops(): ButtonProps {
//                 return this.props as ButtonProps;
//         }
//                 */

//         get caption(): string {
//                 //return this._caption;
//                 return (this.props.caption as string) ?? 'Caption';
//         }
//         set caption(caption: string) {
//                 //this._caption = caption;
//                 this.props.caption = caption;
//                 const el = this.htmlElement;
//                 if (!el) return;
//                 el.textContent = this.caption;
//         }

//         get enabled(): boolean {
//                 //return this._enabled ?? true;
//                 return (this.props.enabled as boolean) ?? true;
//         }
//         set enabled(enabled) {
//                 //this._enabled = enabled;
//                 this.props.enabled = enabled;
//                 this.htmlButton().disabled = !enabled;
//         }

//         constructor(name: string, form: IForm, parent: TControl) {
//                 super(TMetaButton.metaclass, name, form, parent);
//         }
//         /*
//         syncDomFromProps() {
//                 const el = this.htmlElement;
//                 if (!el) return;

//                 el.textContent = this.caption;
//                 this.htmlButton().disabled = !this.enabled;
//                 super.syncDomFromProps();
//         }
//                 */
// }

export class TMetaLitButton extends TLitMetaComponent {
        static metaclass = new TMetaLitButton(TLitMetaComponent.metaclass, 'LitTButton');
}
// --------------------------------------

export const delphineMeta = TMetaLitButton.metaclass;
