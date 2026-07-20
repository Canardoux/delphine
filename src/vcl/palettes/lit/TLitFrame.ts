// TLitFrame.ts

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

// import { TControl, TMetaControl } from '../../Control';
// import { TMetaComponent } from '../../Component';
// import { TMetaContainer, TContainer } from '../../Container';
// import type { PropSpec } from '../../IComponent';
// import type { ComponentSchema } from '../../IComponent';
// import type { IForm } from '../../IForm';
// import type { IControl } from '../../IControl';
// import type { TMetaclass } from '../../Oops';
// import { TCompositeControl, TMetaCompositeControl } from '../../CompositeControl';
// import { TComponent } from '../../Component';
// //import { TForm } from './Form';
// import { LitElement, html } from 'lit';
import { TLitControlElement } from '../../LitControlElement';
import { ComponentTreeIndexer } from '../../BuildComponentTree';
import type { CSSResultGroup } from 'lit';

//import { unsafeCSS } from 'lit';
//import win98Css from '../../../themes/win98.css?inline';
import { css } from 'lit';

//import { win98Styles } from '../../Win98Theme';

export class TLitFrame extends TLitControlElement {
        //static override styles = unsafeCSS(win98Css);
        // static override styles = [
        //         win98Styles,

        //         css`
        //                 :host {
        //                         display: block;
        //                         box-sizing: border-box;
        //                         background: var(--surface);
        //                         color: var(--text-color);
        //                 }
        //         `
        // ];
        // static override styles: CSSResultGroup = [
        //         win98Styles,

        //         css`
        //                 :host {
        //                         display: block;
        //                         box-sizing: border-box;
        //                         background: var(--surface);
        //                         color: var(--text-color);
        //                 }
        //         `
        // ];
        static override styles: CSSResultGroup = [
                TLitControlElement.styles,
                css`
                        :host {
                                display: block;
                                box-sizing: border-box;

                                background: var(--frame-background, transparent);

                                color: var(--control-text-color, currentColor);
                        }
                `
        ];

        readonly isDelphineFrame = true as const;

        componentRegistry = new Map<string, Element>();

        private rebuildingRegistry = false;
        private registryRebuildRequested = false;

        constructor() {
                super();
                //this.classList.add('delphine-frame');
                //this.setAttribute('data-delphine-frame', '');
        }

        registerComponent(name: string, el: Element): void {
                this.componentRegistry.set(name, el);
        }

        getComponent<T extends Element = Element>(name: string): T | undefined {
                return this.componentRegistry.get(name) as T | undefined;
        }

        async rebuildComponentRegistry(): Promise<void> {
                if (this.rebuildingRegistry) {
                        this.registryRebuildRequested = true;
                        return;
                }

                this.rebuildingRegistry = true;

                try {
                        do {
                                this.registryRebuildRequested = false;
                                this.componentRegistry.clear();

                                const indexer = new ComponentTreeIndexer();
                                await indexer.indexFrame(this, this);

                                console.log(`--- ${this.nodeName} : TLitFrame rebuildComponentRegistry ---`);

                                for (const [name, el] of this.componentRegistry.entries()) {
                                        console.log('      ', name, el.id, el.nodeName);
                                }

                                console.log('---');
                        } while (this.registryRebuildRequested);
                } finally {
                        this.rebuildingRegistry = false;
                }
        }

        protected override updated(): void {
                console.log(`--- ${this.nodeName} : TLitFrame updated ---`);

                void this.rebuildComponentRegistry();

                console.log(`--- ${this.nodeName} : TLitFrame end(updated) ---`);
        }
}

// customElements.define('lit-frame', TLitFrame);

// export class TMetaLitFrame extends TLitMetaComponent {
//         static metaclass = new TMetaLitFrame(TLitMetaComponent.metaclass, 'TLitFrame');
// }
// // --------------------------------------

// export const delphineMeta = TMetaLitFrame.metaclass;
