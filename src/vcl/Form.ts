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
import { BuildComponentTree } from './BuildComponentTree';
import { listenerCount } from 'process';
import { EventManager } from './event';

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
        eventManager = new EventManager();
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
                BuildComponentTree.singeleton.buildComponentTree(this.elem, this, this);

                // 5. Install event routing
                this.eventManager.installEventRouter(this, this.elem);

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
