import type { UnknownRecord } from './Oops';
import type { PropSpec, PropKind } from './Component';

import type { IForm } from './IForm';
import { getApplication } from './IApplication';
import { TControl, TMetaControl, TColor, THandler } from './Control';
import type { IPluginHost } from './CompositeControl';
import type { ICompositeControl } from './ICompositeControl';

export class BuildComponentTree {
        RESERVED_DATA_ATTRS = new Set<string>([
                'data-delphine-component',
                'data-delphine-name',
                'data-delphine-props',
                'data-delphine-message' // add any meta/framework attrs you don't want treated as props
        ]);

        static singeleton: BuildComponentTree = new BuildComponentTree();

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
                        if (this.RESERVED_DATA_ATTRS.has(attrName)) continue;

                        const propName = attrName.slice('data-delphine-'.length);
                        // Skip empty names
                        if (!propName) continue;

                        out[propName] = attr.value;
                }

                return out;
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
        //titi=12;
        /**
         * Parse HTML attributes + JSON bulk into a plain object of typed props.
         * - Reads JSON from data-delphine-props
         * - Reads data-delphine-xxx attributes (excluding reserved ones)
         * - For each candidate prop name, resolves the nearest PropSpec by walking metaclass inheritance.
         * - Applies conversion based on spec.kind
         * - data-delphine-xxx overrides data-delphine-props
         */
        private parsePropsFromElement(comp: TControl) {
                const el: Element | null = comp.elem;

                if (!el) return;

                // 1) Extract JSON bulk props from data-delphine-props
                const jsonProps = this.extractJsonProps(el);

                // 2) Extract data-delphine-xxx attributes (excluding reserved)
                const dataAttrs = this.extractDataAttributes(el);

                // 3) Apply JSON first, then data-delphine-xxx overrides
                this.applyPropsFromSource(comp, jsonProps, comp.getMetaclass() as TMetaControl);
                this.applyPropsFromSource(comp, dataAttrs, comp.getMetaclass() as TMetaControl);
        }

        buildComponentTree(el: Element, form: IForm, parent: TControl): TControl | null {
                const name = el.getAttribute('data-delphine-name');
                const type = el.getAttribute('data-delphine-component');

                const cls = type != null ? getApplication()?.getClass(type) : null;

                if (!cls) return null;

                let child = null;
                // The TForm are already created by the user.
                if (!cls.isAForm()) {
                        const metaComp = cls as TMetaControl;
                        child = metaComp.create(name!, form, parent); // ------- The instance variable is created HERE!
                        if (cls.isACompositeControl()) {
                                const comp = child as any as ICompositeControl;
                                form.registerFrame(name!, comp);
                                form = comp; // We pretend that we are the Form
                        }
                } else {
                        child = parent;
                }
                if (!child) return null;
                child.elem = el;

                form.registerInstance(name!, child);

                // We collect
                this.parsePropsFromElement(child);

                //child.syncDomFromProps();

                (child as any).onAttachedToDom?.();

                const maybeFrame = el.getAttribute('data-delphine-frame');

                if (maybeFrame && maybeFrame != '') {
                        const frame = getApplication()?.getClass(maybeFrame);
                        const schema = frame?.getSchema();
                        child.elem.innerHTML = schema?.component;
                        //form = child as any as ICompositeControl;
                }

                // Done in the constructor //parent.children.push(child);
                const maybePluginHost = child as unknown as IPluginHost;
                if (maybePluginHost && typeof maybePluginHost.setPluginSpec === 'function') {
                        //maybeHost.setPluginSpec(cls);
                        //const plugin = el.getAttribute('data-delphine-plugin');
                        const raw = el.getAttribute('data-delphine-props');
                        const props = raw ? JSON.parse(raw) : {};

                        maybePluginHost?.setPluginSpec!({ plugin: type, props });
                        maybePluginHost?.mountPluginIfReady!();
                }

                if (child.allowsChildren()) {
                        el.querySelectorAll(':scope > [data-delphine-component]').forEach((el) => {
                                this.buildComponentTree(el, form, child);
                                //if (el === root) return;
                        });
                }
                return child;
                //if (el === root) return; // No need to go higher in the hierachy
        }
}
