"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TMetaCompositeDCC = exports.TCompositeDCC = exports.TMetaSimpleDCC = exports.TSimpleDCC = exports.PluginRegistry = exports.TPluginHost = exports.TMetaPluginHost = exports.TApplication = exports.TMetaApplication = exports.TMetaButton = exports.TButton = exports.TForm = exports.TMetaForm = exports.TMetaPanel = exports.TPanel = exports.TMetaContainer = exports.TContainer = exports.TMetaDocument = exports.TDocument = exports.TComponentRegistry = exports.TMetaComponentRegistry = exports.TComponentTypeRegistry = exports.TMetaComponentTypeRegistry = exports.TMetaComponent = exports.TComponent = exports.TMetaObject = exports.TObject = exports.TMetaclass = exports.THandler = exports.TColor = void 0;
const registerVcl_1 = require("./registerVcl");
/*
   To create a new component type:

   To create a new component attribut

*/
class TColor {
    s;
    constructor(s) {
        this.s = s;
    }
    /* factory */ static rgb(r, g, b) {
        return new TColor(`rgb(${r}, ${g}, ${b})`);
    }
    /* factory */ static rgba(r, g, b, a) {
        return new TColor(`rgba(${r}, ${g}, ${b}, ${a})`);
    }
}
exports.TColor = TColor;
class THandler {
    s;
    constructor(s) {
        this.s = s;
    }
    fire(form, handlerName, ev, sender) {
        const maybeMethod = form[this.s];
        if (typeof maybeMethod !== 'function') {
            console.log('NOT A METHOD', handlerName);
            return false;
        }
        // If sender is missing, fallback to the form itself (safe)
        maybeMethod.call(form, ev, sender ?? this);
    }
}
exports.THandler = THandler;
const RESERVED_DATA_ATTRS = new Set([
    'data-component',
    'data-name',
    'data-props',
    'data-plugin',
    'data-message' // add any meta/framework attrs you don't want treated as props
]);
class TMetaclass {
    typeName = 'TMetaclass';
    static metaclass;
    superClass = null;
    constructor(superClass, typeName = 'TMetaclass') {
        this.superClass = superClass;
        this.typeName = typeName;
    }
}
exports.TMetaclass = TMetaclass;
class TObject {
    getMetaClass() {
        return TMetaObject.metaClass;
    }
}
exports.TObject = TObject;
class TMetaObject extends TMetaclass {
    static metaClass = new TMetaObject(TMetaclass.metaclass, 'TObject');
    getMetaclass() {
        return TMetaObject.metaClass;
    }
    constructor(superClass, name) {
        super(superClass, name);
    }
}
exports.TMetaObject = TMetaObject;
class TComponent {
    getMetaclass() {
        return TMetaComponent.metaclass;
    }
    name;
    parent = null;
    props = Object.create(null);
    getProp(name) {
        return this.props[name];
    }
    setProp(name, value) {
        this.props[name] = value;
    }
    // optional
    hasProp(name) {
        return Object.prototype.hasOwnProperty.call(this.props, name);
    }
    //protected props: ComponentProps = Object.create(null);
    form = null;
    children = [];
    elem = null;
    get htmlElement() {
        return this.elem;
    }
    constructor(name, form, parent) {
        this.name = name;
        this.parent = parent;
        parent?.children.push(this); // Could be done in buildComponentTree()
        this.form = form;
        // IMPORTANT: Initialize props at runtime (declare would not do it).
        //this.props = {};
    }
    // NOTE: This is runtime data, so it must be initialized (no "declare").
    //props: ComponentProps;
    /** May contain child components */
    _onclick = new THandler('');
    allowsChildren() {
        return false;
    }
    get color() {
        return new TColor(this.getHtmlStyleProp('color'));
    }
    set color(color) {
        this.setHtmlStyleProp('color', color.s);
    }
    get onclick() {
        return this._onclick ?? new THandler('');
    }
    set onclick(handler) {
        this._onclick = handler;
    }
    syncDomFromProps() {
        const el = this.htmlElement;
        if (!el)
            return;
    }
    get backgroundColor() {
        return new TColor(this.getHtmlStyleProp('background-color'));
    }
    set backgroundColor(v) {
        this.setHtmlStyleProp('background-color', v.s);
    }
    get width() {
        return this.getHtmlProp('width') ?? '';
    }
    set width(v) {
        this.setHtmlProp('width', v);
    }
    get height() {
        return this.getHtmlProp('height') ?? '';
    }
    set height(v) {
        this.setHtmlProp('height', v);
    }
    get offsetWidth() {
        return this.htmlElement.offsetWidth;
    }
    get offsetHeight() {
        return this.htmlElement.offsetHeight;
    }
    setHtmlStyleProp(name, value) {
        this.htmlElement.style.setProperty(name, value);
    }
    getHtmlStyleProp(name) {
        return this.htmlElement.style.getPropertyValue(name);
    }
    setHtmlProp(name, value) {
        this.htmlElement.setAttribute(name, value);
    }
    getHtmlProp(name) {
        return this.htmlElement.getAttribute(name);
    }
}
exports.TComponent = TComponent;
class TMetaComponent extends TMetaclass {
    static metaclass = new TMetaComponent(TMetaclass.metaclass, 'TComponent');
    // The symbolic name used in HTML: data-component="TButton" or "my-button"
    constructor(superClass, name) {
        super(superClass, name);
    }
    getMetaclass() {
        return TMetaComponent.metaclass;
    }
    // Create the runtime instance and attach it to the DOM element.
    create(name, form, parent) {
        return new TComponent(name, form, parent);
    }
    defProps() {
        return [
            //{ name: 'color', kind: 'color', apply: (o, v) => (o.color = new TColor(String(v))) },
            {
                name: 'onclick',
                kind: 'handler',
                retrieve: (o) => {
                    return o.onclick;
                },
                apply: (o, v) => (o.onclick = new THandler(String(v)))
            }
            //{ name: 'oncreate', kind: 'handler', apply: (o, v) => (o.oncreate = new THandler(String(v))) }
        ];
    }
}
exports.TMetaComponent = TMetaComponent;
class TMetaComponentTypeRegistry extends TMetaObject {
    static metaclass = new TMetaComponentTypeRegistry(TMetaObject.metaClass, 'TComponentTypeRegistry');
    constructor(superClass, name) {
        super(superClass, name);
        // et vous changez juste le nom :
    }
    getMetaclass() {
        return TMetaComponentTypeRegistry.metaclass;
    }
}
exports.TMetaComponentTypeRegistry = TMetaComponentTypeRegistry;
class TComponentTypeRegistry extends TObject {
    // We store heterogeneous metas, so we keep them as TMetaComponent<any>.
    getMetaclass() {
        return TMetaComponentTypeRegistry.metaClass;
    }
    classes = new Map();
    register(meta) {
        if (this.classes.has(meta.typeName)) {
            throw new Error(`Component type already registered: ${meta.typeName}`);
        }
        this.classes.set(meta.typeName, meta);
    }
    // If you just need "something meta", return any-meta.
    get(typeName) {
        return this.classes.get(typeName);
    }
    has(typeName) {
        return this.classes.has(typeName);
    }
    list() {
        return [...this.classes.keys()].sort();
    }
}
exports.TComponentTypeRegistry = TComponentTypeRegistry;
class TMetaComponentRegistry extends TMetaclass {
    static metaclass = new TMetaComponentRegistry(TMetaclass.metaclass, 'TComponentTypeRegistry');
    constructor(superClass, name) {
        super(superClass, name);
    }
    getMetaclass() {
        return TMetaComponentRegistry.metaclass;
    }
}
exports.TMetaComponentRegistry = TMetaComponentRegistry;
class TComponentRegistry extends TObject {
    getMetaclass() {
        return TMetaComponentRegistry.metaclass;
    }
    instances = new Map();
    logger = {
        debug(msg, data) { },
        info(msg, data) { },
        warn(msg, data) { },
        error(msg, data) { }
    };
    eventBus = {
        on(event, handler) {
            return () => void {};
        },
        emit(event, payload) { }
    };
    storage = {
        get(key) {
            return null;
        },
        set(key, value) {
            return null;
        },
        remove(key) {
            return null;
        }
    };
    constructor() {
        super();
    }
    registerInstance(name, c) {
        this.instances.set(name, c);
    }
    get(name) {
        return this.instances.get(name);
    }
    services = {
        log: this.logger,
        bus: this.eventBus,
        storage: this.storage
    };
    clear() {
        this.instances.clear();
    }
    resolveRoot() {
        // Prefer body as the canonical root.
        if (document.body?.dataset?.component)
            return document.body;
        // Backward compatibility: old wrapper div.
        const legacy = document.getElementById('delphine-root');
        if (legacy)
            return legacy;
        // Last resort.
        return document.body ?? document.documentElement;
    }
    convert(raw, kind) {
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
    resolveNearestPropSpec(meta, propName) {
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
        let mc = meta;
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
            mc = mc.superClass ?? null;
        }
        //perMeta.set(propName, null);
        return null;
    }
    applyPropsFromSource(comp, src, meta) {
        for (const [name, rawValue] of Object.entries(src)) {
            const spec = this.resolveNearestPropSpec(meta, name);
            if (!spec)
                continue; // Not a declared prop -> ignore
            const v = rawValue;
            // Note: data-xxx gives strings; data-props can give any JSON type.
            const value = this.convert(v, spec.kind);
            //out[name] = value; // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
            //comp.setHtmlProp(name, value); // for convenience, setHtmlProp can be used by the component itself to react to prop changes.
            comp.setProp(name, value);
            spec.apply(comp, value);
        }
    }
    extractJsonProps(el) {
        const raw = el.getAttribute('data-props');
        if (!raw)
            return {};
        try {
            const parsed = JSON.parse(raw);
            // Only accept plain objects
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                return parsed;
            }
            return {};
        }
        catch (e) {
            console.error('Invalid JSON in data-props', raw, e);
            return {};
        }
    }
    extractDataAttributes(el) {
        const out = {};
        // Iterate all attributes, keep only data-xxx (except reserved)
        for (const attr of Array.from(el.attributes)) {
            const attrName = attr.name;
            if (!attrName.startsWith('data-'))
                continue;
            if (RESERVED_DATA_ATTRS.has(attrName))
                continue;
            const propName = attrName.slice('data-'.length);
            // Skip empty names
            if (!propName)
                continue;
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
     * - Reads JSON from data-props
     * - Reads data-xxx attributes (excluding reserved ones)
     * - For each candidate prop name, resolves the nearest PropSpec by walking metaclass inheritance.
     * - Applies conversion based on spec.kind
     * - data-xxx overrides data-props
     */
    parsePropsFromElement(comp) {
        const el = comp.elem;
        if (!el)
            return;
        // 1) Extract JSON bulk props from data-props
        const jsonProps = this.extractJsonProps(el);
        // 2) Extract data-xxx attributes (excluding reserved)
        const dataAttrs = this.extractDataAttributes(el);
        // 3) Apply JSON first, then data-xxx overrides
        this.applyPropsFromSource(comp, jsonProps, comp.getMetaclass());
        this.applyPropsFromSource(comp, dataAttrs, comp.getMetaclass());
    }
    processElem(el, form, parent) {
        const name = el.getAttribute('data-name');
        const type = el.getAttribute('data-component');
        const cls = TApplication.TheApplication.types.get(type);
        if (!cls)
            return null;
        let child = parent;
        if (cls != TMetaForm.metaclass) {
            // The TForm are already created by the user.
            child = cls.create(name, form, parent);
        }
        this.registerInstance(name, child);
        // name: string, form: TForm, parent: TComponent, elem: HTMLElement
        if (!child)
            return null;
        //child.parent = component;
        child.elem = el;
        //child.form = form;
        //child.name = name!;
        //child.props = {};
        // We collect
        this.parsePropsFromElement(child);
        child.syncDomFromProps();
        child.onAttachedToDom?.();
        // Done in the constructor //parent.children.push(child);
        const maybeHost = child;
        if (maybeHost && typeof maybeHost.setPluginSpec === 'function') {
            const plugin = el.getAttribute('data-plugin');
            const raw = el.getAttribute('data-props');
            const props = raw ? JSON.parse(raw) : {};
            maybeHost.setPluginSpec({ plugin, props });
            maybeHost.mountPluginIfReady(this.services);
            //maybeHost.mountFromRegistry(services);
        }
        if (child.allowsChildren()) {
            el.querySelectorAll(':scope > [data-component]').forEach((el) => {
                this.processElem(el, form, child);
                //if (el === root) return;
            });
        }
        return child;
        //if (el === root) return; // No need to go higher in the hierachy
    }
    // This function is called juste once, when the form is created
    buildComponentTree(form, root) {
        this.clear();
        // --- FORM ---
        // provisoirement if (root.getAttribute('data-component') === 'TForm') {
        //const el = root.elem!;
        //this.registerInstance(root.name, form);
        //}
        const rootElem = root.elem;
        this.processElem(rootElem, form, root);
        // --- CHILD COMPONENTS ---
        /*
        rootElem.querySelectorAll(':scope > [data-component]').forEach((el) => {
                const child: TComponent | null = this.processElem(el, form, root);
                //if (el === root) return;
                if (child && child.allowsChildren()) {
                        el.querySelectorAll(':scope > [data-component]').forEach((el) => {
                                this.processElem(el, form, child);
                                //if (el === root) return;
                        });
                }
        });
        */
    }
}
exports.TComponentRegistry = TComponentRegistry;
/*
export type ComponentProps = {
        onclick?: THandler;
        oncreate?: THandler;
        //color?: TColor; // ou TColor, etc.
        name?: string;
        component?: string;
};
*/
//type RawProp = Record<string, string>;
class TDocument extends TObject {
    static document = new TDocument(document);
    static body = document.body;
    htmlDoc;
    constructor(htmlDoc) {
        super();
        this.htmlDoc = htmlDoc;
    }
}
exports.TDocument = TDocument;
class TMetaDocument extends TMetaObject {
    static metaclass = new TMetaDocument(TMetaObject.metaclass, 'TDocument');
    constructor(superClass, name) {
        super(superClass, name);
        // et vous changez juste le nom :
    }
    getMetaclass() {
        return TMetaDocument.metaclass;
    }
}
exports.TMetaDocument = TMetaDocument;
/*
type ContainerProps = ComponentProps & {
        //caption?: string;
        //enabled?: boolean;
        //color?: TColor; // ou TColor, etc.
};
*/
// This clas does not do anything except overrides allowsChildren()
class TContainer extends TComponent {
    getMetaclass() {
        return TMetaContainer.metaclass;
    }
    //private get cprops(): ContainerProps {
    //return this.props as ContainerProps;
    //}
    constructor(name, form, parent) {
        super(name, form, parent);
    }
    syncDomFromProps() {
        const el = this.htmlElement;
        if (!el)
            return;
        super.syncDomFromProps();
    }
    allowsChildren() {
        return true;
    }
}
exports.TContainer = TContainer;
class TMetaContainer extends TMetaComponent {
    static metaclass = new TMetaContainer(TMetaComponent.metaclass, 'TContainer');
    constructor(superClass, name) {
        super(superClass, name);
    }
    getMetaclass() {
        return TMetaContainer.metaclass;
    }
    create(name, form, parent) {
        return new TContainer(name, form, parent);
    }
    defProps() {
        return [
        //{ name: 'caption', kind: 'string', apply: (o, v) => (o.caption = String(v)) },
        //{ name: 'enabled', kind: 'boolean', apply: (o, v) => (o.enabled = Boolean(v)) }
        ];
    }
}
exports.TMetaContainer = TMetaContainer;
/*
type PanelProps = ContainerProps & {
        //caption?: string;
        //enabled?: boolean;
        //color?: TColor; // ou TColor, etc.
};
*/
// This class does not do anything useful
// --------------------------------------
class TPanel extends TContainer {
    getMetaclass() {
        return TMetaPanel.metaclass;
    }
    //protected get pprops(): PanelProps {
    //return this.props as PanelProps;
    //}
    constructor(name, form, parent) {
        super(name, form, parent);
    }
    syncDomFromProps() {
        const el = this.htmlElement;
        if (!el)
            return;
        super.syncDomFromProps();
    }
}
exports.TPanel = TPanel;
class TMetaPanel extends TMetaContainer {
    static metaclass = new TMetaPanel(TMetaContainer.metaclass, 'TPanel');
    constructor(superClass, name) {
        super(superClass, name);
        // et vous changez juste le nom :
    }
    getMetaclass() {
        return TMetaPanel.metaclass;
    }
    create(name, form, parent) {
        return new TPanel(name, form, parent);
    }
    defProps() {
        return [
        //{ name: 'caption', kind: 'string', apply: (o, v) => (o.caption = String(v)) },
        //{ name: 'enabled', kind: 'boolean', apply: (o, v) => (o.enabled = Boolean(v)) }
        ];
    }
}
exports.TMetaPanel = TMetaPanel;
/*
type FormProps = ContainerProps & {
        //caption?: string;
        //enabled?: boolean;
        //color?: TColor; // ou TColor, etc.
};
*/
class TMetaForm extends TMetaContainer {
    static metaclass = new TMetaForm(TMetaContainer.metaclass, 'TForm');
    getMetaClass() {
        return TMetaForm.metaclass;
    }
    constructor(superClass, name) {
        super(superClass, name);
        // et vous changez juste le nom :
    }
    create(name, form, parent) {
        return new TForm(name);
    }
    defProps() {
        return [
        //{ name: 'caption', kind: 'string', apply: (o, v) => (o.caption = String(v)) },
        //{ name: 'enabled', kind: 'boolean', apply: (o, v) => (o.enabled = Boolean(v)) }
        ];
    }
}
exports.TMetaForm = TMetaForm;
class TForm extends TContainer {
    getMetaclass() {
        return TMetaForm.metaclass;
    }
    static forms = new Map();
    _mounted = false;
    // Each Form has its own componentRegistry
    componentRegistry = new TComponentRegistry();
    constructor(name) {
        super(name, null, null);
        this.form = this;
        TForm.forms.set(name, this);
    }
    get application() {
        return this.form?.application ?? TApplication.TheApplication;
    }
    // English comments as requested.
    findFormFromEventTarget(target) {
        // 1) Find the nearest element that looks like a form container
        const formElem = target.closest('[data-component="TForm"][data-name]');
        if (!formElem)
            return null;
        // 2) Resolve the TForm instance
        const formName = formElem.getAttribute('data-name');
        if (!formName)
            return null;
        return TForm.forms.get(formName) ?? null;
    }
    _ac = null;
    installEventRouter() {
        this._ac?.abort();
        this._ac = new AbortController();
        const { signal } = this._ac;
        const root = this.elem;
        if (!root)
            return;
        // same handler for everybody
        const handler = (ev) => this.dispatchDomEvent(ev);
        for (const type of ['click', 'input', 'change', 'keydown']) {
            root.addEventListener(type, handler, { capture: true, signal });
        }
        for (const type in this.getMetaclass().domEvents) {
            root.addEventListener(type, handler, { capture: true, signal });
        }
    }
    disposeEventRouter() {
        this._ac?.abort();
        this._ac = null;
    }
    // We received an DOM Event. Dispatch it
    dispatchDomEvent(ev) {
        const targetElem = ev.target;
        if (!targetElem)
            return;
        const propName = `on${ev.type}`;
        let el = targetElem.closest('[data-component]');
        if (!el)
            return;
        const name = el.getAttribute('data-name');
        let comp = name ? this.componentRegistry.get(name) : null;
        while (comp) {
            const handler = comp.getProp(propName); // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
            //const handler = comp.getProperty(propName); //comp?.props[propName as keyof typeof comp.props] as THandler | null;
            if (handler && handler.s && handler.s != '') {
                handler.fire(this, propName, ev, comp);
                return;
            }
            //el = next ?? el.parentElement?.closest('[data-component]') ?? null;
            comp = comp.parent;
        }
        // No handler here: try going "up" using your component tree if possible
    }
    show() {
        // Must be done before buildComponentTree() because `buildComponentTree()` does not do `resolveRoot()` itself.
        if (!this.elem) {
            this.elem = this.componentRegistry.resolveRoot(); // ou this.resolveRoot()
        }
        if (!this._mounted) {
            this.componentRegistry.buildComponentTree(this, this);
            this.onCreate(); // Maybe could be done after installEventRouter()
            this.installEventRouter();
            this._mounted = true;
        }
        this.onShown();
        // TODO
    }
    onCreate() {
        const onShownName = this.elem.getAttribute('data-oncreate');
        if (onShownName) {
            queueMicrotask(() => {
                const fn = this[onShownName];
                if (typeof fn === 'function')
                    fn.call(this, null, this);
            });
        }
    }
    onShown() {
        const onShownName = this.elem.getAttribute('data-onshown');
        if (onShownName) {
            queueMicrotask(() => {
                const fn = this[onShownName];
                if (typeof fn === 'function')
                    fn.call(this, null, this);
            });
        }
    }
}
exports.TForm = TForm;
/*
type ButtonProps = ComponentProps & {
        caption?: string;
        enabled?: boolean;
        //color?: TColor; // ou TColor, etc.
};
*/
class TButton extends TComponent {
    getMetaclass() {
        return TMetaButton.metaclass;
    }
    htmlButton() {
        return this.htmlElement;
    }
    _caption = '';
    _enabled = true;
    /*
    protected get bprops(): ButtonProps {
            return this.props as ButtonProps;
    }
            */
    get caption() {
        return this._caption;
    }
    set caption(caption) {
        this._caption = caption;
        const el = this.htmlElement;
        if (!el)
            return;
        el.textContent = this.caption;
    }
    get enabled() {
        return this._enabled ?? true;
    }
    set enabled(enabled) {
        this._enabled = enabled;
        this.htmlButton().disabled = !enabled;
    }
    constructor(name, form, parent) {
        super(name, form, parent);
    }
    syncDomFromProps() {
        const el = this.htmlElement;
        if (!el)
            return;
        el.textContent = this.caption;
        this.htmlButton().disabled = !this.enabled;
        super.syncDomFromProps();
    }
}
exports.TButton = TButton;
class TMetaButton extends TMetaComponent {
    static metaclass = new TMetaButton(TMetaComponent.metaclass, 'TButton');
    constructor(superClass, name) {
        super(superClass, name);
        // et vous changez juste le nom :
    }
    getMetaclass() {
        return TMetaButton.metaclass;
    }
    create(name, form, parent) {
        return new TButton(name, form, parent);
    }
    defProps() {
        return [
            {
                name: 'caption',
                kind: 'string',
                retrieve: (o) => {
                    return o.caption;
                },
                apply: (o, v) => (o.caption = String(v))
            },
            {
                name: 'enabled',
                kind: 'boolean',
                retrieve: (o) => {
                    return o.enabled;
                },
                apply: (o, v) => (o.enabled = Boolean(v))
            }
        ];
    }
}
exports.TMetaButton = TMetaButton;
class TMetaApplication extends TMetaclass {
    static metaclass = new TMetaApplication(TMetaclass.metaclass, 'TApplication');
    constructor(superClass, name) {
        super(superClass, name);
    }
    getMetaclass() {
        return TMetaApplication.metaclass;
    }
}
exports.TMetaApplication = TMetaApplication;
class TApplication {
    getMetaclass() {
        return TMetaApplication.metaclass;
    }
    static TheApplication;
    //static pluginRegistry = new PluginRegistry();
    //plugins: IPluginRegistry;
    forms = [];
    types = new TComponentTypeRegistry();
    mainForm = null;
    constructor() {
        TApplication.TheApplication = this;
        (0, registerVcl_1.registerBuiltins)(this.types);
    }
    createForm(ctor, name) {
        const f = new ctor(name);
        this.forms.push(f);
        if (!this.mainForm)
            this.mainForm = f;
        return f;
    }
    run() {
        this.runWhenDomReady(() => {
            if (this.mainForm)
                this.mainForm.show();
            else
                this.autoStart();
        });
    }
    autoStart() {
        // fallback: choisir une form enregistrée, ou créer une form implicite
    }
    runWhenDomReady(fn) {
        if (document.readyState === 'loading') {
            window.addEventListener('DOMContentLoaded', fn, { once: true });
        }
        else {
            fn();
        }
    }
}
exports.TApplication = TApplication;
// ============================================= PLUGINHOST ==========================================================
class TMetaPluginHost extends TMetaComponent {
    static metaclass = new TMetaPluginHost(TMetaComponent.metaclass, 'TPluginHost');
    getMetaclass() {
        return TMetaPluginHost.metaclass;
    }
    constructor(superClass, name) {
        super(superClass, name);
    }
    create(name, form, parent) {
        return new TPluginHost(name, form, parent);
    }
    props() {
        return [];
    }
}
exports.TMetaPluginHost = TMetaPluginHost;
class TPluginHost extends TComponent {
    instance = null;
    pluginName = null;
    pluginProps = {};
    factory = null;
    constructor(name, form, parent) {
        super(name, form, parent);
    }
    // Called by the metaclass (or by your registry) right after creation
    setPluginFactory(factory) {
        this.factory = factory;
    }
    mountPlugin(props, services) {
        const container = this.htmlElement;
        if (!container)
            return;
        if (!this.factory) {
            services.log.warn('TPluginHost: no plugin factory set', { host: this.name });
            return;
        }
        // Dispose old instance if any
        this.unmount();
        // Create plugin instance then mount
        this.instance = this.factory({ host: this, form: this.form });
        this.instance.mount(container, props, services);
    }
    // Called by buildComponentTree()
    setPluginSpec(spec) {
        this.pluginName = spec.plugin;
        this.pluginProps = spec.props ?? {};
    }
    // Called by buildComponentTree()
    mountPluginIfReady(services) {
        const container = this.htmlElement;
        if (!container || !this.form || !this.pluginName)
            return;
        const app = TApplication.TheApplication; // ou un accès équivalent
        const def = PluginRegistry.pluginRegistry.get(this.pluginName);
        if (!def) {
            services.log.warn('Unknown plugin', { plugin: this.pluginName });
            return;
        }
        this.unmount();
        this.instance = def.factory({ host: this, form: this.form });
        this.instance.mount(container, this.pluginProps, services);
    }
    update(props) {
        this.pluginProps = props;
        this.instance?.update(props);
    }
    unmount() {
        try {
            this.instance?.unmount();
        }
        finally {
            this.instance = null;
        }
    }
}
exports.TPluginHost = TPluginHost;
class PluginRegistry {
    static pluginRegistry = new PluginRegistry();
    plugins = new Map();
    register(name, def) {
        if (this.plugins.has(name))
            throw new Error(`Plugin already registered: ${name}`);
        this.plugins.set(name, def);
    }
    get(name) {
        return this.plugins.get(name);
    }
    has(name) {
        return this.plugins.has(name);
    }
}
exports.PluginRegistry = PluginRegistry;
// ==================================================================================================================================================================
// ======================================================================== DCC =====================================================================================
// DCC = Delphine Custom Component
/*
type SimpleDCCProps = ComponentProps & {
        //caption?: string;
        //enabled?: boolean;
        //color?: TColor; // ou TColor, etc.
};
*/
// Note: this class does not do anything. Perhaps that DCC can herit directly from TComponent
class TSimpleDCC extends TComponent {
    getMetaclass() {
        return TMetaSimpleDCC.metaclass;
    }
    constructor(name, form, parent) {
        super(name, form, parent);
    }
}
exports.TSimpleDCC = TSimpleDCC;
class TMetaSimpleDCC extends TMetaComponent {
    static metaclass = new TMetaSimpleDCC(TMetaComponent.metaclass, 'TSimpleDCC');
    constructor(superClass, name) {
        super(superClass, name);
        // et vous changez juste le nom :
    }
    getMetaclass() {
        return TMetaSimpleDCC.metaclass;
    }
    create(name, form, parent) {
        return new TSimpleDCC(name, form, parent);
    }
    defProps() {
        return [
        //{ name: 'caption', kind: 'string', apply: (o, v) => (o.caption = String(v)) },
        //{ name: 'enabled', kind: 'boolean', apply: (o, v) => (o.enabled = Boolean(v)) }
        ];
    }
}
exports.TMetaSimpleDCC = TMetaSimpleDCC;
/*
export type CompositeDCCProps = ComponentProps & {
        //caption?: string;
        //enabled?: boolean;
        //color?: TColor; // ou TColor, etc.
};
*/
// Note: this class does not do anything. Perhaps that DCC can herit directly from TContainer or TPanel
// TContainer or TPanel ? Actually this is not clear. Those two class do not do anything useful abof TComponent
class TCompositeDCC extends TContainer {
    getMetaclass() {
        return TMetaCompositeDCC.metaclass;
    }
    constructor(name, form, parent) {
        super(name, form, parent);
    }
}
exports.TCompositeDCC = TCompositeDCC;
class TMetaCompositeDCC extends TMetaContainer {
    static metaclass = new TMetaCompositeDCC(TMetaContainer.metaclass, 'TCompositDCC');
    constructor(superClass, name) {
        super(superClass, name);
        // et vous changez juste le nom :
    }
    getMetaclass() {
        return TMetaCompositeDCC.metaclass;
    }
    create(name, form, parent) {
        return new TCompositeDCC(name, form, parent);
    }
    defProps() {
        return [
        //{ name: 'caption', kind: 'string', apply: (o, v) => (o.caption = String(v)) },
        //{ name: 'enabled', kind: 'boolean', apply: (o, v) => (o.enabled = Boolean(v)) }
        ];
    }
}
exports.TMetaCompositeDCC = TMetaCompositeDCC;
// ===================================================================================================================================================================
//# sourceMappingURL=StdCtrls.js.map