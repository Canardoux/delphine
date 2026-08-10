// vcl/palettes/standard/TButton.ts

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
import { TLitControlElement } from '../../LitControlElement';
//import { win98Styles } from '../../Win98Theme';
//import type { TTypeRegistry } from '../../TypeRegistry';

export class TButton extends TLitControlElement {
        static override properties = {
                ...TLitControlElement.properties,

                caption: { type: String },
                enabled: { type: Boolean }
        };

        static override styles: CSSResultGroup = [
                TLitControlElement.styles,
                css`
                        :host {
                                display: inline-block;
                                vertical-align: middle;
                        }

                        button {
                                box-sizing: border-box;
                                border: none;
                                transform: translateY(0);

                                min-width: 75px;
                                min-height: 30px;
                                padding: 0 12px;

                                color: inherit;
                                width: inherit;

                                font-family: var(--control-font-family, Arial, sans-serif);

                                font-size: var(--control-font-size, 11px);

                                background: var(--button-background, ButtonFace);

                                box-shadow: var(--button-box-shadow, none);

                                border-radius: var(--button-border-radius, 0);
                        }

                        button:not(:disabled):active {
                                background: var(--button-active-background, var(--button-background, ButtonFace));

                                box-shadow: var(--button-active-box-shadow, var(--button-box-shadow, none));
                                transform: translateY(var(--button-active-translate-y, 0));

                                border-radius: var(--button-border-radius, 0);
                        }

                        button:not(:disabled):active .caption {
                                transform: translate(var(--button-active-content-x, 0), var(--button-active-content-y, 0));
                        }

                        button .caption {
                                display: inline-block;
                        }

                        button:focus-visible {
                                outline: 1px dotted currentColor;
                                outline-offset: -4px;
                        }

                        button:disabled {
                                color: var(--button-shadow, GrayText);
                        }
                `
        ];

        caption = 'The Caption';
        enabled = true;

        protected override render() {
                return html`
                        <button style=${this.getControlStyle()} ?disabled=${!this.enabled}>
                                <span class="caption">${this.caption}</span>
                        </button>
                `;
        }
}
// customElements.define('lit-button', TLitButton);

// export class TMetaLitButton extends TLitMetaComponent {
//         static metaclass = new TMetaLitButton(TLitMetaComponent.metaclass, 'TLitButton');
// }
// // --------------------------------------

// export const delphineMeta = TMetaLitButton.metaclass;

export function registerRuntime() {
        if (!customElements.get('lit-button')) {
                customElements.define('lit-button', TButton);
        }

        // registry.register({
        //         type: 'TButton',

        //         tagNanme: 'lit-button',

        //         constructor: TButton
        // });
}

declare global {
        interface HTMLElementTagNameMap {
                'lit-button': TButton;
        }
}
