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

import { TComponent } from './Component';
import { TMetaContainer, TContainer } from './Container';
import type { PropSpec } from './IComponent';
import type { IForm } from './IForm';
import type { IMetaControl, IControl } from './IControl';
import { getApplication } from './IApplication';
import type { ComponentSchema } from './IComponent';
import type { IComponent } from './IComponent';
import type { IMetaComponent } from './IComponent';
import { TMetaCompositeControl, TCompositeControl } from './CompositeControl';

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
                        isContainer: true,
                        instanceName: 'form',
                        tagName: 'div',
                        resizable: false,

                        //removable: false,
                        //draggable: false,
                        //copyable: false,

                        props: this.propSpecsToSchemaProps()
                };
        }
}

export class TForm extends TCompositeControl implements IForm, IControl, IComponent {
        //getMetaclass() {
        //return TMetaForm.metaclass;
        //}
        //static forms = new Map<string, TForm>();
        //private _mounted = false;
        //protected _created = false;
        static forms = new Map<string, TForm>();

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
