import { TForm, TComponent, TMetaComponent, TApplication } from './StdCtrls';
import type { PropSpec } from './StdCtrls';
import type { DelphineServices, UIPluginMessage } from './IPlugin';

// ============================================= PLUGINHOST ==========================================================

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

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

export class TMetaPluginHost extends TMetaComponent {
        static metaclass = new TMetaPluginHost(TMetaComponent.metaclass, 'TPluginHost');
        getMetaclass() {
                return TMetaPluginHost.metaclass;
        }

        protected constructor(superClass: TMetaComponent, name: string) {
                super(superClass, name);
        }

        create(name: string, form: TForm, parent: TComponent) {
                return new TPluginHost(name, form, parent);
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

export class TPluginHost extends TComponent {
        private instance: UIPluginInstance | null = null;
        private services: DelphineServices | null = null;

        private pluginName: string | null = null;
        private pluginProps: any = {};
        private pluginPropsKey: string = '';
        //private factory: UIPluginFactory | null = null;

        private mountPoint: HTMLElement | null = null;
        private observer: MutationObserver | null = null;

        private updateScheduled = false;

        /** Replace ALL plugin props (rare). */
        setPluginProps(next: Record<string, any>) {
                this.pluginProps = next ?? {};
                this.scheduleUpdate();
        }

        setPluginProp(key: string, value: any) {
                // 1) Update cached props object
                const next = { ...(this.pluginProps ?? {}), [key]: value };
                this.pluginProps = next;

                // 2) Reflect to DOM so Grapes/HTML stay canonical
                const el = this.htmlElement;
                if (el) {
                        el.setAttribute('data-props', JSON.stringify(next));
                }

                // 3) Push to plugin instance
                this.instance?.update(next);
        }

        /** Patch many props at once (preferred). */
        patchPluginProps(patch: Record<string, any>) {
                Object.assign(this.pluginProps, patch);
                this.scheduleUpdate();
        }

        getPluginProp<T = any>(name: string): T | undefined {
                return this.pluginProps[name] as T | undefined;
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
        }

        /*
        // Called by the metaclass (or by your registry) right after creation
        setPluginFactory(factory: UIPluginFactory) {
                this.factory = factory;
        }
                */

        private onPluginMessage(msg: UIPluginMessage) {
                if (msg.type === 'setProp') {
                        // Option A: update DOM data-props so your existing refreshFromDom pipeline stays consistent
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
                        this.mountPoint.setAttribute('data-delphine-mount', '1');
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
                                                if (a === 'data-plugin' || a === 'data-props') {
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

                const newPlugin = hostEl.getAttribute('data-plugin'); // string | null
                const newProps = safeParseJson(hostEl.getAttribute('data-props'));
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

                const def = PluginRegistry.pluginRegistry.get(this.pluginName);
                if (!def) {
                        services.log.warn('Unknown plugin', { plugin: this.pluginName as any });
                        this.unmount();
                        return;
                }

                // Hard remount
                this.unmount();
                this.instance = def.factory({ host: this, form: this.form }); // The instance is created Here !---------------
                this.instance.mount(this.mountPoint, this.pluginProps, services); // Puis est monté ici ----------------------
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

                const def = PluginRegistry.pluginRegistry.get(this.pluginName);
                if (!def) {
                        services.log.warn('Unknown plugin', { plugin: this.pluginName });
                        return;
                }

                this.unmount();

                this.instance = def.factory({ host: this, form: this.form! });

                this.instance.mount(el, this.pluginProps, services);
        }

        updatePlugin() {
                this.instance?.update(this.pluginProps);
        }
}

export type UIPluginFactory<Props extends Json = Json> = (args: { host: TPluginHost; form: TForm }) => UIPluginInstance<Props>;

export interface SizeHints {
        minWidth?: number;
        minHeight?: number;
        preferredWidth?: number;
        preferredHeight?: number;
}

export type UIPluginDef = {
        factory: UIPluginFactory;
        // optionnel : un schéma de props, aide au designer
        // props?: PropSchema;
};

export class PluginRegistry {
        static pluginRegistry = new PluginRegistry();
        private readonly plugins = new Map<string, UIPluginDef>();

        register(name: string, def: UIPluginDef) {
                if (this.plugins.has(name)) throw new Error(`Plugin already registered: ${name}`);
                this.plugins.set(name, def);
        }

        get(name: string): UIPluginDef | undefined {
                return this.plugins.get(name);
        }

        has(name: string): boolean {
                return this.plugins.has(name);
        }
}
