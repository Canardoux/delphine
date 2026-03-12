// ComponentRegistry.ts
// --------------------

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

import { TControl, TMetaControl, TColor, THandler } from './Base';
import type { PropSpec, PropKind } from './Component';
import type { IForm } from './IForm';
//import { TMetaForm, TForm } from './Form';
//import { TMetaObject, TMetaclass, TObject } from './Oops';
//import { TMetaButton, TMetaPanel } from './StdCtrls';
//import { TApplication } from './Application';
import { TMetaclass, TObject } from './Oops';
import type { IPluginHost } from './IPlugin';
import { getApplication } from './IApplication';
import type { IApplication } from './IApplication';

export type ComponentFactory = (name: string, form: IForm, owner: TControl) => TControl;
type UnknownRecord = Record<string, unknown>;

const RESERVED_DATA_ATTRS = new Set<string>([
        'data-delphine-component',
        'data-delphine-name',
        'data-delphine-props',
        'data-delphine-plugin',
        'data-delphine-message' // add any meta/framework attrs you don't want treated as props
]);

export class TMetaComponentRegistry extends TMetaclass {
        static readonly metaclass: TMetaComponentRegistry = new TMetaComponentRegistry(TMetaclass.metaclass, 'TComponentTypeRegistry');

        protected constructor(superClass: TMetaclass, name: string) {
                super(superClass, name);
        }
        getMetaclass(): TMetaComponentRegistry {
                return TMetaComponentRegistry.metaclass;
        }
}

export class TComponentRegistry extends TObject {
        //_toto: Toto = new Toto();
        getMetaclass(): TMetaComponentRegistry {
                return TMetaComponentRegistry.metaclass;
        }

        private instances = new Map<string, TControl>();

        constructor() {
                super();
        }

        registerInstance(name: string, c: TControl) {
                this.instances.set(name, c);
        }
        get<T extends TControl = TControl>(name: string): T | undefined {
                return this.instances.get(name) as T | undefined;
        }

        clear() {
                this.instances.clear();
        }

        resolveRoot(): HTMLElement {
                // Prefer body as the canonical root.
                if (document.body?.dataset?.component) return document.body;

                // Backward compatibility: old wrapper div.
                const legacy = document.getElementById('delphine-root');
                if (legacy) return legacy;

                // Last resort.
                return document.body ?? document.documentElement;
        }

        private convert(raw: string, kind: PropKind) {
                if (typeof raw === 'string') {
                        switch (kind) {
                                case 'string':
                                        return raw;
                                case 'number':
                                        return Number(raw);
                                case 'boolean':
                                        return raw === 'true' || raw === '1' || raw === '';
                                case 'color':
                                        return new TColor(raw); // ou parse en TColor si vous avez
                                case 'handler':
                                        return new THandler(raw);
                        }
                }
                return raw;
        }

        // -------------------- Properties --------------------

        /**
         * Find the nearest PropSpec for a prop name by walking meta inheritance:
         * meta -> meta.superClass -> ...
         * Uses caching for speed.
         */
        private resolveNearestPropSpec(meta: TMetaControl, propName: string): PropSpec<any> | null {
                /*
                let perMeta = this._propSpecCache.get(meta);
                if (!perMeta) {
                        perMeta = new Map<string, PropSpec<any> | null>();
                        this._propSpecCache.set(meta, perMeta);
                }

                if (perMeta.has(propName)) {
                        return perMeta.get(propName)!;
                }
                        */

                // Walk up metaclass inheritance: child first (nearest wins)
                let mc: TMetaControl | null = meta;

                while (mc) {
                        if (typeof mc.defProps === 'function') {
                                const defs = mc.defProps();
                                for (const spec of defs) {
                                        if (spec.name === propName) {
                                                //perMeta.set(propName, spec);
                                                return spec;
                                        }
                                }
                        }
                        mc = (mc.superClass as TMetaControl) ?? null;
                }

                //perMeta.set(propName, null);
                return null;
        }

        private applyPropsFromSource(comp: TControl, src: UnknownRecord, meta: TMetaControl) {
                for (const [name, rawValue] of Object.entries(src)) {
                        const spec = this.resolveNearestPropSpec(meta, name);
                        if (!spec) continue; // Not a declared prop -> ignore
                        const v: string = rawValue as string;
                        // Note: data-delphine-xxx gives strings; data-delphine-props can give any JSON type.
                        const value = this.convert(v, spec.kind);

                        //out[name] = value; // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
                        //comp.setHtmlProp(name, value); // for convenience, setHtmlProp can be used by the component itself to react to prop changes.
                        comp.setProp(name, value);
                        spec.apply(comp, value);
                }
        }

        private extractJsonProps(el: Element): UnknownRecord {
                const raw = el.getAttribute('data-delphine-props');
                if (!raw) return {};

                try {
                        const parsed = JSON.parse(raw);
                        // Only accept plain objects
                        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                                return parsed as UnknownRecord;
                        }
                        return {};
                } catch (e) {
                        console.error('Invalid JSON in data-delphine-props', raw, e);
                        return {};
                }
        }

        private extractDataAttributes(el: Element): UnknownRecord {
                const out: UnknownRecord = {};

                // Iterate all attributes, keep only data-delphine-xxx (except reserved)
                for (const attr of Array.from(el.attributes)) {
                        const attrName = attr.name;
                        if (!attrName.startsWith('data-delphine-')) continue;
                        if (RESERVED_DATA_ATTRS.has(attrName)) continue;

                        const propName = attrName.slice('data-delphine-'.length);
                        // Skip empty names
                        if (!propName) continue;

                        out[propName] = attr.value;
                }

                return out;
        }
        // ==================================================================================

        // English comments as requested.

        // Cache: per metaclass -> (propName -> nearest PropSpec or null if not found)
        //private readonly _propSpecCache = new WeakMap<TMetaComponent, Map<string, PropSpec<any> | null>>();

        /**
         * Parse HTML attributes + JSON bulk into a plain object of typed props.
         * - Reads JSON from data-delphine-props
         * - Reads data-delphine-xxx attributes (excluding reserved ones)
         * - For each candidate prop name, resolves the nearest PropSpec by walking metaclass inheritance.
         * - Applies conversion based on spec.kind
         * - data-delphine-xxx overrides data-delphine-props
         */
        parsePropsFromElement(comp: TControl) {
                const el: Element | null = comp.elem;

                if (!el) return;

                // 1) Extract JSON bulk props from data-delphine-props
                const jsonProps = this.extractJsonProps(el);

                // 2) Extract data-delphine-xxx attributes (excluding reserved)
                const dataAttrs = this.extractDataAttributes(el);

                // 3) Apply JSON first, then data-delphine-xxx overrides
                this.applyPropsFromSource(comp, jsonProps, comp.getMetaclass());
                this.applyPropsFromSource(comp, dataAttrs, comp.getMetaclass());
        }

        private processElem(el: Element, form: IForm, parent: TControl): TControl | null {
                const name = el.getAttribute('data-delphine-name');
                const type = el.getAttribute('data-delphine-component');

                //const cls = getApplication()?.types.get(type!);
                const cls = type != null ? getApplication()?.getClass(type) : null;
                if (!cls) return null;

                let child = parent;
                if (!cls.isAForm()) {
                        const comp = cls as TMetaControl;
                        // The TForm are already created by the user.
                        child = comp.create(name!, form, parent);
                }

                this.registerInstance(name!, child);
                // name: string, form: TForm, parent: TComponent, elem: HTMLElement
                if (!child) return null;

                //child.parent = component;

                child.elem = el;
                //child.form = form;
                //child.name = name!;
                //child.props = {};

                // We collect
                this.parsePropsFromElement(child);
                child.syncDomFromProps();
                (child as any).onAttachedToDom?.();

                // Done in the constructor //parent.children.push(child);
                const maybeHost = child as unknown as Partial<IPluginHost>;
                if (maybeHost && typeof maybeHost.setPluginSpec === 'function') {
                        /*
                        const plugin = el.getAttribute('data-delphine-plugin');
                        const raw = el.getAttribute('data-delphine-props');
                        const props = raw ? JSON.parse(raw) : {};

                        maybeHost.setPluginSpec({ plugin, props });
                        maybeHost.mountPluginIfReady!(this._toto.services);
                        //maybeHost.mountFromRegistry(services);
                        */

                        const plugin = el.getAttribute('data-delphine-plugin');
                        const raw = el.getAttribute('data-delphine-props');
                        const props = raw ? JSON.parse(raw) : {};

                        maybeHost.setPluginSpec({ plugin, props });
                        maybeHost.mountPluginIfReady!();
                }

                if (child.allowsChildren()) {
                        el.querySelectorAll(':scope > [data-delphine-component]').forEach((el) => {
                                this.processElem(el, form, child);
                                //if (el === root) return;
                        });
                }
                return child;
                //if (el === root) return; // No need to go higher in the hierachy
        }

        // This function is called juste once, when the form is created
        buildComponentTree(form: IForm, root: TControl) {
                this.clear();
                // --- FORM ---
                // provisoirement if (root.getAttribute('data-delphine-component') === 'TForm') {
                //const el = root.elem!;

                //this.registerInstance(root.name, form);
                //}
                const rootElem = root.elem!;
                this.processElem(rootElem, form, root);

                // --- CHILD COMPONENTS ---
                /*
                rootElem.querySelectorAll(':scope > [data-delphine-component]').forEach((el) => {
                        const child: TComponent | null = this.processElem(el, form, root);
                        //if (el === root) return;
                        if (child && child.allowsChildren()) {
                                el.querySelectorAll(':scope > [data-delphine-component]').forEach((el) => {
                                        this.processElem(el, form, child);
                                        //if (el === root) return;
                                });
                        }
                });
                */
        }
}
