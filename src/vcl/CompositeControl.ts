// CompositeControl.ts
// -------------------

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

//import { TControl, THandler } from './Control';
//import { TComponent } from './Component';
import { TMetaContainer, TContainer } from './Container';
import type { PropSpec, TMetaComponent } from './Component';
//import { TComponentRegistry } from './ComponentRegistry';
//import { TTypeRegistry } from './TypeRegistry';
//import type { IForm } from './IForm';
//import type { IApplication } from './IApplication';
import type { IMetaControl, IControl } from './IControl';
//import { registerBuiltins } from './RegisterVcl';
//import { getApplication } from './IApplication';
import type { ComponentSchema } from './IComponent';
import type { IComponent } from './IComponent';
import type { IMetaComponent } from './IComponent';
import type { ICompositeControl, IMetaCompositeControl } from './ICompositeControl';
import { TComponentRegistry } from './ComponentRegistry';
import { TControl, THandler } from './Control';

//import type { UIPluginInstance } from './ICompositeControl';
//import { Json } from './IComponent';

export class TMetaCompositeControl extends TMetaContainer implements IMetaComponent, IMetaControl, IMetaCompositeControl {
        static readonly metaclass: TMetaCompositeControl = new TMetaCompositeControl(TMetaContainer.metaclass, 'TCompositeControl');
        schema: ComponentSchema = {
                name: this.typeName,
                label: 'TCompositeControl',
                category: 'Standard Control',
                icon: undefined,
                component: this,
                props: this.propSpecsToSchemaProps()
        };

        constructor(superClass: TMetaContainer, name: string) {
                super(superClass, name);
        }

        defProps(): PropSpec<any>[] {
                return [
                        //{ name: 'caption', kind: 'string', apply: (o, v) => (o.caption = String(v)) },
                        //{ name: 'enabled', kind: 'boolean', apply: (o, v) => (o.enabled = Boolean(v)) }
                ];
        }

        getSchema(): ComponentSchema {
                return this.schema;
        }

        isACompositeControl(): boolean {
                return true;
        }
}

export class TCompositeControl extends TContainer implements IControl, IComponent, ICompositeControl {
        registerInstance(name: string, c: IControl): void {
                this.componentRegistry.registerInstance(name, c as TControl);
        }

        pluginName: string | null = null;
        pluginProps: any = {};
        pluginPropsKey: string = '';

        isACompositeControl(): boolean {
                return true;
        }

        stableStringify(v: any): string {
                // Good enough for cheap change detection
                try {
                        return JSON.stringify(v);
                } catch {
                        return '';
                }
        }

        safeParseJson(s: string | null): any {
                if (!s) return {};
                try {
                        return JSON.parse(s);
                } catch {
                        return {};
                }
        }

        getName() {
                return this.name;
        }

        componentRegistry: TComponentRegistry = new TComponentRegistry();

        frames: ICompositeControl[] = [];
        registerFrame(name: string, comp: ICompositeControl): void {
                this.frames.push(comp);
        }
}
