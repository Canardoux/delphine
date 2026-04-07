// Component.ts
// ------------

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

import { TMetaclass, TObject, TMetaObject } from './Oops';
//import { TComponentRegistry } from './ComponentRegistry';
import type { IForm } from './IForm';
//import type { IControl, IMetaControl } from './IControl';
//import { TControl } from './Base';
import type { IComponent, IMetaComponent, ComponentSchema, PropSchema } from './IComponent';

export type PropSpec<T, V = unknown> = {
        name: string;
        kind: PropKind;
        default: unknown;
        retrieve: (obj: T) => V;
        apply: (obj: T, value: V) => void;
};

export type ComponentProps = Record<string, unknown>;
export type PropKind = 'string' | 'number' | 'boolean' | 'color' | 'handler';

export class TComponent extends TObject implements IComponent {
        //getMetaclass() {
        //return TMetaComponent.metaclass;
        //}
        constructor(metaclass: TMetaclass, name: string, form: IForm | null, parent: TComponent | null) {
                super(metaclass);
                //super(name, form, parent);
        }
        isAForm(): boolean {
                return false;
        }

        props: ComponentProps = Object.create(null);

        getProp<T = unknown>(name: string): T | undefined {
                return this.props[name] as T | undefined;
        }

        setProp(name: string, value: unknown): void {
                this.props[name] = value;
        }

        // optional
        hasProp(name: string): boolean {
                return Object.prototype.hasOwnProperty.call(this.props, name);
        }
        //protected props: ComponentProps = Object.create(null);

        isACompositeControl(): boolean {
                return false;
        }
}

export class TMetaComponent extends TMetaObject {
        static readonly metaclass: TMetaComponent = new TMetaComponent(TMetaObject.metaclass, 'TMetacomponent');

        protected constructor(superClass: TMetaObject, name: string) {
                super(superClass, name);
                //super(name, form, parent);
        }

        create(name: string, form: IForm, parent: TComponent): TComponent {
                return new TComponent(TMetaComponent.metaclass, name, form, parent);
        }

        getSchema(): ComponentSchema {
                return {
                        name: this.typeName,
                        label: 'TComponent',
                        category: 'Standard Control',
                        icon: undefined,
                        component: this,
                        props: this.propSpecsToSchemaProps(),
                        instanceName: 'component',
                        tagName: 'div'
                };
        }

        //getMetaclass() {
        //return TMetaComponent.metaclass;
        //}

        isAForm(): boolean {
                return false;
        }

        isACompositeControl(): boolean {
                return false;
        }

        defProps(): PropSpec<any>[] {
                return [
                        //{ name: 'color', kind: 'color', apply: (o, v) => (o.color = new TColor(String(v))) },
                        //{ name: 'oncreate', kind: 'handler', apply: (o, v) => (o.oncreate = new THandler(String(v))) }
                ];
        }

        propSpecsToSchemaProps(): PropSchema {
                const result: PropSchema = {};

                for (const spec of this.defProps()) {
                        result[spec.name] = {
                                kind: spec.kind,
                                default: spec.default
                        };
                }

                return result;
        }
        schemaPropsToPropSpecs(): PropSpec<any>[] {
                const schemaProps = (this as { schema?: ComponentSchema }).schema?.props;
                if (!schemaProps) return [];

                const result: PropSpec<any>[] = [];

                for (const name in schemaProps) {
                        const spec = schemaProps[name];
                        result.push({
                                name,
                                kind: spec!.kind,
                                default: spec!.default,
                                retrieve: (obj) => obj.getProp(name),
                                apply: (obj, value) => obj.setProp(name, value)
                        });
                }

                return result;
        }
}
