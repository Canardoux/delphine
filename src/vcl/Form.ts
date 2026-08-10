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

//import { TComponent } from './Component';
//import { TMetaContainer, TContainer } from './Container';
//import type { PropSpec } from './IComponent';
import type { IForm } from './IForm';
//import type { IMetaControl, IControl } from './IControl';
import { getApplication } from './IApplication';
//import type { ComponentSchema } from './IComponent';
//import type { IComponent } from './IComponent';
//import type { IMetaComponent } from './IComponent';
//import { TMetaCompositeControl, TCompositeControl } from './CompositeControl';
import { TFrame } from './palettes/standard/TFrame';

// export class TMetaForm extends TMetaCompositeControl implements IMetaComponent, IMetaControl {
//         static readonly metaclass: TMetaForm = new TMetaForm(TMetaCompositeControl.metaclass, 'TForm');
//         //getMetaClass() {
//         //return TMetaForm.metaclass;
//         //}

//         protected constructor(superClass: TMetaContainer, name: string) {
//                 super(superClass, name);
//                 // et vous changez juste le nom :
//         }

//         create(name: string, form: TForm, parent: TComponent) {
//                 return new TForm(name);
//         }

//         isAForm(): boolean {
//                 return true;
//         }

//         defProps(): PropSpec<any>[] {
//                 return [
//                         //{ name: 'caption', kind: 'string', apply: (o, v) => (o.caption = String(v)) },
//                         //{ name: 'enabled', kind: 'boolean', apply: (o, v) => (o.enabled = Boolean(v)) }
//                 ];
//         }

//         /*
//         getSchema(): ComponentSchema | null {
//                 return {
//                         name: this.typeName,
//                         label: 'TForm',
//                         category: 'Standard Control',
//                         icon: undefined,
//                         component: this,
//                         isContainer: true,
//                         instanceName: 'Form',
//                         tagName: 'div',
//                         resizable: false,

//                         //hoverable: true,
//                         //layerable: true,
//                         //removable: false,
//                         //draggable: true,
//                         droppable: true,
//                         //copyable: false,

//                         props: this.propSpecsToSchemaProps()
//                 };
//         }
//                 */
//         getSchema(): ComponentSchema | null {
//                 return null;
//         }
// }

export class TForm implements IForm {
        //getMetaclass() {
        //return TMetaForm.metaclass;
        //}
        //static forms = new Map<string, TForm>();
        //private _mounted = false;
        //protected _created = false;
        static forms = new Map<string, TForm>();
        readonly name: string;
        readonly frame: TFrame;
        readonly elem: HTMLElement;

        constructor(frameName: string, formName: string) {
                this.name = formName;
                const frame = document.createElement(frameName) as TFrame;

                this.frame = frame;

                const host = document.createElement('div');

                host.classList.add('delphine-form');

                host.dataset.delphineForm = formName;

                host.hidden = true;

                host.appendChild(frame);
                TForm.forms.set(formName, this);

                this.elem = host;
        }

        // mount(parent: HTMLElement): void {
        //         if (!this.elem.isConnected) {
        //                 parent.appendChild(this.elem);
        //         }
        // }

        // public mount(container: HTMLElement): void {
        //         container.innerHTML = this.getHtml();
        //         this.afterMount();
        // }

        // Each Form has its own componentRegistry

        //typeRegistry: TComponentTypeRegistry | null = null;
        // constructor(frame: TLitFrame, name: string) {
        //         //super(TMetaForm.metaclass, name, null, null);
        //         //this.form = this;
        //         this.name = name;
        //         this.elem = frame;
        //TForm.forms.set(name, this);
        //}

        mount(parent: HTMLElement) {
                if (!this.elem.isConnected) parent.appendChild(this.elem);
        }

        getName() {
                return this.name;
        }

        // Form.ts
        // -------

        //elem: Element | null = null;

        // hide(): void {
        //         if (!this.elem) {
        //                 return;
        //         }

        //         const host = this.elem.parentElement;
        //         if (host) {
        //                 host.hidden = true;
        //         }
        // }

        hide(): void {
                this.elem.hidden = true;
        }
        show(): void {
                if (!this.elem) {
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

                //this.elem = null;
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

        protected getHtml(): string {
                return '<h1>Empty TForm</h1>';
        }

        // protected afterMount(): void {
        //         // Default: do nothing
        // }
}
