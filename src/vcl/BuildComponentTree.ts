import type { UnknownRecord } from './Oops';
import type { TComponent, TMetaComponent } from './Component';
import type { PropSpec, PropKind } from './IComponent';

import type { IForm } from './IForm';
import { getApplication } from './IApplication';
import { TControl, TMetaControl, TColor, THandler } from './Control';
import type { IPluginHost, TCompositeControl } from './CompositeControl';
import type { ICompositeControl } from './ICompositeControl';
import { TLitControlElement } from './LitControlElement';
//import { TMetaLitFrame } from './palettes/lit/TLitFrame';

export class BuildComponentTree {
        RESERVED_DATA_ATTRS = new Set<string>([
                'data-delphine-component',
                'data-delphine-name',
                'data-delphine-props',
                'data-delphine-message' // add any meta/framework attrs you don't want treated as props
        ]);

        static singeleton: BuildComponentTree = new BuildComponentTree();

        private convert(raw: string, kind: PropKind, defaultValue: unknown) {
                if (typeof raw === 'string') {
                        switch (kind) {
                                case 'string':
                                        return raw;
                                case 'number':
                                        return Number(raw);
                                case 'boolean':
                                        if (raw === null || raw === '') {
                                                return defaultValue ?? false;
                                        }
                                        return raw === 'true' || raw === '1' || raw === 'on' || raw === 'yes';
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
        private applyPropsFromSource(comp: TComponent, src: UnknownRecord, meta: TMetaControl) {
                for (const [name, rawValue] of Object.entries(src)) {
                        const spec = this.resolveNearestPropSpec(meta, name);
                        if (!spec) continue; // Not a declared prop -> ignore
                        const v: string = rawValue as string;
                        // Note: data-delphine-xxx gives strings; data-delphine-props can give any JSON type.
                        const value = this.convert(v, spec.kind, spec.default);

                        //out[name] = value; // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
                        //comp.setHtmlProp(name, value); // for convenience, setHtmlProp can be used by the component itself to react to prop changes.
                        comp.setProp(name, value);
                        spec.apply(comp, value);
                }
        }
        /**
         * Parse HTML attributes + JSON bulk into a plain object of typed props.
         * - Reads JSON from data-delphine-props
         * - Reads data-delphine-xxx attributes (excluding reserved ones)
         * - For each candidate prop name, resolves the nearest PropSpec by walking metaclass inheritance.
         * - Applies conversion based on spec.kind
         * - data-delphine-xxx overrides data-delphine-props
         */
        private parsePropsFromElement(comp: TComponent) {
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

        private applyLoadedUnitStyle(unitName: string, cssText: string): void {
                if (!cssText.trim()) {
                        return;
                }

                const styleId = `delphine-unit-style-${unitName}`;

                let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
                if (!styleEl) {
                        styleEl = document.createElement('style');
                        styleEl.id = styleId;
                        document.head.appendChild(styleEl);
                }

                styleEl.textContent = cssText;
        }

        directDelphineChildren(el: Element): Element[] {
                const hasShadowRoot = !!el.shadowRoot;
                const _root = hasShadowRoot ? el.shadowRoot! : el;
                return Array.from(_root.children).filter((child) => child instanceof Element && child.hasAttribute('data-delphine-component'));
        }

        async createTree(el: TLitControlElement, frame: any): Promise<Element | null> {
                if ((el as any).updateComplete) {
                        await (el as any).updateComplete;
                }

                const name = el.getAttribute('data-delphine-name');
                const type = el.getAttribute('data-delphine-component');
                //console.log('      processing ', name, type);

                const children = this.directDelphineChildren(el);
                if (children.length != 0) {
                        // console.log(
                        //         'scan',
                        //         {
                        //                 el,
                        //                 tag: el.tagName,
                        //                 name: name,
                        //                 type: type,
                        //                 hasShadowRoot: !!el.shadowRoot
                        //         },
                        //         children
                        // );
                        for (const childEl of children) {
                                await this.createTree(childEl as TLitControlElement, frame);
                        }
                        // console.log('--- end scan', {
                        //         el,
                        //         tag: el.tagName,
                        //         name: name,
                        //         type: type
                        // });
                }

                return el;
        }

        async buildComponentTree(el: Element, frame: Element): Promise<void> {
                await this.createTree(el as TLitControlElement, frame);
        }
}

// -----------------------------------------------------------------------------------------------------------

// BuildComponentTree.ts

type RegistryLike = {
        registerComponent?: (name: string, el: Element) => void;
        componentRegistry?: Map<string, Element>;
};

type DelphineElement = Element & {
        readonly isDelphineComponent: true;
};

type DelphineFrameElement = DelphineElement &
        RegistryLike & {
                readonly isDelphineFrame: true;
        };

function isDelphineElement(el: Element): el is DelphineElement {
        return (el as Partial<DelphineElement>).isDelphineComponent === true;
}

function isDelphineFrame(el: Element): el is DelphineFrameElement {
        return (el as Partial<DelphineFrameElement>).isDelphineFrame === true;
}

function delphineNameOf(el: Element): string | null {
        return el.getAttribute('data-delphine-name') ?? el.getAttribute('name') ?? null;
}

function registerInFrame(frame: RegistryLike, el: Element): void {
        const name = delphineNameOf(el);
        if (!name) return;

        if (frame.registerComponent) {
                frame.registerComponent(name, el);
                return;
        }

        frame.componentRegistry?.set(name, el);
}

async function waitLitIfNeeded(el: Element): Promise<void> {
        const maybeLit = el as Element & {
                updateComplete?: Promise<unknown>;
        };

        if (maybeLit.updateComplete) {
                await maybeLit.updateComplete;
        }
}

/*
 * Do not filter here.
 *
 * Ordinary HTML elements such as div, section or span may contain
 * Delphine components and must therefore remain traversable.
 */
function directLightChildren(el: Element): Element[] {
        return Array.from(el.children);
}

function directShadowChildren(el: Element): Element[] {
        const root = el.shadowRoot;
        if (!root) return [];

        return Array.from(root.children);
}

function assignedSlotChildren(el: Element): Element[] {
        const root = el.shadowRoot;
        if (!root) return [];

        const result: Element[] = [];

        root.querySelectorAll('slot').forEach((slot) => {
                result.push(...slot.assignedElements({ flatten: true }));
        });

        return result;
}

function directChildren(el: Element): Element[] {
        return [...new Set([...directLightChildren(el), ...assignedSlotChildren(el), ...directShadowChildren(el)])];
}

export class ComponentTreeIndexer {
        async indexFrame(root: Element, frame: RegistryLike): Promise<void> {
                /*
                 * Wait until the root frame has completed its Lit update,
                 * but do not register the root frame in its own registry.
                 */
                await waitLitIfNeeded(root);

                for (const child of directChildren(root)) {
                        await this.indexElement(child, frame);
                }
        }

        private async indexElement(el: Element, frame: RegistryLike): Promise<void> {
                await waitLitIfNeeded(el);

                /*
                 * Register Delphine components only.
                 * Ordinary HTML elements are traversed but not registered.
                 */
                if (isDelphineElement(el)) {
                        registerInFrame(frame, el);
                }

                /*
                 * A nested frame belongs to the current frame's registry,
                 * but its internal components belong exclusively to its own
                 * registry.
                 */
                if (isDelphineFrame(el)) {
                        return;
                }

                for (const child of directChildren(el)) {
                        await this.indexElement(child, frame);
                }
        }
}
