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
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';

// --------------------------------------

export abstract class TLitControlElement extends LitElement {
        static override styles: CSSResultGroup = css`
                :host {
                        box-sizing: border-box;

                        color: var(--delphine-control-color, inherit);
                        font-family: var(--control-font-family, system-ui);

                        font-size: var(--control-font-size, 13px);

                        font-weight: var(--control-font-weight, normal);

                        line-height: var(--control-line-height, normal);

                        user-select: none;
                }
        `;

        readonly isDelphineComponent = true as const;

        static properties = {
                color: { type: String },
                backgroundColor: { type: String },
                width: { type: String },
                height: { type: String },
                left: { type: Number },
                top: { type: Number }
        };

        color = '';
        backgroundColor = '';
        width = '';
        height = '';
        left = 77; // TODO:
        right = 77; // TODO:

        protected getControlStyle() {
                return styleMap({
                        color: this.color || undefined,
                        'background-color': this.backgroundColor || undefined,
                        width: this.width || undefined
                });
        }

        protected override updated(): void {
                this.style.setProperty(
                        '--delphine-control-color',

                        this.color || ''
                );

                this.style.setProperty(
                        '--delphine-control-background-color',

                        this.backgroundColor || ''
                );

                this.style.width = this.width || '';
        }
}

// ---------------------------------------
