// Form.ts

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

import { THandler } from './Base';
import { TComponent } from './Component';
import { TMetaContainer, TContainer } from './Container';
import type { PropSpec } from './Component';
import { TComponentRegistry } from './ComponentRegistry';
import type { IForm } from './IForm';
import type { IApplication } from './IApplication';

export class TMetaForm extends TMetaContainer {
        static readonly metaclass: TMetaForm = new TMetaForm(TMetaContainer.metaclass, 'TForm');
        getMetaClass() {
                return TMetaForm.metaclass;
        }

        protected constructor(superClass: TMetaContainer, name: string) {
                super(superClass, name);
                // et vous changez juste le nom :
        }

        create(name: string, form: TForm, parent: TComponent) {
                return new TForm(name);
        }

        isAForm(): boolean {
                return true;
        }

        defProps(): PropSpec<any>[] {
                return [
                        //{ name: 'caption', kind: 'string', apply: (o, v) => (o.caption = String(v)) },
                        //{ name: 'enabled', kind: 'boolean', apply: (o, v) => (o.enabled = Boolean(v)) }
                ];
        }
}

export class TForm extends TContainer implements IForm {
        getMetaclass() {
                return TMetaForm.metaclass;
        }
        static forms = new Map<string, TForm>();
        private _mounted = false;
        // Each Form has its own componentRegistry
        componentRegistry: TComponentRegistry = new TComponentRegistry();
        constructor(name: string) {
                super(name, null, null);
                this.form = this;
                TForm.forms.set(name, this);
        }

        //get application(): IApplication {
        //return this.form?.application ?? TApplication.TheApplication;
        //}

        // English comments as requested.

        findFormFromEventTarget(target: Element): TForm | null {
                // 1) Find the nearest element that looks like a form container
                const formElem = target.closest('[data-delphine-component="TForm"][data-delphine-name]') as Element | null;
                if (!formElem) return null;

                // 2) Resolve the TForm instance
                const formName = formElem.getAttribute('data-delphine-name');
                if (!formName) return null;

                return TForm.forms.get(formName) ?? null;
        }

        private _ac: AbortController | null = null;

        installEventRouter() {
                this._ac?.abort();
                this._ac = new AbortController();
                const { signal } = this._ac;

                const root = this.elem as Element | null;
                if (!root) return;

                // same handler for everybody
                const handler = (ev: Event) => this.dispatchDomEvent(ev);

                for (const type of ['click', 'input', 'change', 'keydown']) {
                        root.addEventListener(type, handler, { capture: true, signal });
                }

                for (const type in this.getMetaclass().domEvents) {
                        root.addEventListener(type, handler, { capture: true, signal });
                }
        }

        disposeEventRouter() {
                this._ac?.abort();
                this._ac = null;
        }

        // We received an DOM Event. Dispatch it
        private dispatchDomEvent(ev: Event) {
                const targetElem = ev.target as Element | null;
                if (!targetElem) return;

                const propName = `on${ev.type}`;

                let el: Element | null = targetElem.closest('[data-delphine-component]');
                if (!el) return;
                const name = el.getAttribute('data-delphine-name');
                let comp = name ? this.componentRegistry.get(name) : null;
                while (comp) {
                        const handler = comp.getProp<THandler>(propName); // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

                        //const handler = comp.getProperty(propName); //comp?.props[propName as keyof typeof comp.props] as THandler | null;
                        if (handler && handler.s && handler.s != '') {
                                handler.fire(this, propName, ev, comp);
                                return;
                        }
                        //el = next ?? el.parentElement?.closest('[data-delphine-component]') ?? null;
                        comp = comp.parent;
                }

                // No handler here: try going "up" using your component tree if possible
        }

        show() {
                // Must be done before buildComponentTree() because `buildComponentTree()` does not do `resolveRoot()` itself.
                if (!this.elem) {
                        this.elem = this.componentRegistry.resolveRoot(); // ou this.resolveRoot()
                }
                if (!this._mounted) {
                        this.componentRegistry.buildComponentTree(this, this);
                        this.onCreate(); // Maybe could be done after installEventRouter()
                        this.installEventRouter();
                        this._mounted = true;
                }
                this.onShown();

                // TODO
        }

        protected onCreate() {
                const onShownName = this.elem!.getAttribute('data-delphine-oncreate');
                if (onShownName) {
                        queueMicrotask(() => {
                                const fn = (this as any)[onShownName];
                                if (typeof fn === 'function') fn.call(this, null, this);
                        });
                }
        }

        protected onShown() {
                const onShownName = this.elem!.getAttribute('data-delphine-onshown');
                if (onShownName) {
                        queueMicrotask(() => {
                                const fn = (this as any)[onShownName];
                                if (typeof fn === 'function') fn.call(this, null, this);
                        });
                }
        }

        public mount(container: HTMLElement): void {
                container.innerHTML = this.getHtml();
                this.afterMount();
        }

        protected getHtml(): string {
                return '<h1>Empty TForm</h1>';
        }

        protected afterMount(): void {
                // Default: do nothing
        }
}
