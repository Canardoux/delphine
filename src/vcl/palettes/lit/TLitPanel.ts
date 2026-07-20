// TLitPannel.ts

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

// import { html } from 'lit';
// import { TLitControlElement } from '../../lit';

// export class TLitPanel extends TLitControlElement {
//         static properties = {
//                 ...TLitControlElement.properties
//         };
//         render() {
//                 return html`<div data-delphine-component="lit-panel"><slot></slot></div>`;
//         }
// }

import { html, css, type CSSResultGroup } from 'lit';
import { TLitControlElement } from '../../LitControlElement';

export class TLitPanel extends TLitControlElement {
        static properties = {
                ...TLitControlElement.properties
        };

        static override styles: CSSResultGroup = [
                TLitControlElement.styles,
                css`
                        :host {
                                display: block;
                                box-sizing: border-box;

                                padding: 4px;

                                color: var(--delphine-control-color, var(--control-text-color, var(--text-color)));

                                background-color: var(--delphine-control-background-color, var(--panel-background, transparent));

                                box-shadow: var(--panel-box-shadow, none);
                                border-radius: var(--panel-border-radius, 0);
                        }
                `
        ];

        protected override updated(): void {
                this.style.setProperty('--delphine-control-color', this.color || '');
                this.style.setProperty('--delphine-control-background-color', this.backgroundColor || '');
                this.style.width = this.width || '';

                this.style.backgroundColor = this.backgroundColor;
                this.style.color = this.color;
                this.style.width = this.width;
        }

        render() {
                return html`<slot></slot>`;
        }
}

export function registerLitPanelElement() {
        if (!customElements.get('lit-panel')) {
                customElements.define('lit-panel', TLitPanel);
        }
}

declare global {
        interface HTMLElementTagNameMap {
                'lit-panel': TLitPanel;
        }
}
