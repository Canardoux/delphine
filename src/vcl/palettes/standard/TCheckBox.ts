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

import { LitElement, html, css, type CSSResultGroup } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// import { TControl, TMetaControl } from '../../Control';
// import type { PropSpec } from '../../IComponent';
// import type { ComponentSchema } from '../../IComponent';
import type { IForm } from '../../IForm';
import { TLitControlElement } from '../../LitControlElement';

// --------------------------------------

//@customElement('lit-checkbox')
export class TCheckBox extends TLitControlElement {
        static properties = {
                ...TLitControlElement.properties,

                caption: { type: String },
                checked: { type: Boolean },
                enabled: { type: Boolean }
        };
        caption = 'Caption';
        checked = false;
        enabled = true;

        static override styles: CSSResultGroup = [
                TLitControlElement.styles,
                css`
                        :host {
                                display: inline-block;

                                vertical-align: middle;
                        }

                        label {
                                display: inline-flex;

                                align-items: center;

                                gap: 6px;

                                white-space: nowrap;

                                user-select: none;

                                cursor: default;
                        }

                        label > input.native-checkbox {
                                position: absolute;

                                width: 1px;

                                height: 1px;

                                margin: 0;

                                padding: 0;

                                opacity: 0;

                                overflow: hidden;

                                pointer-events: none;

                                appearance: none;

                                box-shadow: none;
                        }

                        .check-box {
                                position: relative;
                                display: inline-block;
                                flex: 0 0 14px;
                                width: 14px;
                                height: 14px;
                                box-sizing: border-box;

                                background: var(--checkbox-background, white);
                                box-shadow: var(--checkbox-box-shadow, inset 0 0 0 1px #808080);

                                border-radius: var(--checkbox-border-radius, 0);
                        }

                        input.native-checkbox:checked + .check-box::after {
                                content: '';
                                position: absolute;

                                left: 3px;
                                top: 2px;

                                width: 7px;
                                height: 4px;

                                border-left: 2px solid var(--checkbox-check-color, currentColor);

                                border-bottom: 2px solid var(--checkbox-check-color, currentColor);

                                transform: rotate(-45deg);
                                box-sizing: border-box;
                        }

                        input.native-checkbox:checked + .check-box {
                                background: var(--checkbox-checked-background, var(--checkbox-background, white));

                                box-shadow: var(--checkbox-checked-box-shadow, var(--checkbox-box-shadow, none));
                        }

                        input.native-checkbox:focus-visible + .check-box {
                                outline: 1px dotted currentColor;

                                outline-offset: 2px;
                        }

                        input.native-checkbox:disabled + .check-box {
                                background: var(--checkbox-disabled-background, var(--checkbox-background, white));
                        }

                        input.native-checkbox:disabled:checked + .check-box::after {
                                border-color: var(--checkbox-disabled-check-color, var(--checkbox-check-color, currentColor));
                        }

                        input.native-checkbox:disabled ~ .caption {
                                color: var(--button-shadow);

                                text-shadow: 1px 1px var(--button-highlight);
                        }
                `
        ];

        private handleChange(ev: Event): void {
                ev.stopPropagation();

                const input = ev.currentTarget as HTMLInputElement;
                this.checked = input.checked;

                this.dispatchEvent(
                        new CustomEvent('change', {
                                bubbles: true,
                                composed: true
                        })
                );
        }

        render() {
                //const chk = this.checked ? 'checked' : '';
                //const dis = this.enabled ? '' : 'disabled';
                //console.log('LitCheckbox render: checked=', this.checked, 'enabled=', this.enabled);
                return html`
                        <label>
                                <input class="native-checkbox" type="checkbox" .checked=${this.checked} ?disabled=${!this.enabled} @change=${this.handleChange} />

                                <span class="check-box" aria-hidden="true"></span>

                                <span class="caption">${this.caption}</span>
                        </label>
                `;
        }
}
//customElements.define('lit-checkbox', TLitCheckbox);

export function registerRuntime() {
        if (!customElements.get('lit-checkbox')) {
                customElements.define('lit-checkbox', TCheckBox);
        }
}

declare global {
        interface HTMLElementTagNameMap {
                'lit-checkbox': TCheckBox;
        }
}
