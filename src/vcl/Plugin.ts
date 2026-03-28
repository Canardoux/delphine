// Plugin.ts
// ---------
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

import { TForm } from './Form';
import type { IForm } from './IForm';
import { TControl, TMetaControl } from './Base';
import type { PropSpec } from './Component';
import { TApplication } from './Application';
import type { DelphineServices, UIPluginMessage, UIPluginInstance, UIPluginFactory, IMetaPluginHost, Json } from './IPlugin';
import type { IMetaComponent } from './IComponent';
import type { IComponent } from 'grapesjs';

// ============================================= PLUGINHOST ==========================================================

//export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export interface DelphineLogger {
        debug(msg: string, data?: Json): void;
        info(msg: string, data?: Json): void;
        warn(msg: string, data?: Json): void;
        error(msg: string, data?: Json): void;
}

export interface DelphineEventBus {
        // Subscribe to an app event.
        on(eventName: string, handler: (payload: Json) => void): () => void;

        // Publish an app event.
        emit(eventName: string, payload: Json): void;
}

export interface DelphineStorage {
        get(key: string): Promise<Json | undefined>;
        set(key: string, value: Json): Promise<void>;
        remove(key: string): Promise<void>;
}

export class Toto {
        logger = {
                debug(msg: string, data?: Json): void {},
                info(msg: string, data?: Json): void {},
                warn(msg: string, data?: Json): void {},
                error(msg: string, data?: Json): void {}
        };

        eventBus = {
                on(event: string, handler: (payload: any) => void): () => void {
                        return () => void {};
                },
                emit(event: string, payload: any): void {}
        };

        storage = {
                get(key: string): Promise<any> | null {
                        return null;
                },
                set(key: string, value: any): Promise<void> | null {
                        return null;
                },
                remove(key: string): Promise<void> | null {
                        return null;
                }
        };

        services: DelphineServices = {
                log: this.logger,
                bus: this.eventBus,
                storage: this.storage
        };
}
const toto: Toto = new Toto();

/*
export interface UIPluginInstance<Props extends Json = Json> {
        readonly id: string;

        // Called exactly once after creation (for a given instance).
        mount(container: HTMLElement, props: Props, services: DelphineServices): void;

        // Called any time props change (may be frequent).
        update(props: Props): void;

        // Called exactly once before disposal.
        unmount(): void;

        // Finished with this plugin
        dispose?(): void;

        // Optional ergonomics.
        getSizeHints?(): number;
        focus?(): void;

        // Optional persistence hook (Delphine may store & restore this).
        serializeState?(): Json;
}
        */

export class TMetaPluginHost extends TMetaControl implements IMetaPluginHost {
        pluginFactory: UIPluginFactory | null;
        static metaclass = new TMetaPluginHost(TMetaControl.metaclass, 'TPluginHost', null);
        //getMetaclass() {
        //        return TMetaPluginHost.metaclass;
        //}

        public constructor(superClass: TMetaControl, name: string, pluginFactory: UIPluginFactory | null) {
                super(superClass, name);
                this.pluginFactory = pluginFactory;
        }

        create(name: string, form: TForm, parent: TControl) {
                const pluginHost = new TPluginHost(name, form, parent);
                pluginHost.metaclass = this;
                return pluginHost;
        }

        defProps(): PropSpec<TPluginHost>[] {
                return [];
        }
}

function safeParseJson(s: string | null): any {
        if (!s) return {};
        try {
                return JSON.parse(s);
        } catch {
                return {};
        }
}

function stableStringify(v: any): string {
        // Good enough for cheap change detection
        try {
                return JSON.stringify(v);
        } catch {
                return '';
        }
}

export class TPluginHost extends TControl {
        private instance: UIPluginInstance | null = null;
        private services: DelphineServices | null = null;

        private pluginName: string | null = null;
        private pluginProps: any = {};
        private pluginPropsKey: string = '';
        //private factory: UIPluginFactory | null = null;
        //private pluginDef: UIPluginDef<Json> | null = null;
        //private meta: TMetaPluginHost | null = null;

        private mountPoint: HTMLElement | null = null;
        private observer: MutationObserver | null = null;

        private updateScheduled = false;

        constructor(name: string, form: IForm, parent: TControl) {
                super(TMetaPluginHost.metaclass, name, form, parent);
        }

        /** Replace ALL plugin props (rare). */
        setPluginProps(next: Record<string, any>) {
                this.pluginProps = next ?? {};
                this.scheduleUpdate();
        }

        setPluginProp(key: string, value: any) {
                console.log('SET PROP', key, value);
                console.log('pluginProps before =', this.pluginProps);

                const current = this.pluginProps?.[key];
                if (Object.is(current, value)) {
                        return;
                }

                const next = { ...(this.pluginProps ?? {}), [key]: value };
                const nextKey = stableStringify(next);

                this.pluginProps = next;
                this.pluginPropsKey = nextKey;

                const el = this.htmlElement;
                if (el) {
                        el.setAttribute('data-delphine-props', JSON.stringify(next));
                }

                console.log('CALLING PLUGIN UPDATE', next, this.instance);
                this.instance?.update(next);
        }

        getPluginProp<T = any>(name: string): T | undefined {
                return this.pluginProps[name] as T | undefined;
        }

        defProps(): PropSpec<any>[] {
                return (this.metaclass as TMetaPluginHost).schemaPropsToPropSpecs();
        }

        /** Patch many props at once (preferred). */
        patchPluginProps(patch: Record<string, any>) {
                Object.assign(this.pluginProps, patch);
                this.scheduleUpdate();
        }

        getName() {
                return this.name;
        }

        private scheduleUpdate() {
                if (this.updateScheduled) return;
                this.updateScheduled = true;

                queueMicrotask(() => {
                        this.updateScheduled = false;
                        this.instance?.update(this.pluginProps);
                });
        }

        /*
        mountPlugin(props: Json, services: DelphineServices) {
                const container = this.htmlElement;
                if (!container) return;

                if (!this.factory) {
                        services.log.warn('TPluginHost: no plugin factory set', { host: this.name as any });
                        return;
                }

                // Dispose old instance if any
                this.unmount();

                // Create plugin instance then mount
                this.instance = this.factory({ host: this, form: this.form! });
                this.instance!.mount(container, props, services);
        }
                */

        // Called by buildComponentTree()
        setPluginSpec(spec: { plugin: string | null; props: any }) {
                this.pluginName = spec.plugin;
                this.pluginProps = spec.props ?? {};
                //this.metaclass = spec.meta as TMetaPluginHost;
                //const meta = spec.meta as TMetaPluginHost;
                //meta.
                //this.meta = meta;
                //this.factory = spec.factory;
        }

        /*
        // Called by the metaclass (or by your registry) right after creation
        setPluginFactory(factory: UIPluginFactory) {
                this.factory = factory;
        }
                */

        private onPluginMessage(msg: UIPluginMessage) {
                if (msg.type === 'setProp') {
                        // Option A: update DOM data-delphine-props so your existing refreshFromDom pipeline stays consistent
                        this.setPluginProp(msg.key, msg.value);
                        return;
                }

                if (msg.type === 'event') {
                        // Optionnel: remonter dans le moteur d'events Delphine
                        //this.form?.dispatchPluginEvent?.(this, msg.name, msg.detail);
                }
        }

        // Called by buildComponentTree() when DOM element is assigned
        mountPluginIfReady() {
                const hostEl = this.htmlElement;
                if (!hostEl || !this.form) return;

                //this.services = toto.services; // TODO get real services from args

                // Inject a notify function *bound to this host*
                this.services = {
                        ...toto.services,
                        notify: (msg) => this.onPluginMessage(msg)
                };

                // Create a stable mount point INSIDE the host
                if (!this.mountPoint) {
                        this.mountPoint = document.createElement('div');
                        this.mountPoint.setAttribute('data-delphine-delphine-mount', '1');
                        hostEl.replaceChildren(this.mountPoint);
                }

                // Initial mount from DOM attributes
                this.refreshFromDom();

                // Observe attribute changes to keep plugin in sync
                if (!this.observer) {
                        this.observer = new MutationObserver((mutations) => {
                                for (const m of mutations) {
                                        if (m.type === 'attributes') {
                                                const a = m.attributeName;
                                                if (a === 'data-delphine-props') {
                                                        this.refreshFromDom();
                                                        break;
                                                }
                                        }
                                }
                        });
                        this.observer.observe(hostEl, { attributes: true });
                }
        }

        // English comments as requested.

        private refreshFromDom() {
                const services = this.services;
                const hostEl = this.htmlElement;
                if (!services || !hostEl || !this.form || !this.mountPoint) return;

                const newPlugin = hostEl.getAttribute('data-delphine-component'); // string | null
                const newProps = safeParseJson(hostEl.getAttribute('data-delphine-props'));
                const newKey = stableStringify(newProps);

                // Nothing to mount => unmount and exit
                if (!newPlugin) {
                        this.pluginName = null;
                        this.pluginProps = {};
                        this.pluginPropsKey = '';
                        this.unmount();
                        return;
                }

                const needRemount =
                        !this.instance || // <-- first time: no instance yet
                        newPlugin !== this.pluginName; // <-- plugin changed

                if (needRemount) {
                        this.pluginName = newPlugin;
                        this.pluginProps = newProps;
                        this.pluginPropsKey = newKey;
                        this.remount();
                        return;
                }

                // Same plugin => update only if props changed
                if (newKey !== this.pluginPropsKey) {
                        this.pluginProps = newProps;
                        this.pluginPropsKey = newKey;
                        this.instance?.update(newProps);
                }
        }
        private remount() {
                const services = this.services;
                if (!services || !this.form || !this.mountPoint) return;

                // Resolve plugin
                if (!this.pluginName) {
                        this.unmount();
                        return;
                }

                //const meta = this.getMetaClass() as TMetaPluginHost;
                //const def = meta.pluginFactory;
                //const def = this.factory;
                const meta = this.getMetaclass() as TMetaPluginHost;
                const def = meta.defProps; //PluginRegistry.pluginRegistry.get(this.pluginName);
                if (!def) {
                        services.log.warn('Unknown plugin', { plugin: this.pluginName as any });
                        this.unmount();
                        return;
                }

                // Hard remount
                this.unmount();
                //const meta = this.getMetaclass() as TMetaPluginHost;
                this.instance = meta.pluginFactory!({ host: this, form: this.form as IComponent }) ?? null; // The instance is created Here !---------------
                this.instance?.mount(this.mountPoint, this.pluginProps, services); // Puis est monté ici ----------------------
        }

        unmount() {
                try {
                        this.instance?.unmount();
                } finally {
                        this.instance = null;
                }
        }

        dispose() {
                // Call this when the component is destroyed (if you have such a hook)
                this.unmount();
                this.observer?.disconnect();
                this.observer = null;
                this.mountPoint = null;
                this.services = null;
        }

        mountPlugin(services: DelphineServices) {
                const el = this.htmlElement;
                if (!el || !this.pluginName) return;
                //const meta = this.getMetaclass() as TMetaPluginHost;
                //const def = this.factory; // meta.pluginFactory;

                //const def = PluginRegistry.pluginRegistry.get(this.pluginName);
                const meta = this.getMetaclass() as TMetaPluginHost;
                const def = meta.defProps;
                if (!def) {
                        services.log.warn('Unknown plugin', { plugin: this.pluginName });
                        return;
                }

                this.unmount();

                //const meta = this.getMetaclass as TMetaPluginHost;
                this.instance = meta.pluginFactory!({ host: this, form: this.form! as IComponent }) ?? null;

                this.instance?.mount(el, this.pluginProps, services);
        }

        updatePlugin() {
                this.instance?.update(this.pluginProps);
        }
}

//export type UIPluginFactory<Props extends Json = Json> = (args: { host: TPluginHost; form: TForm }) => UIPluginInstance<Props>;

export interface SizeHints {
        minWidth?: number;
        minHeight?: number;
        preferredWidth?: number;
        preferredHeight?: number;
}

export type UIPluginDef<Props extends Json> = {
        factory: UIPluginFactory;
        // optionnel : un schéma de props, aide au designer
        // props?: PropSchema;
        defaultProps?: Props;
        propSchema?: Record<string, PropertyDefinition>;
};

/*
export class PluginRegistry {
        static pluginRegistry = new PluginRegistry();
        private readonly plugins = new Map<string, UIPluginDef<Json>>();

        register(name: string, def: UIPluginDef<Json>) {
                if (this.plugins.has(name)) throw new Error(`Plugin already registered: ${name}`);
                this.plugins.set(name, def);
        }

        get(name: string): UIPluginDef<Json> | undefined {
                return this.plugins.get(name);
        }

        has(name: string): boolean {
                return this.plugins.has(name);
        }
}
        */
