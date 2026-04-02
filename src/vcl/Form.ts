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

import { TControl, THandler } from './Control';
import { TComponent } from './Component';
import { TMetaContainer, TContainer } from './Container';
import type { PropSpec, TMetaComponent } from './Component';
import { TTypeRegistry } from './TypeRegistry';
import type { IForm } from './IForm';
import type { IApplication } from './IApplication';
import type { IMetaControl, IControl } from './IControl';
import { registerBuiltins } from './RegisterVcl';
import { getApplication } from './IApplication';
import type { ComponentSchema } from './IComponent';
import type { IComponent } from './IComponent';
import type { IMetaComponent } from './IComponent';
import { TMetaCompositeControl, TCompositeControl } from './CompositeControl';
import type { ICompositeControl } from './ICompositeControl';

export class TMetaForm extends TMetaCompositeControl implements IMetaComponent, IMetaControl {
        static readonly metaclass: TMetaForm = new TMetaForm(TMetaCompositeControl.metaclass, 'TForm');
        //getMetaClass() {
        //return TMetaForm.metaclass;
        //}

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

        getSchema(): ComponentSchema {
                return {
                        name: this.typeName,
                        label: 'TForm',
                        category: 'Standard Control',
                        icon: undefined,
                        component: this,
                        props: this.propSpecsToSchemaProps()
                };
        }
}

export class TForm extends TCompositeControl implements IForm, IControl, IComponent {
        //getMetaclass() {
        //return TMetaForm.metaclass;
        //}
        static forms = new Map<string, TForm>();
        private _mounted = false;
        // Each Form has its own componentRegistry

        //typeRegistry: TComponentTypeRegistry | null = null;
        constructor(name: string) {
                super(TMetaForm.metaclass, name, null, null);
                this.form = this;
                TForm.forms.set(name, this);
        }

        getName() {
                return this.name;
        }

        /*
        getClass(type: string): IControl | undefined {
                
                if (!this.typeRegistry) {
                        this.typeRegistry = new TComponentTypeRegistry();
                        registerBuiltins(this.typeRegistry);
                }
                        
                return this.typeRegistry?.get(type);
        }
                */

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
                const meta = this.getMetaclass() as TMetaForm;
                for (const type in meta.domEvents) {
                        root.addEventListener(type, handler, { capture: true, signal });
                }
        }

        disposeEventRouter() {
                this._ac?.abort();
                this._ac = null;
        }

        getComponentFromName(composit: TCompositeControl, name: string): { comp: TControl; composit: TCompositeControl } | null {
                let comp = name ? composit.componentRegistry.get(name) : null;
                //while (!comp) {
                if (comp) {
                        return { comp, composit };
                }
                for (const frame of composit.frames) {
                        composit = frame as TCompositeControl;
                        const r = this.getComponentFromName(composit, name);
                        if (r) {
                                return r;
                        }
                }
                //}
                return null;
        }

        // We received an DOM Event. Dispatch it
        private dispatchDomEvent(ev: Event) {
                const targetElem = ev.target as Element | null;
                if (!targetElem) return;

                const propName = `on${ev.type}`;

                let el: Element | null = targetElem.closest('[data-delphine-component]');
                if (!el) return;
                const name = el.getAttribute('data-delphine-name');
                const r = this.getComponentFromName(this, name!);

                let rc = r?.comp ?? null;
                //let comp = name ? this.getComponentFromName(this, name) : null;
                while (r && rc) {
                        const handler = rc.getProp<THandler>(propName); // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

                        //const handler = comp.getProperty(propName); //comp?.props[propName as keyof typeof comp.props] as THandler | null;
                        if (handler && handler.s && handler.s != '') {
                                handler.fire(r.composit, propName, ev, rc);
                                return;
                        }
                        //el = next ?? el.parentElement?.closest('[data-delphine-component]') ?? null;
                        rc = rc.parent;
                }

                // No handler here: try going "up" using your component tree if possible
        }

        // Form.ts
        // -------

        //elem: Element | null = null;
        protected _created = false;

        resolveRoot(container: HTMLElement): HTMLElement {
                // Look for first element marked as a Delphine component root
                for (const child of Array.from(container.children)) {
                        if (child instanceof HTMLElement && child.hasAttribute('data-delphine-component')) {
                                // Debug (optional)
                                for (const c of Array.from(container.children)) {
                                        console.log('child:', c.tagName, c.getAttribute('data-delphine-component'));
                                }

                                return child;
                        }
                }

                throw new Error('Delphine: no root component found in container');
        }

        /**
         * Create the Form DOM under <body>, hidden by default,
         * then build the component tree from the injected HTML.
         */
        //create(htmlSource: string): void {
        create(htmlSource: string, parent?: HTMLElement): void {
                if (this._created) {
                        return;
                }

                // 1. Create a hidden host container under <body>
                const host = document.createElement('div');
                host.hidden = true;
                host.setAttribute('data-delphine-form-host', this.name);
                document.body.appendChild(host);
                //const root = document.getElementById('delphine-root') ?? document.body;
                //root.appendChild(host);

                // 2. Inject the user HTML inside that host
                host.innerHTML = htmlSource;

                // 3. Resolve the actual root element of the Form
                //    In your current architecture, resolveRoot() knows how to find:
                //    - <body> if it is itself the root
                //    - or the first child carrying TForm metadata
                this.elem = this.resolveRoot(host);

                if (!this.elem) {
                        throw new Error(`Unable to resolve root element for form '${this.name}'`);
                }

                // 4. Build Delphine component tree
                this.componentRegistry.clear();
                this.buildComponentTree(this.elem, this, this);

                // 5. Install event routing
                this.installEventRouter();

                // 6. Mark as created, still hidden
                this._mounted = true;
                this._created = true;

                console.log('created form root =', this.elem);
                console.log('created form host =', this.elem?.parentElement);

                // 7. Lifecycle hook
                this.onCreate();
        }

        hide(): void {
                if (!this.elem) {
                        return;
                }

                const host = this.elem.parentElement;
                if (host) {
                        host.hidden = true;
                }
        }

        show(): void {
                debugger;
                if (!this.elem || !this._created) {
                        throw new Error(`Form ${this.name} not created`);
                }

                getApplication()!.showForm(this);

                //const focusTarget = this.elem.querySelector<HTMLElement>('[autofocus], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])');
                //focusTarget?.focus();
        }

        destroy(): void {
                if (!this.elem) {
                        return;
                }

                const host = this.elem.parentElement;
                if (host && host.hasAttribute('data-delphine-form-host')) {
                        host.remove();
                } else {
                        this.elem.remove();
                }

                this.elem = null;
                this._created = false;
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

        onShown() {
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
