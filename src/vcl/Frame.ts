// frame.ts
// --------

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
import { TComponentRegistry } from './ComponentRegistry';
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

export class TMetaFrame<T extends TFrame> extends TMetaCompositeControl implements IMetaComponent, IMetaControl {
        static readonly metaclass: TMetaFrame<TFrame> = new TMetaFrame(TMetaCompositeControl.metaclass, 'TFrame');

        protected constructor(superClass: TMetaContainer, name: string) {
                super(superClass, name);
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
                        label: 'TFrame',
                        category: 'Standard Control',
                        icon: undefined,
                        component: this,
                        isContainer: true,
                        instanceName: 'frame',
                        tagName: 'div',
                        resizable: false,

                        props: this.propSpecsToSchemaProps()
                };
        }
        create(name: string, form: IForm, parent: TControl) {
                return new TFrame(TMetaFrame.metaclass, name, form, parent) as T;
        }
}

export class TFrame extends TCompositeControl implements IControl, IComponent {
        emit(type: string, o: object) {
                // create custom events
                const e = new CustomEvent('frameevent', { detail: { eventType: type, data: o } });
                this.elem!.dispatchEvent(e);
        }

        get onframeevent(): THandler {
                const handler = this.props.onframeevent as THandler;
                return handler ?? new THandler('');
        }

        set onframeevent(handler) {
                this.props.onframeevent = handler;
        }
}

export class TMetaHostFrame<T extends THostFrame> extends TMetaContainer {
        static readonly metaclass: TMetaHostFrame<THostFrame> = new TMetaHostFrame(TMetaContainer.metaclass, 'THostFrame');

        protected constructor(superClass: TMetaContainer, name: string) {
                super(superClass, name);
        }

        defProps(): PropSpec<TFrame>[] {
                return [
                        //{ name: 'color', kind: 'color', apply: (o, v) => (o.color = new TColor(String(v))) },
                        //{ name: 'oncreate', kind: 'handler', apply: (o, v) => (o.oncreate = new THandler(String(v))) }
                        {
                                name: 'onframeevent',
                                default: '',
                                kind: 'handler',
                                retrieve: (o) => {
                                        return o.onframeevent;
                                },
                                //apply: (o, v) => (o.onclick = new THandler(String(v)))
                                apply: (o, v) => (o.onframeevent = v as THandler)
                        }
                ];
        }

        getSchema(): ComponentSchema {
                return {
                        name: this.typeName,
                        label: 'THostFrame',
                        category: 'Standard Control',
                        icon: undefined,
                        component: this,
                        isContainer: true,
                        instanceName: 'frame',
                        tagName: 'div',
                        resizable: false,

                        props: this.propSpecsToSchemaProps()
                };
        }
        create(name: string, form: IForm, parent: TControl) {
                return new THostFrame(name, form, parent) as T;
        }
}

export class THostFrame extends TContainer {
        constructor(name: string, form: IForm, parent: TControl) {
                super(TMetaHostFrame.metaclass, name, form, parent);
        }

        allowsChildren(): boolean {
                return true;
        }

        getSchema(): ComponentSchema {
                return TMetaHostFrame.metaclass.getSchema();
        }

        getFrame() {
                return this.children[0] as TFrame;
        }
}
