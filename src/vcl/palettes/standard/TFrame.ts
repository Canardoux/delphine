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

import { TLitControlElement } from '../../LitControlElement';
import { ComponentTreeIndexer } from '../../BuildComponentTree';
import type { CSSResultGroup } from 'lit';
import { css } from 'lit';

export class TFrame extends TLitControlElement {
        static override styles: CSSResultGroup = [
                TLitControlElement.styles,
                css`
                        :host {
                                display: block;
                                box-sizing: border-box;

                                background: var(--frame-background, transparent);
                        }
                `
        ];

        readonly isDelphineFrame = true as const;

        componentRegistry = new Map<string, Element>();

        private rebuildingRegistry = false;
        private registryRebuildRequested = false;

        constructor() {
                super();
        }

        registerComponent(name: string, el: Element): void {
                this.componentRegistry.set(name, el);
        }

        getComponent<T extends Element = Element>(name: string): T {
                return this.componentRegistry.get(name) as T;
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
                super.updated();

                console.log(`--- ${this.nodeName} : TFrame updated ---`);

                void this.rebuildComponentRegistry();

                console.log(`--- ${this.nodeName} : TFrame end(updated) ---`);
        }
        private findDelphineComponentFromEvent(event: Event): HTMLElement | undefined {
                for (const item of event.composedPath()) {
                        if (!(item instanceof HTMLElement)) {
                                continue;
                        }

                        if (item.hasAttribute('data-delphine-name')) {
                                return item;
                        }

                        if (item === this) {
                                break;
                        }
                }

                return undefined;
        }

        private clickTimer?: number;

        override connectedCallback(): void {
                super.connectedCallback();

                console.log('[Delphine] install click dispatcher on', this, this.tagName, this.getAttribute('data-delphine-name'));
                for (const type of ['click', 'input', 'change', 'keydown', 'frameevent', 'dblclick']) {
                        // same handler for everybody
                        const handler = (ev: Event) => {
                                this.handleDelphineEvent(ev, ev.type);
                                //this.handleDelphineClick(ev, ev.type);
                        };
                        this.addEventListener(type, handler);
                }
                //this.addEventListener('click', this.handleDelphineClick);
        }

        override disconnectedCallback(): void {
                //this.removeEventListener('click', this.handleDelphineClick);
                for (const type of ['click', 'input', 'change', 'keydown', 'frameevent', 'dbl-click', 'dblclick']) {
                        // same handler for everybody
                        const handler = (ev: Event) => {
                                this.removeEventListener(ev.type, handler);
                        };
                        //this.addEventListener(type, handler, { capture: true });
                }
                super.disconnectedCallback();
        }

        private findDelphineEventHandler(event: Event, eventName: string): { component: HTMLElement; handlerName: string } | undefined {
                const path = event.composedPath();

                const thisIndex = path.indexOf(this);

                if (thisIndex < 0) {
                        return undefined;
                }

                const attributeName = `data-delphine-${eventName}`;

                /*
                 * Look for a nested TFrame between the original target and
                 * this frame.
                 *
                 * If one exists, this frame must consider that nested frame
                 * as the event target and must never inspect its internals.
                 */
                let startIndex = 0;

                for (let i = thisIndex - 1; i >= 0; i--) {
                        const item = path[i];

                        if (item instanceof TFrame) {
                                startIndex = i;
                                break;
                        }
                }

                /*
                 * Search only inside the part of the path owned by this frame.
                 */
                for (let i = startIndex; i < thisIndex; i++) {
                        const item = path[i];

                        if (!(item instanceof HTMLElement)) {
                                continue;
                        }

                        if (!item.hasAttribute('data-delphine-name')) {
                                continue;
                        }

                        const handlerName = item.getAttribute(attributeName)?.trim();

                        if (!handlerName) {
                                continue;
                        }

                        return {
                                component: item,
                                handlerName
                        };
                }

                return undefined;
        }
        private readonly handleDelphineEvent = (ev: Event, eventType: string): void => {
                console.log('[CLICK DISPATCHER]', this.tagName, this.getAttribute('data-delphine-name'));

                const binding = this.findDelphineEventHandler(ev, `on${eventType}`);

                console.log('[EVENT BINDING]', this.tagName, binding);

                if (!binding) {
                        return;
                }
                console.log('[HANDLER LOOKUP]', binding?.handlerName, 'this =', this, 'constructor =', this.constructor.name, 'handler =', (this as any)[binding!.handlerName]);

                const handler = (this as any)[binding.handlerName];

                if (typeof handler !== 'function') {
                        console.warn(`[Delphine] OnClick handler "${binding.handlerName}" not found.`);
                        return;
                }

                console.log('[HANDLER CALL]', handler, ev.currentTarget, ev.target, ev.type, ev);
                //handler.call(this, binding.component, ev);
                handler.call(this, ev, binding.component);

                ev.stopPropagation();
        };
        // private readonly handleDelphineClick = (event: Event, eventType: string): void => {
        //         console.log('[CLICK DISPATCHER]', this.tagName, this.getAttribute('data-delphine-name'));

        //         const binding = this.findDelphineEventHandler(event, 'onclick');

        //         console.log('[CLICK BINDING]', this.tagName, binding);

        //         if (!binding) {
        //                 return;
        //         }
        //         console.log('[HANDLER LOOKUP]', binding?.handlerName, 'this =', this, 'constructor =', this.constructor.name, 'handler =', (this as any)[binding!.handlerName]);

        //         const handler = (this as any)[binding.handlerName];

        //         if (typeof handler !== 'function') {
        //                 console.warn(`[Delphine] OnClick handler "${binding.handlerName}" not found.`);
        //                 return;
        //         }

        //         handler.call(this, binding.component, event);

        //         event.stopPropagation();
        // };
}
