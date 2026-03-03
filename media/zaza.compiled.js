var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/vcl/registerVcl.ts
function registerBuiltins(types) {
  types.register(TMetaButton.metaclass);
  types.register(TMetaPluginHost.metaclass);
  types.register(TMetaForm.metaclass);
  types.register(TMetaPanel.metaclass);
}

// src/vcl/StdCtrls.ts
var TColor = class _TColor {
  constructor(s) {
    __publicField(this, "s");
    this.s = s;
  }
  /* factory */
  static rgb(r, g, b) {
    return new _TColor(`rgb(${r}, ${g}, ${b})`);
  }
  /* factory */
  static rgba(r, g, b, a) {
    return new _TColor(`rgba(${r}, ${g}, ${b}, ${a})`);
  }
};
var THandler = class {
  constructor(s) {
    __publicField(this, "s");
    this.s = s;
  }
  fire(form, handlerName, ev, sender) {
    const maybeMethod = form[this.s];
    if (typeof maybeMethod !== "function") {
      console.log("NOT A METHOD", handlerName);
      return false;
    }
    maybeMethod.call(form, ev, sender ?? this);
  }
};
var RESERVED_DATA_ATTRS = /* @__PURE__ */ new Set([
  "data-component",
  "data-name",
  "data-props",
  "data-plugin",
  "data-message"
  // add any meta/framework attrs you don't want treated as props
]);
var TMetaclass = class {
  constructor(superClass, typeName = "TMetaclass") {
    __publicField(this, "typeName", "TMetaclass");
    __publicField(this, "superClass", null);
    this.superClass = superClass;
    this.typeName = typeName;
  }
};
__publicField(TMetaclass, "metaclass");
var TObject = class {
  getMetaClass() {
    return TMetaObject.metaClass;
  }
};
var _TMetaObject = class _TMetaObject extends TMetaclass {
  getMetaclass() {
    return _TMetaObject.metaClass;
  }
  constructor(superClass, name) {
    super(superClass, name);
  }
};
__publicField(_TMetaObject, "metaClass", new _TMetaObject(TMetaclass.metaclass, "TObject"));
var TMetaObject = _TMetaObject;
var TComponent = class {
  constructor(name, form, parent) {
    __publicField(this, "name");
    __publicField(this, "parent", null);
    __publicField(this, "props", /* @__PURE__ */ Object.create(null));
    //protected props: ComponentProps = Object.create(null);
    __publicField(this, "form", null);
    __publicField(this, "children", []);
    __publicField(this, "elem", null);
    // NOTE: This is runtime data, so it must be initialized (no "declare").
    //props: ComponentProps;
    /** May contain child components */
    __publicField(this, "_onclick", new THandler(""));
    this.name = name;
    this.parent = parent;
    parent?.children.push(this);
    this.form = form;
  }
  getMetaclass() {
    return TMetaComponent.metaclass;
  }
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
  get htmlElement() {
    return this.elem;
  }
  allowsChildren() {
    return false;
  }
  get color() {
    return new TColor(this.getHtmlStyleProp("color"));
  }
  set color(color) {
    this.setHtmlStyleProp("color", color.s);
  }
  get onclick() {
    return this._onclick ?? new THandler("");
  }
  set onclick(handler) {
    this._onclick = handler;
  }
  syncDomFromProps() {
    const el = this.htmlElement;
    if (!el) return;
  }
  get backgroundColor() {
    return new TColor(this.getHtmlStyleProp("background-color"));
  }
  set backgroundColor(v) {
    this.setHtmlStyleProp("background-color", v.s);
  }
  get width() {
    return this.getHtmlProp("width") ?? "";
  }
  set width(v) {
    this.setHtmlProp("width", v);
  }
  get height() {
    return this.getHtmlProp("height") ?? "";
  }
  set height(v) {
    this.setHtmlProp("height", v);
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
};
var _TMetaComponent = class _TMetaComponent extends TMetaclass {
  // The symbolic name used in HTML: data-component="TButton" or "my-button"
  constructor(superClass, name) {
    super(superClass, name);
  }
  getMetaclass() {
    return _TMetaComponent.metaclass;
  }
  // Create the runtime instance and attach it to the DOM element.
  create(name, form, parent) {
    return new TComponent(name, form, parent);
  }
  defProps() {
    return [
      //{ name: 'color', kind: 'color', apply: (o, v) => (o.color = new TColor(String(v))) },
      {
        name: "onclick",
        kind: "handler",
        retrieve: (o) => {
          return o.onclick;
        },
        apply: (o, v) => o.onclick = new THandler(String(v))
      }
      //{ name: 'oncreate', kind: 'handler', apply: (o, v) => (o.oncreate = new THandler(String(v))) }
    ];
  }
  // default [];
};
__publicField(_TMetaComponent, "metaclass", new _TMetaComponent(TMetaclass.metaclass, "TComponent"));
var TMetaComponent = _TMetaComponent;
var _TMetaComponentTypeRegistry = class _TMetaComponentTypeRegistry extends TMetaObject {
  constructor(superClass, name) {
    super(superClass, name);
  }
  getMetaclass() {
    return _TMetaComponentTypeRegistry.metaclass;
  }
};
__publicField(_TMetaComponentTypeRegistry, "metaclass", new _TMetaComponentTypeRegistry(TMetaObject.metaClass, "TComponentTypeRegistry"));
var TMetaComponentTypeRegistry = _TMetaComponentTypeRegistry;
var TComponentTypeRegistry2 = class extends TObject {
  constructor() {
    super(...arguments);
    __publicField(this, "classes", /* @__PURE__ */ new Map());
  }
  // We store heterogeneous metas, so we keep them as TMetaComponent<any>.
  getMetaclass() {
    return TMetaComponentTypeRegistry.metaClass;
  }
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
};
var _TMetaComponentRegistry = class _TMetaComponentRegistry extends TMetaclass {
  constructor(superClass, name) {
    super(superClass, name);
  }
  getMetaclass() {
    return _TMetaComponentRegistry.metaclass;
  }
};
__publicField(_TMetaComponentRegistry, "metaclass", new _TMetaComponentRegistry(TMetaclass.metaclass, "TComponentTypeRegistry"));
var TMetaComponentRegistry = _TMetaComponentRegistry;
var TComponentRegistry = class extends TObject {
  constructor() {
    super();
    __publicField(this, "instances", /* @__PURE__ */ new Map());
    __publicField(this, "logger", {
      debug(msg, data) {
      },
      info(msg, data) {
      },
      warn(msg, data) {
      },
      error(msg, data) {
      }
    });
    __publicField(this, "eventBus", {
      on(event, handler) {
        return () => void {};
      },
      emit(event, payload) {
      }
    });
    __publicField(this, "storage", {
      get(key) {
        return null;
      },
      set(key, value) {
        return null;
      },
      remove(key) {
        return null;
      }
    });
    __publicField(this, "services", {
      log: this.logger,
      bus: this.eventBus,
      storage: this.storage
    });
  }
  getMetaclass() {
    return TMetaComponentRegistry.metaclass;
  }
  registerInstance(name, c) {
    this.instances.set(name, c);
  }
  get(name) {
    return this.instances.get(name);
  }
  clear() {
    this.instances.clear();
  }
  resolveRoot() {
    if (document.body?.dataset?.component) return document.body;
    const legacy = document.getElementById("delphine-root");
    if (legacy) return legacy;
    return document.body ?? document.documentElement;
  }
  convert(raw, kind) {
    if (typeof raw === "string") {
      switch (kind) {
        case "string":
          return raw;
        case "number":
          return Number(raw);
        case "boolean":
          return raw === "true" || raw === "1" || raw === "";
        case "color":
          return new TColor(raw);
        // ou parse en TColor si vous avez
        case "handler":
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
    let mc = meta;
    while (mc) {
      if (typeof mc.defProps === "function") {
        const defs = mc.defProps();
        for (const spec of defs) {
          if (spec.name === propName) {
            return spec;
          }
        }
      }
      mc = mc.superClass ?? null;
    }
    return null;
  }
  applyPropsFromSource(comp, src, meta) {
    for (const [name, rawValue] of Object.entries(src)) {
      const spec = this.resolveNearestPropSpec(meta, name);
      if (!spec) continue;
      const v = rawValue;
      const value = this.convert(v, spec.kind);
      comp.setProp(name, value);
      spec.apply(comp, value);
    }
  }
  extractJsonProps(el) {
    const raw = el.getAttribute("data-props");
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
      return {};
    } catch (e) {
      console.error("Invalid JSON in data-props", raw, e);
      return {};
    }
  }
  extractDataAttributes(el) {
    const out = {};
    for (const attr of Array.from(el.attributes)) {
      const attrName = attr.name;
      if (!attrName.startsWith("data-")) continue;
      if (RESERVED_DATA_ATTRS.has(attrName)) continue;
      const propName = attrName.slice("data-".length);
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
   * - Reads JSON from data-props
   * - Reads data-xxx attributes (excluding reserved ones)
   * - For each candidate prop name, resolves the nearest PropSpec by walking metaclass inheritance.
   * - Applies conversion based on spec.kind
   * - data-xxx overrides data-props
   */
  parsePropsFromElement(comp) {
    const el = comp.elem;
    if (!el) return;
    const jsonProps = this.extractJsonProps(el);
    const dataAttrs = this.extractDataAttributes(el);
    this.applyPropsFromSource(comp, jsonProps, comp.getMetaclass());
    this.applyPropsFromSource(comp, dataAttrs, comp.getMetaclass());
  }
  processElem(el, form, parent) {
    const name = el.getAttribute("data-name");
    const type = el.getAttribute("data-component");
    const cls = TApplication.TheApplication.types.get(type);
    if (!cls) return null;
    let child = parent;
    if (cls != TMetaForm.metaclass) {
      child = cls.create(name, form, parent);
    }
    this.registerInstance(name, child);
    if (!child) return null;
    child.elem = el;
    this.parsePropsFromElement(child);
    child.syncDomFromProps();
    child.onAttachedToDom?.();
    const maybeHost = child;
    if (maybeHost && typeof maybeHost.setPluginSpec === "function") {
      const plugin = el.getAttribute("data-plugin");
      const raw = el.getAttribute("data-props");
      const props = raw ? JSON.parse(raw) : {};
      maybeHost.setPluginSpec({ plugin, props });
      maybeHost.mountPluginIfReady(this.services);
    }
    if (child.allowsChildren()) {
      el.querySelectorAll(":scope > [data-component]").forEach((el2) => {
        this.processElem(el2, form, child);
      });
    }
    return child;
  }
  // This function is called juste once, when the form is created
  buildComponentTree(form, root) {
    this.clear();
    const rootElem = root.elem;
    this.processElem(rootElem, form, root);
  }
};
var _TDocument = class _TDocument extends TObject {
  constructor(htmlDoc) {
    super();
    __publicField(this, "htmlDoc");
    this.htmlDoc = htmlDoc;
  }
};
__publicField(_TDocument, "document", new _TDocument(document));
__publicField(_TDocument, "body", document.body);
var TDocument = _TDocument;
var _TMetaDocument = class _TMetaDocument extends TMetaObject {
  constructor(superClass, name) {
    super(superClass, name);
  }
  getMetaclass() {
    return _TMetaDocument.metaclass;
  }
};
__publicField(_TMetaDocument, "metaclass", new _TMetaDocument(TMetaObject.metaclass, "TDocument"));
var TMetaDocument = _TMetaDocument;
var TContainer = class extends TComponent {
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
    if (!el) return;
    super.syncDomFromProps();
  }
  allowsChildren() {
    return true;
  }
  //titi=12;
};
var _TMetaContainer = class _TMetaContainer extends TMetaComponent {
  constructor(superClass, name) {
    super(superClass, name);
  }
  getMetaclass() {
    return _TMetaContainer.metaclass;
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
};
__publicField(_TMetaContainer, "metaclass", new _TMetaContainer(TMetaComponent.metaclass, "TContainer"));
var TMetaContainer = _TMetaContainer;
var TPanel = class extends TContainer {
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
    if (!el) return;
    super.syncDomFromProps();
  }
  //toto = 12;
};
var _TMetaPanel = class _TMetaPanel extends TMetaContainer {
  constructor(superClass, name) {
    super(superClass, name);
  }
  getMetaclass() {
    return _TMetaPanel.metaclass;
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
};
__publicField(_TMetaPanel, "metaclass", new _TMetaPanel(TMetaContainer.metaclass, "TPanel"));
var TMetaPanel = _TMetaPanel;
var _TMetaForm = class _TMetaForm extends TMetaContainer {
  getMetaClass() {
    return _TMetaForm.metaclass;
  }
  constructor(superClass, name) {
    super(superClass, name);
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
};
__publicField(_TMetaForm, "metaclass", new _TMetaForm(TMetaContainer.metaclass, "TForm"));
var TMetaForm = _TMetaForm;
var _TForm = class _TForm extends TContainer {
  constructor(name) {
    super(name, null, null);
    __publicField(this, "_mounted", false);
    // Each Form has its own componentRegistry
    __publicField(this, "componentRegistry", new TComponentRegistry());
    __publicField(this, "_ac", null);
    this.form = this;
    _TForm.forms.set(name, this);
  }
  getMetaclass() {
    return TMetaForm.metaclass;
  }
  get application() {
    return this.form?.application ?? TApplication.TheApplication;
  }
  // English comments as requested.
  findFormFromEventTarget(target) {
    const formElem = target.closest('[data-component="TForm"][data-name]');
    if (!formElem) return null;
    const formName = formElem.getAttribute("data-name");
    if (!formName) return null;
    return _TForm.forms.get(formName) ?? null;
  }
  installEventRouter() {
    this._ac?.abort();
    this._ac = new AbortController();
    const { signal } = this._ac;
    const root = this.elem;
    if (!root) return;
    const handler = (ev) => this.dispatchDomEvent(ev);
    for (const type of ["click", "input", "change", "keydown"]) {
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
    if (!targetElem) return;
    const propName = `on${ev.type}`;
    let el = targetElem.closest("[data-component]");
    if (!el) return;
    const name = el.getAttribute("data-name");
    let comp = name ? this.componentRegistry.get(name) : null;
    while (comp) {
      const handler = comp.getProp(propName);
      if (handler && handler.s && handler.s != "") {
        handler.fire(this, propName, ev, comp);
        return;
      }
      comp = comp.parent;
    }
  }
  show() {
    if (!this.elem) {
      this.elem = this.componentRegistry.resolveRoot();
    }
    if (!this._mounted) {
      this.componentRegistry.buildComponentTree(this, this);
      this.onCreate();
      this.installEventRouter();
      this._mounted = true;
    }
    this.onShown();
  }
  onCreate() {
    const onShownName = this.elem.getAttribute("data-oncreate");
    if (onShownName) {
      queueMicrotask(() => {
        const fn = this[onShownName];
        if (typeof fn === "function") fn.call(this, null, this);
      });
    }
  }
  onShown() {
    const onShownName = this.elem.getAttribute("data-onshown");
    if (onShownName) {
      queueMicrotask(() => {
        const fn = this[onShownName];
        if (typeof fn === "function") fn.call(this, null, this);
      });
    }
  }
};
__publicField(_TForm, "forms", /* @__PURE__ */ new Map());
var TForm = _TForm;
var TButton = class extends TComponent {
  constructor(name, form, parent) {
    super(name, form, parent);
    __publicField(this, "_caption", "");
    __publicField(this, "_enabled", true);
  }
  getMetaclass() {
    return TMetaButton.metaclass;
  }
  htmlButton() {
    return this.htmlElement;
  }
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
    if (!el) return;
    el.textContent = this.caption;
  }
  get enabled() {
    return this._enabled ?? true;
  }
  set enabled(enabled) {
    this._enabled = enabled;
    this.htmlButton().disabled = !enabled;
  }
  syncDomFromProps() {
    const el = this.htmlElement;
    if (!el) return;
    el.textContent = this.caption;
    this.htmlButton().disabled = !this.enabled;
    super.syncDomFromProps();
  }
};
var _TMetaButton = class _TMetaButton extends TMetaComponent {
  constructor(superClass, name) {
    super(superClass, name);
  }
  getMetaclass() {
    return _TMetaButton.metaclass;
  }
  create(name, form, parent) {
    return new TButton(name, form, parent);
  }
  defProps() {
    return [
      {
        name: "caption",
        kind: "string",
        retrieve: (o) => {
          return o.caption;
        },
        apply: (o, v) => o.caption = String(v)
      },
      {
        name: "enabled",
        kind: "boolean",
        retrieve: (o) => {
          return o.enabled;
        },
        apply: (o, v) => o.enabled = Boolean(v)
      }
    ];
  }
};
__publicField(_TMetaButton, "metaclass", new _TMetaButton(TMetaComponent.metaclass, "TButton"));
var TMetaButton = _TMetaButton;
var _TMetaApplication = class _TMetaApplication extends TMetaclass {
  constructor(superClass, name) {
    super(superClass, name);
  }
  getMetaclass() {
    return _TMetaApplication.metaclass;
  }
};
__publicField(_TMetaApplication, "metaclass", new _TMetaApplication(TMetaclass.metaclass, "TApplication"));
var TMetaApplication = _TMetaApplication;
var _TApplication = class _TApplication {
  constructor() {
    //static pluginRegistry = new PluginRegistry();
    //plugins: IPluginRegistry;
    __publicField(this, "forms", []);
    __publicField(this, "types", new TComponentTypeRegistry2());
    __publicField(this, "mainForm", null);
    _TApplication.TheApplication = this;
    registerBuiltins(this.types);
  }
  getMetaclass() {
    return TMetaApplication.metaclass;
  }
  createForm(ctor, name) {
    const f = new ctor(name);
    this.forms.push(f);
    if (!this.mainForm) this.mainForm = f;
    return f;
  }
  run() {
    this.runWhenDomReady(() => {
      if (this.mainForm) this.mainForm.show();
      else this.autoStart();
    });
  }
  autoStart() {
  }
  runWhenDomReady(fn) {
    if (document.readyState === "loading") {
      window.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }
};
__publicField(_TApplication, "TheApplication");
var TApplication = _TApplication;
var _TMetaPluginHost = class _TMetaPluginHost extends TMetaComponent {
  getMetaclass() {
    return _TMetaPluginHost.metaclass;
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
};
__publicField(_TMetaPluginHost, "metaclass", new _TMetaPluginHost(TMetaComponent.metaclass, "TPluginHost"));
var TMetaPluginHost = _TMetaPluginHost;
var TPluginHost = class extends TComponent {
  constructor(name, form, parent) {
    super(name, form, parent);
    __publicField(this, "instance", null);
    __publicField(this, "pluginName", null);
    __publicField(this, "pluginProps", {});
    __publicField(this, "factory", null);
  }
  // Called by the metaclass (or by your registry) right after creation
  setPluginFactory(factory) {
    this.factory = factory;
  }
  mountPlugin(props, services) {
    const container = this.htmlElement;
    if (!container) return;
    if (!this.factory) {
      services.log.warn("TPluginHost: no plugin factory set", { host: this.name });
      return;
    }
    this.unmount();
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
    if (!container || !this.form || !this.pluginName) return;
    const app = TApplication.TheApplication;
    const def = PluginRegistry.pluginRegistry.get(this.pluginName);
    if (!def) {
      services.log.warn("Unknown plugin", { plugin: this.pluginName });
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
    } finally {
      this.instance = null;
    }
  }
};
var _PluginRegistry = class _PluginRegistry {
  constructor() {
    __publicField(this, "plugins", /* @__PURE__ */ new Map());
  }
  register(name, def) {
    if (this.plugins.has(name)) throw new Error(`Plugin already registered: ${name}`);
    this.plugins.set(name, def);
  }
  get(name) {
    return this.plugins.get(name);
  }
  has(name) {
    return this.plugins.has(name);
  }
};
__publicField(_PluginRegistry, "pluginRegistry", new _PluginRegistry());
var PluginRegistry = _PluginRegistry;
var TSimpleDCC = class extends TComponent {
  getMetaclass() {
    return TMetaSimpleDCC.metaclass;
  }
  constructor(name, form, parent) {
    super(name, form, parent);
  }
  /*
  protected get dccprops(): SimpleDCCProps {
          return this.props as SimpleDCCProps;
  }
          */
};
var _TMetaSimpleDCC = class _TMetaSimpleDCC extends TMetaComponent {
  constructor(superClass, name) {
    super(superClass, name);
  }
  getMetaclass() {
    return _TMetaSimpleDCC.metaclass;
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
};
__publicField(_TMetaSimpleDCC, "metaclass", new _TMetaSimpleDCC(TMetaComponent.metaclass, "TSimpleDCC"));
var TMetaSimpleDCC = _TMetaSimpleDCC;
var TCompositeDCC = class extends TContainer {
  getMetaclass() {
    return TMetaCompositeDCC.metaclass;
  }
  constructor(name, form, parent) {
    super(name, form, parent);
  }
  /*
  protected get dccprops(): CompositeDCCProps {
          return this.props as CompositeDCCProps;
  }
          */
};
var _TMetaCompositeDCC = class _TMetaCompositeDCC extends TMetaContainer {
  constructor(superClass, name) {
    super(superClass, name);
  }
  getMetaclass() {
    return _TMetaCompositeDCC.metaclass;
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
};
__publicField(_TMetaCompositeDCC, "metaclass", new _TMetaCompositeDCC(TMetaContainer.metaclass, "TCompositDCC"));
var TMetaCompositeDCC = _TMetaCompositeDCC;

// examples/zaza/test.ts
var _MetaRoot = class _MetaRoot {
  constructor(superClass, typeName = "TMetaRoot") {
    __publicField(this, "superClass");
    __publicField(this, "typeName");
    this.superClass = superClass;
    this.typeName = typeName;
  }
  getMetaclass() {
    return _MetaRoot.metaclass;
  }
};
__publicField(_MetaRoot, "metaclass", new _MetaRoot(null));
var MetaRoot = _MetaRoot;
var _MetaTestA = class _MetaTestA extends MetaRoot {
  constructor(superClass) {
    super(superClass, "TestA");
  }
  getMetaclass() {
    return _MetaTestA.metaclass;
  }
};
__publicField(_MetaTestA, "metaclass", new _MetaTestA(MetaRoot.metaclass));
var MetaTestA = _MetaTestA;
var _MetaTestB = class _MetaTestB extends MetaTestA {
  constructor(superClass) {
    super(superClass);
    this.typeName = "TestB";
  }
  getMetaclass() {
    return _MetaTestB.metaclass;
  }
};
__publicField(_MetaTestB, "metaclass", new _MetaTestB(MetaTestA.metaclass));
var MetaTestB = _MetaTestB;
var _MetaTestC = class _MetaTestC extends MetaTestB {
  constructor(superClass) {
    super(superClass);
    this.typeName = "TestC";
  }
  getMetaclass() {
    return _MetaTestC.metaclass;
  }
};
__publicField(_MetaTestC, "metaclass", new _MetaTestC(MetaTestB.metaclass));
var MetaTestC = _MetaTestC;
function test() {
  let c = MetaTestC.metaclass;
  while (c) {
    console.log(`${c.getMetaclass().typeName} - ${c.typeName} -> ${c.superClass?.typeName}`);
    c = c.superClass;
  }
}

// examples/zaza/zaza.ts
console.log("I AM ZAZA");
console.log("I AM ZAZA");
var Zaza = class extends TForm {
  // Form components - This list is auto generated by Delphine
  // ---------------
  //button1 : TButton = new TButton("button1", this, this);
  //button2 : TButton = new TButton("button2", this, this);
  //button3 : TButton = new TButton("button3", this, this);
  // ---------------
  constructor(name) {
    super(name);
  }
  //import { installDelphineRuntime } from "./drt";
  /*
  const runtime = {   
    handleClick({ element }: { element: Element }) {
      console.log("clicked!", element);
      //(element as HTMLElement).style.backgroundColor = "red";
    },
  }; 
  */
  onMyCreate(_ev, _sender) {
    const btn = this.componentRegistry.get("button2");
    if (btn) btn.color = TColor.rgb(0, 0, 255);
  }
  onMyShown(_ev, _sender) {
    const btn = this.componentRegistry.get("button3");
    if (btn) btn.color = TColor.rgb(0, 255, 255);
  }
  button1_onclick(_ev, _sender) {
    const btn = this.componentRegistry.get("button1");
    if (!btn) {
      console.warn("button1 not found in registry");
      return;
    }
    btn.color = TColor.rgb(255, 0, 0);
    btn.caption = "MIMI";
    console.log("Button1 clicked!!!!");
  }
  zaza_onclick(_ev, _sender) {
    const btn = this.componentRegistry.get("buttonx");
    btn.color = TColor.rgb(0, 255, 0);
    console.log("zaza clicked!!!!");
  }
  //installDelphineRuntime(runtime);
};
var MyApplication = class extends TApplication {
  constructor() {
    super();
    __publicField(this, "zaza");
    this.zaza = new Zaza("zaza");
    this.mainForm = this.zaza;
  }
  run() {
    this.runWhenDomReady(() => {
      this.zaza.show();
    });
  }
};
var myApplication = new MyApplication();
test();
myApplication.run();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL3ZjbC9yZWdpc3RlclZjbC50cyIsICIuLi9zcmMvdmNsL1N0ZEN0cmxzLnRzIiwgIi4uL2V4YW1wbGVzL3phemEvdGVzdC50cyIsICIuLi9leGFtcGxlcy96YXphL3phemEudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IFRDb21wb25lbnRUeXBlUmVnaXN0cnksIFRNZXRhQnV0dG9uLCBUTWV0YVBsdWdpbkhvc3QsIFRNZXRhRm9ybSwgVE1ldGFQYW5lbCB9IGZyb20gJ0B2Y2wnO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJCdWlsdGlucyh0eXBlczogVENvbXBvbmVudFR5cGVSZWdpc3RyeSkge1xuICAgICAgICB0eXBlcy5yZWdpc3RlcihUTWV0YUJ1dHRvbi5tZXRhY2xhc3MpO1xuICAgICAgICB0eXBlcy5yZWdpc3RlcihUTWV0YVBsdWdpbkhvc3QubWV0YWNsYXNzKTtcbiAgICAgICAgdHlwZXMucmVnaXN0ZXIoVE1ldGFGb3JtLm1ldGFjbGFzcyk7XG4gICAgICAgIHR5cGVzLnJlZ2lzdGVyKFRNZXRhUGFuZWwubWV0YWNsYXNzKTtcbiAgICAgICAgLy8gdHlwZXMucmVnaXN0ZXIoVEVkaXRDbGFzcyk7XG4gICAgICAgIC8vIHR5cGVzLnJlZ2lzdGVyKFRMYWJlbENsYXNzKTtcbn1cbiIsICJpbXBvcnQgeyByZWdpc3RlckJ1aWx0aW5zIH0gZnJvbSAnLi9yZWdpc3RlclZjbCc7XG5cbi8qXG4gICBUbyBjcmVhdGUgYSBuZXcgY29tcG9uZW50IHR5cGU6XG5cbiAgIFRvIGNyZWF0ZSBhIG5ldyBjb21wb25lbnQgYXR0cmlidXRcblxuKi9cblxuZXhwb3J0IGNsYXNzIFRDb2xvciB7XG4gICAgICAgIHM6IHN0cmluZztcblxuICAgICAgICBjb25zdHJ1Y3RvcihzOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnMgPSBzO1xuICAgICAgICB9XG4gICAgICAgIC8qIGZhY3RvcnkgKi8gc3RhdGljIHJnYihyOiBudW1iZXIsIGc6IG51bWJlciwgYjogbnVtYmVyKTogVENvbG9yIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRDb2xvcihgcmdiKCR7cn0sICR7Z30sICR7Yn0pYCk7XG4gICAgICAgIH1cbiAgICAgICAgLyogZmFjdG9yeSAqLyBzdGF0aWMgcmdiYShyOiBudW1iZXIsIGc6IG51bWJlciwgYjogbnVtYmVyLCBhOiBudW1iZXIpOiBUQ29sb3Ige1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVENvbG9yKGByZ2JhKCR7cn0sICR7Z30sICR7Yn0sICR7YX0pYCk7XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRIYW5kbGVyIHtcbiAgICAgICAgczogc3RyaW5nO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHM6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHRoaXMucyA9IHM7XG4gICAgICAgIH1cbiAgICAgICAgZmlyZShmb3JtOiBURm9ybSwgaGFuZGxlck5hbWU6IHN0cmluZywgZXY6IEV2ZW50LCBzZW5kZXI6IGFueSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1heWJlTWV0aG9kID0gKGZvcm0gYXMgYW55KVt0aGlzLnNdO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbWF5YmVNZXRob2QgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOT1QgQSBNRVRIT0QnLCBoYW5kbGVyTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gSWYgc2VuZGVyIGlzIG1pc3NpbmcsIGZhbGxiYWNrIHRvIHRoZSBmb3JtIGl0c2VsZiAoc2FmZSlcbiAgICAgICAgICAgICAgICAobWF5YmVNZXRob2QgYXMgKGV2ZW50OiBFdmVudCwgc2VuZGVyOiBhbnkpID0+IGFueSkuY2FsbChmb3JtLCBldiwgc2VuZGVyID8/IHRoaXMpO1xuICAgICAgICB9XG59XG5cbmV4cG9ydCB0eXBlIENvbXBvbmVudEZhY3RvcnkgPSAobmFtZTogc3RyaW5nLCBmb3JtOiBURm9ybSwgb3duZXI6IFRDb21wb25lbnQpID0+IFRDb21wb25lbnQ7XG5cbmV4cG9ydCB0eXBlIEpzb24gPSBudWxsIHwgYm9vbGVhbiB8IG51bWJlciB8IHN0cmluZyB8IEpzb25bXSB8IHsgW2tleTogc3RyaW5nXTogSnNvbiB9O1xuXG50eXBlIFByb3BLaW5kID0gJ3N0cmluZycgfCAnbnVtYmVyJyB8ICdib29sZWFuJyB8ICdjb2xvcicgfCAnaGFuZGxlcic7XG5cbmV4cG9ydCB0eXBlIFByb3BTcGVjPFQsIFYgPSB1bmtub3duPiA9IHtcbiAgICAgICAgbmFtZTogc3RyaW5nO1xuICAgICAgICBraW5kOiBQcm9wS2luZDtcbiAgICAgICAgcmV0cmlldmU6IChvYmo6IFQpID0+IFY7XG4gICAgICAgIGFwcGx5OiAob2JqOiBULCB2YWx1ZTogVikgPT4gdm9pZDtcbn07XG5cbnR5cGUgVW5rbm93blJlY29yZCA9IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuZXhwb3J0IHR5cGUgQ29tcG9uZW50UHJvcHMgPSBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuY29uc3QgUkVTRVJWRURfREFUQV9BVFRSUyA9IG5ldyBTZXQ8c3RyaW5nPihbXG4gICAgICAgICdkYXRhLWNvbXBvbmVudCcsXG4gICAgICAgICdkYXRhLW5hbWUnLFxuICAgICAgICAnZGF0YS1wcm9wcycsXG4gICAgICAgICdkYXRhLXBsdWdpbicsXG4gICAgICAgICdkYXRhLW1lc3NhZ2UnIC8vIGFkZCBhbnkgbWV0YS9mcmFtZXdvcmsgYXR0cnMgeW91IGRvbid0IHdhbnQgdHJlYXRlZCBhcyBwcm9wc1xuXSk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVBsdWdpbkhvc3Qge1xuICAgICAgICBzZXRQbHVnaW5TcGVjKHNwZWM6IHsgcGx1Z2luOiBzdHJpbmcgfCBudWxsOyBwcm9wczogYW55IH0pOiB2b2lkO1xuICAgICAgICBtb3VudFBsdWdpbklmUmVhZHkoc2VydmljZXM6IERlbHBoaW5lU2VydmljZXMpOiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERlbHBoaW5lTG9nZ2VyIHtcbiAgICAgICAgZGVidWcobXNnOiBzdHJpbmcsIGRhdGE/OiBKc29uKTogdm9pZDtcbiAgICAgICAgaW5mbyhtc2c6IHN0cmluZywgZGF0YT86IEpzb24pOiB2b2lkO1xuICAgICAgICB3YXJuKG1zZzogc3RyaW5nLCBkYXRhPzogSnNvbik6IHZvaWQ7XG4gICAgICAgIGVycm9yKG1zZzogc3RyaW5nLCBkYXRhPzogSnNvbik6IHZvaWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGVscGhpbmVFdmVudEJ1cyB7XG4gICAgICAgIC8vIFN1YnNjcmliZSB0byBhbiBhcHAgZXZlbnQuXG4gICAgICAgIG9uKGV2ZW50TmFtZTogc3RyaW5nLCBoYW5kbGVyOiAocGF5bG9hZDogSnNvbikgPT4gdm9pZCk6ICgpID0+IHZvaWQ7XG5cbiAgICAgICAgLy8gUHVibGlzaCBhbiBhcHAgZXZlbnQuXG4gICAgICAgIGVtaXQoZXZlbnROYW1lOiBzdHJpbmcsIHBheWxvYWQ6IEpzb24pOiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERlbHBoaW5lU3RvcmFnZSB7XG4gICAgICAgIGdldChrZXk6IHN0cmluZyk6IFByb21pc2U8SnNvbiB8IHVuZGVmaW5lZD47XG4gICAgICAgIHNldChrZXk6IHN0cmluZywgdmFsdWU6IEpzb24pOiBQcm9taXNlPHZvaWQ+O1xuICAgICAgICByZW1vdmUoa2V5OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+O1xufVxuZXhwb3J0IGludGVyZmFjZSBEZWxwaGluZVNlcnZpY2VzIHtcbiAgICAgICAgbG9nOiB7XG4gICAgICAgICAgICAgICAgZGVidWcobXNnOiBzdHJpbmcsIGRhdGE/OiBhbnkpOiB2b2lkO1xuICAgICAgICAgICAgICAgIGluZm8obXNnOiBzdHJpbmcsIGRhdGE/OiBhbnkpOiB2b2lkO1xuICAgICAgICAgICAgICAgIHdhcm4obXNnOiBzdHJpbmcsIGRhdGE/OiBhbnkpOiB2b2lkO1xuICAgICAgICAgICAgICAgIGVycm9yKG1zZzogc3RyaW5nLCBkYXRhPzogYW55KTogdm9pZDtcbiAgICAgICAgfTtcblxuICAgICAgICBidXM6IHtcbiAgICAgICAgICAgICAgICBvbihldmVudDogc3RyaW5nLCBoYW5kbGVyOiAocGF5bG9hZDogYW55KSA9PiB2b2lkKTogKCkgPT4gdm9pZDtcbiAgICAgICAgICAgICAgICBlbWl0KGV2ZW50OiBzdHJpbmcsIHBheWxvYWQ6IGFueSk6IHZvaWQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgc3RvcmFnZToge1xuICAgICAgICAgICAgICAgIGdldChrZXk6IHN0cmluZyk6IFByb21pc2U8YW55PiB8IG51bGw7XG4gICAgICAgICAgICAgICAgc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogYW55KTogUHJvbWlzZTx2b2lkPiB8IG51bGw7XG4gICAgICAgICAgICAgICAgcmVtb3ZlKGtleTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB8IG51bGw7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gZnV0dXJcbiAgICAgICAgLy8gaTE4bj86IC4uLlxuICAgICAgICAvLyBuYXY/OiAuLi5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBVSVBsdWdpbkluc3RhbmNlPFByb3BzIGV4dGVuZHMgSnNvbiA9IEpzb24+IHtcbiAgICAgICAgcmVhZG9ubHkgaWQ6IHN0cmluZztcblxuICAgICAgICAvLyBDYWxsZWQgZXhhY3RseSBvbmNlIGFmdGVyIGNyZWF0aW9uIChmb3IgYSBnaXZlbiBpbnN0YW5jZSkuXG4gICAgICAgIG1vdW50KGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIHByb3BzOiBQcm9wcywgc2VydmljZXM6IERlbHBoaW5lU2VydmljZXMpOiB2b2lkO1xuXG4gICAgICAgIC8vIENhbGxlZCBhbnkgdGltZSBwcm9wcyBjaGFuZ2UgKG1heSBiZSBmcmVxdWVudCkuXG4gICAgICAgIHVwZGF0ZShwcm9wczogUHJvcHMpOiB2b2lkO1xuXG4gICAgICAgIC8vIENhbGxlZCBleGFjdGx5IG9uY2UgYmVmb3JlIGRpc3Bvc2FsLlxuICAgICAgICB1bm1vdW50KCk6IHZvaWQ7XG5cbiAgICAgICAgLy8gT3B0aW9uYWwgZXJnb25vbWljcy5cbiAgICAgICAgZ2V0U2l6ZUhpbnRzPygpOiBudW1iZXI7XG4gICAgICAgIGZvY3VzPygpOiB2b2lkO1xuXG4gICAgICAgIC8vIE9wdGlvbmFsIHBlcnNpc3RlbmNlIGhvb2sgKERlbHBoaW5lIG1heSBzdG9yZSAmIHJlc3RvcmUgdGhpcykuXG4gICAgICAgIHNlcmlhbGl6ZVN0YXRlPygpOiBKc29uO1xufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVE1ldGFjbGFzcyB7XG4gICAgICAgIHJlYWRvbmx5IHR5cGVOYW1lOiBzdHJpbmcgPSAnVE1ldGFjbGFzcyc7XG4gICAgICAgIHN0YXRpYyBtZXRhY2xhc3M6IFRNZXRhY2xhc3M7XG4gICAgICAgIHJlYWRvbmx5IHN1cGVyQ2xhc3M6IFRNZXRhY2xhc3MgfCBudWxsID0gbnVsbDtcblxuICAgICAgICBhYnN0cmFjdCBnZXRNZXRhY2xhc3MoKTogVE1ldGFjbGFzcztcbiAgICAgICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHN1cGVyQ2xhc3M6IFRNZXRhY2xhc3MgfCBudWxsLCB0eXBlTmFtZSA9ICdUTWV0YWNsYXNzJykge1xuICAgICAgICAgICAgICAgIHRoaXMuc3VwZXJDbGFzcyA9IHN1cGVyQ2xhc3M7XG4gICAgICAgICAgICAgICAgdGhpcy50eXBlTmFtZSA9IHR5cGVOYW1lO1xuICAgICAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUT2JqZWN0IHtcbiAgICAgICAgZ2V0TWV0YUNsYXNzKCk6IFRNZXRhT2JqZWN0IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFPYmplY3QubWV0YUNsYXNzO1xuICAgICAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUTWV0YU9iamVjdCBleHRlbmRzIFRNZXRhY2xhc3Mge1xuICAgICAgICBzdGF0aWMgcmVhZG9ubHkgbWV0YUNsYXNzOiBUTWV0YU9iamVjdCA9IG5ldyBUTWV0YU9iamVjdChUTWV0YWNsYXNzLm1ldGFjbGFzcywgJ1RPYmplY3QnKTtcblxuICAgICAgICBnZXRNZXRhY2xhc3MoKTogVE1ldGFPYmplY3Qge1xuICAgICAgICAgICAgICAgIHJldHVybiBUTWV0YU9iamVjdC5tZXRhQ2xhc3M7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3RydWN0b3Ioc3VwZXJDbGFzczogVE1ldGFjbGFzcywgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoc3VwZXJDbGFzcywgbmFtZSk7XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRDb21wb25lbnQge1xuICAgICAgICBnZXRNZXRhY2xhc3MoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhQ29tcG9uZW50Lm1ldGFjbGFzcztcbiAgICAgICAgfVxuXG4gICAgICAgIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcbiAgICAgICAgcmVhZG9ubHkgcGFyZW50OiBUQ29tcG9uZW50IHwgbnVsbCA9IG51bGw7XG5cbiAgICAgICAgcHJvdGVjdGVkIHByb3BzOiBDb21wb25lbnRQcm9wcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgICAgICAgZ2V0UHJvcDxUID0gdW5rbm93bj4obmFtZTogc3RyaW5nKTogVCB8IHVuZGVmaW5lZCB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvcHNbbmFtZV0gYXMgVCB8IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHNldFByb3AobmFtZTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IHZvaWQge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHNbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG9wdGlvbmFsXG4gICAgICAgIGhhc1Byb3AobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLnByb3BzLCBuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICAvL3Byb3RlY3RlZCBwcm9wczogQ29tcG9uZW50UHJvcHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICBmb3JtOiBURm9ybSB8IG51bGwgPSBudWxsO1xuICAgICAgICBjaGlsZHJlbjogVENvbXBvbmVudFtdID0gW107XG5cbiAgICAgICAgZWxlbTogRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgICAgICBnZXQgaHRtbEVsZW1lbnQoKTogSFRNTEVsZW1lbnQgfCBudWxsIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5lbGVtIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIGZvcm06IFRGb3JtIHwgbnVsbCwgcGFyZW50OiBUQ29tcG9uZW50IHwgbnVsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgICAgICAgICAgICAgcGFyZW50Py5jaGlsZHJlbi5wdXNoKHRoaXMpOyAvLyBDb3VsZCBiZSBkb25lIGluIGJ1aWxkQ29tcG9uZW50VHJlZSgpXG4gICAgICAgICAgICAgICAgdGhpcy5mb3JtID0gZm9ybTtcblxuICAgICAgICAgICAgICAgIC8vIElNUE9SVEFOVDogSW5pdGlhbGl6ZSBwcm9wcyBhdCBydW50aW1lIChkZWNsYXJlIHdvdWxkIG5vdCBkbyBpdCkuXG4gICAgICAgICAgICAgICAgLy90aGlzLnByb3BzID0ge307XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOT1RFOiBUaGlzIGlzIHJ1bnRpbWUgZGF0YSwgc28gaXQgbXVzdCBiZSBpbml0aWFsaXplZCAobm8gXCJkZWNsYXJlXCIpLlxuICAgICAgICAvL3Byb3BzOiBDb21wb25lbnRQcm9wcztcblxuICAgICAgICAvKiogTWF5IGNvbnRhaW4gY2hpbGQgY29tcG9uZW50cyAqL1xuICAgICAgICBfb25jbGljazogVEhhbmRsZXIgPSBuZXcgVEhhbmRsZXIoJycpO1xuICAgICAgICBhbGxvd3NDaGlsZHJlbigpOiBib29sZWFuIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IGNvbG9yKCk6IFRDb2xvciB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUQ29sb3IodGhpcy5nZXRIdG1sU3R5bGVQcm9wKCdjb2xvcicpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNldCBjb2xvcihjb2xvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0SHRtbFN0eWxlUHJvcCgnY29sb3InLCBjb2xvci5zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdldCBvbmNsaWNrKCk6IFRIYW5kbGVyIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fb25jbGljayA/PyBuZXcgVEhhbmRsZXIoJycpO1xuICAgICAgICB9XG4gICAgICAgIHNldCBvbmNsaWNrKGhhbmRsZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9vbmNsaWNrID0gaGFuZGxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHN5bmNEb21Gcm9tUHJvcHMoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZWwgPSB0aGlzLmh0bWxFbGVtZW50O1xuICAgICAgICAgICAgICAgIGlmICghZWwpIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGdldCBiYWNrZ3JvdW5kQ29sb3IoKTogVENvbG9yIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRDb2xvcih0aGlzLmdldEh0bWxTdHlsZVByb3AoJ2JhY2tncm91bmQtY29sb3InKSk7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IGJhY2tncm91bmRDb2xvcih2OiBUQ29sb3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEh0bWxTdHlsZVByb3AoJ2JhY2tncm91bmQtY29sb3InLCB2LnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0IHdpZHRoKCk6IHN0cmluZyB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SHRtbFByb3AoJ3dpZHRoJykgPz8gJyc7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IHdpZHRoKHY6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0SHRtbFByb3AoJ3dpZHRoJywgdik7XG4gICAgICAgIH1cblxuICAgICAgICBnZXQgaGVpZ2h0KCk6IHN0cmluZyB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SHRtbFByb3AoJ2hlaWdodCcpID8/ICcnO1xuICAgICAgICB9XG4gICAgICAgIHNldCBoZWlnaHQodjogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRIdG1sUHJvcCgnaGVpZ2h0Jywgdik7XG4gICAgICAgIH1cblxuICAgICAgICBnZXQgb2Zmc2V0V2lkdGgoKTogbnVtYmVyIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5odG1sRWxlbWVudCEub2Zmc2V0V2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IG9mZnNldEhlaWdodCgpOiBudW1iZXIge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmh0bWxFbGVtZW50IS5vZmZzZXRIZWlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICBzZXRIdG1sU3R5bGVQcm9wKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHRoaXMuaHRtbEVsZW1lbnQhLnN0eWxlLnNldFByb3BlcnR5KG5hbWUsIHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdldEh0bWxTdHlsZVByb3AobmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaHRtbEVsZW1lbnQhLnN0eWxlLmdldFByb3BlcnR5VmFsdWUobmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICBzZXRIdG1sUHJvcChuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmh0bWxFbGVtZW50IS5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0SHRtbFByb3AobmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMhLmh0bWxFbGVtZW50IS5nZXRBdHRyaWJ1dGUobmFtZSk7XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRNZXRhQ29tcG9uZW50IGV4dGVuZHMgVE1ldGFjbGFzcyB7XG4gICAgICAgIHN0YXRpYyByZWFkb25seSBtZXRhY2xhc3MgPSBuZXcgVE1ldGFDb21wb25lbnQoVE1ldGFjbGFzcy5tZXRhY2xhc3MsICdUQ29tcG9uZW50Jyk7XG4gICAgICAgIC8vIFRoZSBzeW1ib2xpYyBuYW1lIHVzZWQgaW4gSFRNTDogZGF0YS1jb21wb25lbnQ9XCJUQnV0dG9uXCIgb3IgXCJteS1idXR0b25cIlxuICAgICAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3Ioc3VwZXJDbGFzczogVE1ldGFjbGFzcywgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoc3VwZXJDbGFzcywgbmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICBnZXRNZXRhY2xhc3MoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhQ29tcG9uZW50Lm1ldGFjbGFzcztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgcnVudGltZSBpbnN0YW5jZSBhbmQgYXR0YWNoIGl0IHRvIHRoZSBET00gZWxlbWVudC5cbiAgICAgICAgY3JlYXRlKG5hbWU6IHN0cmluZywgZm9ybTogVEZvcm0sIHBhcmVudDogVENvbXBvbmVudCk6IFRDb21wb25lbnQge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVENvbXBvbmVudChuYW1lLCBmb3JtLCBwYXJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVmUHJvcHMoKTogUHJvcFNwZWM8YW55PltdIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICAgICAgLy97IG5hbWU6ICdjb2xvcicsIGtpbmQ6ICdjb2xvcicsIGFwcGx5OiAobywgdikgPT4gKG8uY29sb3IgPSBuZXcgVENvbG9yKFN0cmluZyh2KSkpIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdvbmNsaWNrJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2luZDogJ2hhbmRsZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXRyaWV2ZTogKG8pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gby5vbmNsaWNrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBseTogKG8sIHYpID0+IChvLm9uY2xpY2sgPSBuZXcgVEhhbmRsZXIoU3RyaW5nKHYpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8veyBuYW1lOiAnb25jcmVhdGUnLCBraW5kOiAnaGFuZGxlcicsIGFwcGx5OiAobywgdikgPT4gKG8ub25jcmVhdGUgPSBuZXcgVEhhbmRsZXIoU3RyaW5nKHYpKSkgfVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgIH1cblxuICAgICAgICBkb21FdmVudHM/KCk6IHN0cmluZ1tdOyAvLyBkZWZhdWx0IFtdO1xufVxuXG5leHBvcnQgY2xhc3MgVE1ldGFDb21wb25lbnRUeXBlUmVnaXN0cnkgZXh0ZW5kcyBUTWV0YU9iamVjdCB7XG4gICAgICAgIHN0YXRpYyByZWFkb25seSBtZXRhY2xhc3M6IFRNZXRhQ29tcG9uZW50VHlwZVJlZ2lzdHJ5ID0gbmV3IFRNZXRhQ29tcG9uZW50VHlwZVJlZ2lzdHJ5KFRNZXRhT2JqZWN0Lm1ldGFDbGFzcywgJ1RDb21wb25lbnRUeXBlUmVnaXN0cnknKTtcbiAgICAgICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHN1cGVyQ2xhc3M6IFRNZXRhT2JqZWN0LCBuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICBzdXBlcihzdXBlckNsYXNzLCBuYW1lKTtcbiAgICAgICAgICAgICAgICAvLyBldCB2b3VzIGNoYW5nZXoganVzdGUgbGUgbm9tIDpcbiAgICAgICAgfVxuICAgICAgICBnZXRNZXRhY2xhc3MoKTogVE1ldGFDb21wb25lbnRUeXBlUmVnaXN0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiBUTWV0YUNvbXBvbmVudFR5cGVSZWdpc3RyeS5tZXRhY2xhc3M7XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRDb21wb25lbnRUeXBlUmVnaXN0cnkgZXh0ZW5kcyBUT2JqZWN0IHtcbiAgICAgICAgLy8gV2Ugc3RvcmUgaGV0ZXJvZ2VuZW91cyBtZXRhcywgc28gd2Uga2VlcCB0aGVtIGFzIFRNZXRhQ29tcG9uZW50PGFueT4uXG4gICAgICAgIGdldE1ldGFjbGFzcygpOiBUTWV0YUNvbXBvbmVudFR5cGVSZWdpc3RyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhQ29tcG9uZW50VHlwZVJlZ2lzdHJ5Lm1ldGFDbGFzcztcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IGNsYXNzZXMgPSBuZXcgTWFwPHN0cmluZywgVE1ldGFDb21wb25lbnQ+KCk7XG5cbiAgICAgICAgcmVnaXN0ZXIobWV0YTogVE1ldGFDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jbGFzc2VzLmhhcyhtZXRhLnR5cGVOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb21wb25lbnQgdHlwZSBhbHJlYWR5IHJlZ2lzdGVyZWQ6ICR7bWV0YS50eXBlTmFtZX1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5jbGFzc2VzLnNldChtZXRhLnR5cGVOYW1lLCBtZXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHlvdSBqdXN0IG5lZWQgXCJzb21ldGhpbmcgbWV0YVwiLCByZXR1cm4gYW55LW1ldGEuXG4gICAgICAgIGdldCh0eXBlTmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xhc3Nlcy5nZXQodHlwZU5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaGFzKHR5cGVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jbGFzc2VzLmhhcyh0eXBlTmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICBsaXN0KCk6IHN0cmluZ1tdIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gWy4uLnRoaXMuY2xhc3Nlcy5rZXlzKCldLnNvcnQoKTtcbiAgICAgICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVE1ldGFDb21wb25lbnRSZWdpc3RyeSBleHRlbmRzIFRNZXRhY2xhc3Mge1xuICAgICAgICBzdGF0aWMgcmVhZG9ubHkgbWV0YWNsYXNzOiBUTWV0YUNvbXBvbmVudFJlZ2lzdHJ5ID0gbmV3IFRNZXRhQ29tcG9uZW50UmVnaXN0cnkoVE1ldGFjbGFzcy5tZXRhY2xhc3MsICdUQ29tcG9uZW50VHlwZVJlZ2lzdHJ5Jyk7XG5cbiAgICAgICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHN1cGVyQ2xhc3M6IFRNZXRhY2xhc3MsIG5hbWU6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHN1cGVyKHN1cGVyQ2xhc3MsIG5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGdldE1ldGFjbGFzcygpOiBUTWV0YUNvbXBvbmVudFJlZ2lzdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFDb21wb25lbnRSZWdpc3RyeS5tZXRhY2xhc3M7XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRDb21wb25lbnRSZWdpc3RyeSBleHRlbmRzIFRPYmplY3Qge1xuICAgICAgICBnZXRNZXRhY2xhc3MoKTogVE1ldGFDb21wb25lbnRSZWdpc3RyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhQ29tcG9uZW50UmVnaXN0cnkubWV0YWNsYXNzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBpbnN0YW5jZXMgPSBuZXcgTWFwPHN0cmluZywgVENvbXBvbmVudD4oKTtcblxuICAgICAgICBsb2dnZXIgPSB7XG4gICAgICAgICAgICAgICAgZGVidWcobXNnOiBzdHJpbmcsIGRhdGE/OiBKc29uKTogdm9pZCB7fSxcbiAgICAgICAgICAgICAgICBpbmZvKG1zZzogc3RyaW5nLCBkYXRhPzogSnNvbik6IHZvaWQge30sXG4gICAgICAgICAgICAgICAgd2Fybihtc2c6IHN0cmluZywgZGF0YT86IEpzb24pOiB2b2lkIHt9LFxuICAgICAgICAgICAgICAgIGVycm9yKG1zZzogc3RyaW5nLCBkYXRhPzogSnNvbik6IHZvaWQge31cbiAgICAgICAgfTtcblxuICAgICAgICBldmVudEJ1cyA9IHtcbiAgICAgICAgICAgICAgICBvbihldmVudDogc3RyaW5nLCBoYW5kbGVyOiAocGF5bG9hZDogYW55KSA9PiB2b2lkKTogKCkgPT4gdm9pZCB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4gdm9pZCB7fTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVtaXQoZXZlbnQ6IHN0cmluZywgcGF5bG9hZDogYW55KTogdm9pZCB7fVxuICAgICAgICB9O1xuXG4gICAgICAgIHN0b3JhZ2UgPSB7XG4gICAgICAgICAgICAgICAgZ2V0KGtleTogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHwgbnVsbCB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNldChrZXk6IHN0cmluZywgdmFsdWU6IGFueSk6IFByb21pc2U8dm9pZD4gfCBudWxsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcmVtb3ZlKGtleTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB8IG51bGwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZWdpc3Rlckluc3RhbmNlKG5hbWU6IHN0cmluZywgYzogVENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VzLnNldChuYW1lLCBjKTtcbiAgICAgICAgfVxuICAgICAgICBnZXQ8VCBleHRlbmRzIFRDb21wb25lbnQgPSBUQ29tcG9uZW50PihuYW1lOiBzdHJpbmcpOiBUIHwgdW5kZWZpbmVkIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5pbnN0YW5jZXMuZ2V0KG5hbWUpIGFzIFQgfCB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBzZXJ2aWNlczogRGVscGhpbmVTZXJ2aWNlcyA9IHtcbiAgICAgICAgICAgICAgICBsb2c6IHRoaXMubG9nZ2VyLFxuICAgICAgICAgICAgICAgIGJ1czogdGhpcy5ldmVudEJ1cyxcbiAgICAgICAgICAgICAgICBzdG9yYWdlOiB0aGlzLnN0b3JhZ2VcbiAgICAgICAgfTtcblxuICAgICAgICBjbGVhcigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluc3RhbmNlcy5jbGVhcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzb2x2ZVJvb3QoKTogSFRNTEVsZW1lbnQge1xuICAgICAgICAgICAgICAgIC8vIFByZWZlciBib2R5IGFzIHRoZSBjYW5vbmljYWwgcm9vdC5cbiAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQuYm9keT8uZGF0YXNldD8uY29tcG9uZW50KSByZXR1cm4gZG9jdW1lbnQuYm9keTtcblxuICAgICAgICAgICAgICAgIC8vIEJhY2t3YXJkIGNvbXBhdGliaWxpdHk6IG9sZCB3cmFwcGVyIGRpdi5cbiAgICAgICAgICAgICAgICBjb25zdCBsZWdhY3kgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGVscGhpbmUtcm9vdCcpO1xuICAgICAgICAgICAgICAgIGlmIChsZWdhY3kpIHJldHVybiBsZWdhY3k7XG5cbiAgICAgICAgICAgICAgICAvLyBMYXN0IHJlc29ydC5cbiAgICAgICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQuYm9keSA/PyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIGNvbnZlcnQocmF3OiBzdHJpbmcsIGtpbmQ6IFByb3BLaW5kKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByYXcgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGtpbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmF3O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBOdW1iZXIocmF3KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJhdyA9PT0gJ3RydWUnIHx8IHJhdyA9PT0gJzEnIHx8IHJhdyA9PT0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2NvbG9yJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRDb2xvcihyYXcpOyAvLyBvdSBwYXJzZSBlbiBUQ29sb3Igc2kgdm91cyBhdmV6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2hhbmRsZXInOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVEhhbmRsZXIocmF3KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJhdztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tIFByb3BlcnRpZXMgLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgICAgICAvKipcbiAgICAgICAgICogRmluZCB0aGUgbmVhcmVzdCBQcm9wU3BlYyBmb3IgYSBwcm9wIG5hbWUgYnkgd2Fsa2luZyBtZXRhIGluaGVyaXRhbmNlOlxuICAgICAgICAgKiBtZXRhIC0+IG1ldGEuc3VwZXJDbGFzcyAtPiAuLi5cbiAgICAgICAgICogVXNlcyBjYWNoaW5nIGZvciBzcGVlZC5cbiAgICAgICAgICovXG4gICAgICAgIHByaXZhdGUgcmVzb2x2ZU5lYXJlc3RQcm9wU3BlYyhtZXRhOiBUTWV0YUNvbXBvbmVudCwgcHJvcE5hbWU6IHN0cmluZyk6IFByb3BTcGVjPGFueT4gfCBudWxsIHtcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgIGxldCBwZXJNZXRhID0gdGhpcy5fcHJvcFNwZWNDYWNoZS5nZXQobWV0YSk7XG4gICAgICAgICAgICAgICAgaWYgKCFwZXJNZXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJNZXRhID0gbmV3IE1hcDxzdHJpbmcsIFByb3BTcGVjPGFueT4gfCBudWxsPigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcHJvcFNwZWNDYWNoZS5zZXQobWV0YSwgcGVyTWV0YSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHBlck1ldGEuaGFzKHByb3BOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBlck1ldGEuZ2V0KHByb3BOYW1lKSE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgICAgIC8vIFdhbGsgdXAgbWV0YWNsYXNzIGluaGVyaXRhbmNlOiBjaGlsZCBmaXJzdCAobmVhcmVzdCB3aW5zKVxuICAgICAgICAgICAgICAgIGxldCBtYzogVE1ldGFDb21wb25lbnQgfCBudWxsID0gbWV0YTtcblxuICAgICAgICAgICAgICAgIHdoaWxlIChtYykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBtYy5kZWZQcm9wcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkZWZzID0gbWMuZGVmUHJvcHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBzcGVjIG9mIGRlZnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3BlYy5uYW1lID09PSBwcm9wTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9wZXJNZXRhLnNldChwcm9wTmFtZSwgc3BlYyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3BlYztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG1jID0gKG1jLnN1cGVyQ2xhc3MgYXMgVE1ldGFDb21wb25lbnQpID8/IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy9wZXJNZXRhLnNldChwcm9wTmFtZSwgbnVsbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIGFwcGx5UHJvcHNGcm9tU291cmNlKGNvbXA6IFRDb21wb25lbnQsIHNyYzogVW5rbm93blJlY29yZCwgbWV0YTogVE1ldGFDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IFtuYW1lLCByYXdWYWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoc3JjKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3BlYyA9IHRoaXMucmVzb2x2ZU5lYXJlc3RQcm9wU3BlYyhtZXRhLCBuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghc3BlYykgY29udGludWU7IC8vIE5vdCBhIGRlY2xhcmVkIHByb3AgLT4gaWdub3JlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2OiBzdHJpbmcgPSByYXdWYWx1ZSBhcyBzdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlOiBkYXRhLXh4eCBnaXZlcyBzdHJpbmdzOyBkYXRhLXByb3BzIGNhbiBnaXZlIGFueSBKU09OIHR5cGUuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuY29udmVydCh2LCBzcGVjLmtpbmQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvL291dFtuYW1lXSA9IHZhbHVlOyAvLyA8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY29tcC5zZXRIdG1sUHJvcChuYW1lLCB2YWx1ZSk7IC8vIGZvciBjb252ZW5pZW5jZSwgc2V0SHRtbFByb3AgY2FuIGJlIHVzZWQgYnkgdGhlIGNvbXBvbmVudCBpdHNlbGYgdG8gcmVhY3QgdG8gcHJvcCBjaGFuZ2VzLlxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcC5zZXRQcm9wKG5hbWUsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwZWMuYXBwbHkoY29tcCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgZXh0cmFjdEpzb25Qcm9wcyhlbDogRWxlbWVudCk6IFVua25vd25SZWNvcmQge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJhdyA9IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1wcm9wcycpO1xuICAgICAgICAgICAgICAgIGlmICghcmF3KSByZXR1cm4ge307XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShyYXcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gT25seSBhY2NlcHQgcGxhaW4gb2JqZWN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlZCAmJiB0eXBlb2YgcGFyc2VkID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShwYXJzZWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZWQgYXMgVW5rbm93blJlY29yZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdJbnZhbGlkIEpTT04gaW4gZGF0YS1wcm9wcycsIHJhdywgZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBleHRyYWN0RGF0YUF0dHJpYnV0ZXMoZWw6IEVsZW1lbnQpOiBVbmtub3duUmVjb3JkIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvdXQ6IFVua25vd25SZWNvcmQgPSB7fTtcblxuICAgICAgICAgICAgICAgIC8vIEl0ZXJhdGUgYWxsIGF0dHJpYnV0ZXMsIGtlZXAgb25seSBkYXRhLXh4eCAoZXhjZXB0IHJlc2VydmVkKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgYXR0ciBvZiBBcnJheS5mcm9tKGVsLmF0dHJpYnV0ZXMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhdHRyTmFtZSA9IGF0dHIubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYXR0ck5hbWUuc3RhcnRzV2l0aCgnZGF0YS0nKSkgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoUkVTRVJWRURfREFUQV9BVFRSUy5oYXMoYXR0ck5hbWUpKSBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvcE5hbWUgPSBhdHRyTmFtZS5zbGljZSgnZGF0YS0nLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTa2lwIGVtcHR5IG5hbWVzXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXByb3BOYW1lKSBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0W3Byb3BOYW1lXSA9IGF0dHIudmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG91dDtcbiAgICAgICAgfVxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAgICAgLy8gRW5nbGlzaCBjb21tZW50cyBhcyByZXF1ZXN0ZWQuXG5cbiAgICAgICAgLy8gQ2FjaGU6IHBlciBtZXRhY2xhc3MgLT4gKHByb3BOYW1lIC0+IG5lYXJlc3QgUHJvcFNwZWMgb3IgbnVsbCBpZiBub3QgZm91bmQpXG4gICAgICAgIC8vcHJpdmF0ZSByZWFkb25seSBfcHJvcFNwZWNDYWNoZSA9IG5ldyBXZWFrTWFwPFRNZXRhQ29tcG9uZW50LCBNYXA8c3RyaW5nLCBQcm9wU3BlYzxhbnk+IHwgbnVsbD4+KCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBhcnNlIEhUTUwgYXR0cmlidXRlcyArIEpTT04gYnVsayBpbnRvIGEgcGxhaW4gb2JqZWN0IG9mIHR5cGVkIHByb3BzLlxuICAgICAgICAgKiAtIFJlYWRzIEpTT04gZnJvbSBkYXRhLXByb3BzXG4gICAgICAgICAqIC0gUmVhZHMgZGF0YS14eHggYXR0cmlidXRlcyAoZXhjbHVkaW5nIHJlc2VydmVkIG9uZXMpXG4gICAgICAgICAqIC0gRm9yIGVhY2ggY2FuZGlkYXRlIHByb3AgbmFtZSwgcmVzb2x2ZXMgdGhlIG5lYXJlc3QgUHJvcFNwZWMgYnkgd2Fsa2luZyBtZXRhY2xhc3MgaW5oZXJpdGFuY2UuXG4gICAgICAgICAqIC0gQXBwbGllcyBjb252ZXJzaW9uIGJhc2VkIG9uIHNwZWMua2luZFxuICAgICAgICAgKiAtIGRhdGEteHh4IG92ZXJyaWRlcyBkYXRhLXByb3BzXG4gICAgICAgICAqL1xuICAgICAgICBwYXJzZVByb3BzRnJvbUVsZW1lbnQoY29tcDogVENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVsOiBFbGVtZW50IHwgbnVsbCA9IGNvbXAuZWxlbTtcblxuICAgICAgICAgICAgICAgIGlmICghZWwpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIC8vIDEpIEV4dHJhY3QgSlNPTiBidWxrIHByb3BzIGZyb20gZGF0YS1wcm9wc1xuICAgICAgICAgICAgICAgIGNvbnN0IGpzb25Qcm9wcyA9IHRoaXMuZXh0cmFjdEpzb25Qcm9wcyhlbCk7XG5cbiAgICAgICAgICAgICAgICAvLyAyKSBFeHRyYWN0IGRhdGEteHh4IGF0dHJpYnV0ZXMgKGV4Y2x1ZGluZyByZXNlcnZlZClcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhQXR0cnMgPSB0aGlzLmV4dHJhY3REYXRhQXR0cmlidXRlcyhlbCk7XG5cbiAgICAgICAgICAgICAgICAvLyAzKSBBcHBseSBKU09OIGZpcnN0LCB0aGVuIGRhdGEteHh4IG92ZXJyaWRlc1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwbHlQcm9wc0Zyb21Tb3VyY2UoY29tcCwganNvblByb3BzLCBjb21wLmdldE1ldGFjbGFzcygpKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGx5UHJvcHNGcm9tU291cmNlKGNvbXAsIGRhdGFBdHRycywgY29tcC5nZXRNZXRhY2xhc3MoKSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIHByb2Nlc3NFbGVtKGVsOiBFbGVtZW50LCBmb3JtOiBURm9ybSwgcGFyZW50OiBUQ29tcG9uZW50KTogVENvbXBvbmVudCB8IG51bGwge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbmFtZScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY29tcG9uZW50Jyk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBjbHMgPSBUQXBwbGljYXRpb24uVGhlQXBwbGljYXRpb24udHlwZXMuZ2V0KHR5cGUhKTtcblxuICAgICAgICAgICAgICAgIGlmICghY2xzKSByZXR1cm4gbnVsbDtcblxuICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IHBhcmVudDtcbiAgICAgICAgICAgICAgICBpZiAoY2xzICE9IFRNZXRhRm9ybS5tZXRhY2xhc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBURm9ybSBhcmUgYWxyZWFkeSBjcmVhdGVkIGJ5IHRoZSB1c2VyLlxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQgPSBjbHMuY3JlYXRlKG5hbWUhLCBmb3JtLCBwYXJlbnQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMucmVnaXN0ZXJJbnN0YW5jZShuYW1lISwgY2hpbGQpO1xuICAgICAgICAgICAgICAgIC8vIG5hbWU6IHN0cmluZywgZm9ybTogVEZvcm0sIHBhcmVudDogVENvbXBvbmVudCwgZWxlbTogSFRNTEVsZW1lbnRcbiAgICAgICAgICAgICAgICBpZiAoIWNoaWxkKSByZXR1cm4gbnVsbDtcblxuICAgICAgICAgICAgICAgIC8vY2hpbGQucGFyZW50ID0gY29tcG9uZW50O1xuXG4gICAgICAgICAgICAgICAgY2hpbGQuZWxlbSA9IGVsO1xuICAgICAgICAgICAgICAgIC8vY2hpbGQuZm9ybSA9IGZvcm07XG4gICAgICAgICAgICAgICAgLy9jaGlsZC5uYW1lID0gbmFtZSE7XG4gICAgICAgICAgICAgICAgLy9jaGlsZC5wcm9wcyA9IHt9O1xuXG4gICAgICAgICAgICAgICAgLy8gV2UgY29sbGVjdFxuICAgICAgICAgICAgICAgIHRoaXMucGFyc2VQcm9wc0Zyb21FbGVtZW50KGNoaWxkKTtcbiAgICAgICAgICAgICAgICBjaGlsZC5zeW5jRG9tRnJvbVByb3BzKCk7XG4gICAgICAgICAgICAgICAgKGNoaWxkIGFzIGFueSkub25BdHRhY2hlZFRvRG9tPy4oKTtcblxuICAgICAgICAgICAgICAgIC8vIERvbmUgaW4gdGhlIGNvbnN0cnVjdG9yIC8vcGFyZW50LmNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1heWJlSG9zdCA9IGNoaWxkIGFzIHVua25vd24gYXMgUGFydGlhbDxJUGx1Z2luSG9zdD47XG4gICAgICAgICAgICAgICAgaWYgKG1heWJlSG9zdCAmJiB0eXBlb2YgbWF5YmVIb3N0LnNldFBsdWdpblNwZWMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBsdWdpbiA9IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1wbHVnaW4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhdyA9IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1wcm9wcycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvcHMgPSByYXcgPyBKU09OLnBhcnNlKHJhdykgOiB7fTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbWF5YmVIb3N0LnNldFBsdWdpblNwZWMoeyBwbHVnaW4sIHByb3BzIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF5YmVIb3N0Lm1vdW50UGx1Z2luSWZSZWFkeSEodGhpcy5zZXJ2aWNlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL21heWJlSG9zdC5tb3VudEZyb21SZWdpc3RyeShzZXJ2aWNlcyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkLmFsbG93c0NoaWxkcmVuKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJzpzY29wZSA+IFtkYXRhLWNvbXBvbmVudF0nKS5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NFbGVtKGVsLCBmb3JtLCBjaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vaWYgKGVsID09PSByb290KSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkO1xuICAgICAgICAgICAgICAgIC8vaWYgKGVsID09PSByb290KSByZXR1cm47IC8vIE5vIG5lZWQgdG8gZ28gaGlnaGVyIGluIHRoZSBoaWVyYWNoeVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQganVzdGUgb25jZSwgd2hlbiB0aGUgZm9ybSBpcyBjcmVhdGVkXG4gICAgICAgIGJ1aWxkQ29tcG9uZW50VHJlZShmb3JtOiBURm9ybSwgcm9vdDogVENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgICAgICAgICAvLyAtLS0gRk9STSAtLS1cbiAgICAgICAgICAgICAgICAvLyBwcm92aXNvaXJlbWVudCBpZiAocm9vdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY29tcG9uZW50JykgPT09ICdURm9ybScpIHtcbiAgICAgICAgICAgICAgICAvL2NvbnN0IGVsID0gcm9vdC5lbGVtITtcblxuICAgICAgICAgICAgICAgIC8vdGhpcy5yZWdpc3Rlckluc3RhbmNlKHJvb3QubmFtZSwgZm9ybSk7XG4gICAgICAgICAgICAgICAgLy99XG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vdEVsZW0gPSByb290LmVsZW0hO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc0VsZW0ocm9vdEVsZW0sIGZvcm0sIHJvb3QpO1xuXG4gICAgICAgICAgICAgICAgLy8gLS0tIENISUxEIENPTVBPTkVOVFMgLS0tXG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICByb290RWxlbS5xdWVyeVNlbGVjdG9yQWxsKCc6c2NvcGUgPiBbZGF0YS1jb21wb25lbnRdJykuZm9yRWFjaCgoZWwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkOiBUQ29tcG9uZW50IHwgbnVsbCA9IHRoaXMucHJvY2Vzc0VsZW0oZWwsIGZvcm0sIHJvb3QpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9pZiAoZWwgPT09IHJvb3QpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZCAmJiBjaGlsZC5hbGxvd3NDaGlsZHJlbigpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJzpzY29wZSA+IFtkYXRhLWNvbXBvbmVudF0nKS5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc0VsZW0oZWwsIGZvcm0sIGNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2lmIChlbCA9PT0gcm9vdCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAqL1xuICAgICAgICB9XG59XG5cbi8qXG5leHBvcnQgdHlwZSBDb21wb25lbnRQcm9wcyA9IHtcbiAgICAgICAgb25jbGljaz86IFRIYW5kbGVyO1xuICAgICAgICBvbmNyZWF0ZT86IFRIYW5kbGVyO1xuICAgICAgICAvL2NvbG9yPzogVENvbG9yOyAvLyBvdSBUQ29sb3IsIGV0Yy5cbiAgICAgICAgbmFtZT86IHN0cmluZztcbiAgICAgICAgY29tcG9uZW50Pzogc3RyaW5nO1xufTtcbiovXG5cbi8vdHlwZSBSYXdQcm9wID0gUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcblxuZXhwb3J0IGNsYXNzIFREb2N1bWVudCBleHRlbmRzIFRPYmplY3Qge1xuICAgICAgICBzdGF0aWMgZG9jdW1lbnQ6IFREb2N1bWVudCA9IG5ldyBURG9jdW1lbnQoZG9jdW1lbnQpO1xuICAgICAgICBzdGF0aWMgYm9keSA9IGRvY3VtZW50LmJvZHk7XG4gICAgICAgIGh0bWxEb2M6IERvY3VtZW50O1xuICAgICAgICBjb25zdHJ1Y3RvcihodG1sRG9jOiBEb2N1bWVudCkge1xuICAgICAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5odG1sRG9jID0gaHRtbERvYztcbiAgICAgICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVE1ldGFEb2N1bWVudCBleHRlbmRzIFRNZXRhT2JqZWN0IHtcbiAgICAgICAgc3RhdGljIHJlYWRvbmx5IG1ldGFjbGFzczogVE1ldGFEb2N1bWVudCA9IG5ldyBUTWV0YURvY3VtZW50KFRNZXRhT2JqZWN0Lm1ldGFjbGFzcywgJ1REb2N1bWVudCcpO1xuXG4gICAgICAgIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihzdXBlckNsYXNzOiBUTWV0YU9iamVjdCwgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoc3VwZXJDbGFzcywgbmFtZSk7XG4gICAgICAgICAgICAgICAgLy8gZXQgdm91cyBjaGFuZ2V6IGp1c3RlIGxlIG5vbSA6XG4gICAgICAgIH1cbiAgICAgICAgZ2V0TWV0YWNsYXNzKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBUTWV0YURvY3VtZW50Lm1ldGFjbGFzcztcbiAgICAgICAgfVxufVxuXG4vKlxudHlwZSBDb250YWluZXJQcm9wcyA9IENvbXBvbmVudFByb3BzICYge1xuICAgICAgICAvL2NhcHRpb24/OiBzdHJpbmc7XG4gICAgICAgIC8vZW5hYmxlZD86IGJvb2xlYW47XG4gICAgICAgIC8vY29sb3I/OiBUQ29sb3I7IC8vIG91IFRDb2xvciwgZXRjLlxufTtcbiovXG5cbi8vIFRoaXMgY2xhcyBkb2VzIG5vdCBkbyBhbnl0aGluZyBleGNlcHQgb3ZlcnJpZGVzIGFsbG93c0NoaWxkcmVuKClcbmV4cG9ydCBjbGFzcyBUQ29udGFpbmVyIGV4dGVuZHMgVENvbXBvbmVudCB7XG4gICAgICAgIGdldE1ldGFjbGFzcygpOiBUTWV0YUNvbnRhaW5lciB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhQ29udGFpbmVyLm1ldGFjbGFzcztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vcHJpdmF0ZSBnZXQgY3Byb3BzKCk6IENvbnRhaW5lclByb3BzIHtcbiAgICAgICAgLy9yZXR1cm4gdGhpcy5wcm9wcyBhcyBDb250YWluZXJQcm9wcztcbiAgICAgICAgLy99XG5cbiAgICAgICAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nLCBmb3JtOiBURm9ybSB8IG51bGwsIHBhcmVudDogVENvbXBvbmVudCB8IG51bGwpIHtcbiAgICAgICAgICAgICAgICBzdXBlcihuYW1lLCBmb3JtLCBwYXJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3luY0RvbUZyb21Qcm9wcygpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlbCA9IHRoaXMuaHRtbEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgaWYgKCFlbCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgc3VwZXIuc3luY0RvbUZyb21Qcm9wcygpO1xuICAgICAgICB9XG5cbiAgICAgICAgYWxsb3dzQ2hpbGRyZW4oKTogYm9vbGVhbiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgLy90aXRpPTEyO1xufVxuXG5leHBvcnQgY2xhc3MgVE1ldGFDb250YWluZXIgZXh0ZW5kcyBUTWV0YUNvbXBvbmVudCB7XG4gICAgICAgIHN0YXRpYyByZWFkb25seSBtZXRhY2xhc3M6IFRNZXRhQ29udGFpbmVyID0gbmV3IFRNZXRhQ29udGFpbmVyKFRNZXRhQ29tcG9uZW50Lm1ldGFjbGFzcywgJ1RDb250YWluZXInKTtcblxuICAgICAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3Ioc3VwZXJDbGFzczogVE1ldGFDb21wb25lbnQsIG5hbWU6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHN1cGVyKHN1cGVyQ2xhc3MsIG5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGdldE1ldGFjbGFzcygpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFDb250YWluZXIubWV0YWNsYXNzO1xuICAgICAgICB9XG5cbiAgICAgICAgY3JlYXRlKG5hbWU6IHN0cmluZywgZm9ybTogVEZvcm0sIHBhcmVudDogVENvbXBvbmVudCk6IFRDb250YWluZXIge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVENvbnRhaW5lcihuYW1lLCBmb3JtLCBwYXJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVmUHJvcHMoKTogUHJvcFNwZWM8YW55PltdIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICAgICAgLy97IG5hbWU6ICdjYXB0aW9uJywga2luZDogJ3N0cmluZycsIGFwcGx5OiAobywgdikgPT4gKG8uY2FwdGlvbiA9IFN0cmluZyh2KSkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8veyBuYW1lOiAnZW5hYmxlZCcsIGtpbmQ6ICdib29sZWFuJywgYXBwbHk6IChvLCB2KSA9PiAoby5lbmFibGVkID0gQm9vbGVhbih2KSkgfVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgIH1cbn1cblxuLypcbnR5cGUgUGFuZWxQcm9wcyA9IENvbnRhaW5lclByb3BzICYge1xuICAgICAgICAvL2NhcHRpb24/OiBzdHJpbmc7XG4gICAgICAgIC8vZW5hYmxlZD86IGJvb2xlYW47XG4gICAgICAgIC8vY29sb3I/OiBUQ29sb3I7IC8vIG91IFRDb2xvciwgZXRjLlxufTtcbiovXG5cbi8vIFRoaXMgY2xhc3MgZG9lcyBub3QgZG8gYW55dGhpbmcgdXNlZnVsXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5leHBvcnQgY2xhc3MgVFBhbmVsIGV4dGVuZHMgVENvbnRhaW5lciB7XG4gICAgICAgIGdldE1ldGFjbGFzcygpOiBUTWV0YVBhbmVsIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFQYW5lbC5tZXRhY2xhc3M7XG4gICAgICAgIH1cblxuICAgICAgICAvL3Byb3RlY3RlZCBnZXQgcHByb3BzKCk6IFBhbmVsUHJvcHMge1xuICAgICAgICAvL3JldHVybiB0aGlzLnByb3BzIGFzIFBhbmVsUHJvcHM7XG4gICAgICAgIC8vfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgZm9ybTogVEZvcm0gfCBudWxsLCBwYXJlbnQ6IFRDb21wb25lbnQgfCBudWxsKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIobmFtZSwgZm9ybSwgcGFyZW50KTtcbiAgICAgICAgfVxuICAgICAgICBzeW5jRG9tRnJvbVByb3BzKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVsID0gdGhpcy5odG1sRWxlbWVudDtcbiAgICAgICAgICAgICAgICBpZiAoIWVsKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICBzdXBlci5zeW5jRG9tRnJvbVByb3BzKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy90b3RvID0gMTI7XG59XG5cbmV4cG9ydCBjbGFzcyBUTWV0YVBhbmVsIGV4dGVuZHMgVE1ldGFDb250YWluZXIge1xuICAgICAgICBzdGF0aWMgcmVhZG9ubHkgbWV0YWNsYXNzOiBUTWV0YVBhbmVsID0gbmV3IFRNZXRhUGFuZWwoVE1ldGFDb250YWluZXIubWV0YWNsYXNzLCAnVFBhbmVsJyk7XG5cbiAgICAgICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHN1cGVyQ2xhc3M6IFRNZXRhQ29udGFpbmVyLCBuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICBzdXBlcihzdXBlckNsYXNzLCBuYW1lKTtcbiAgICAgICAgICAgICAgICAvLyBldCB2b3VzIGNoYW5nZXoganVzdGUgbGUgbm9tIDpcbiAgICAgICAgfVxuICAgICAgICBnZXRNZXRhY2xhc3MoKTogVE1ldGFQYW5lbCB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhUGFuZWwubWV0YWNsYXNzO1xuICAgICAgICB9XG5cbiAgICAgICAgY3JlYXRlKG5hbWU6IHN0cmluZywgZm9ybTogVEZvcm0sIHBhcmVudDogVENvbXBvbmVudCk6IFRQYW5lbCB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUUGFuZWwobmFtZSwgZm9ybSwgcGFyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlZlByb3BzKCk6IFByb3BTcGVjPGFueT5bXSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8veyBuYW1lOiAnY2FwdGlvbicsIGtpbmQ6ICdzdHJpbmcnLCBhcHBseTogKG8sIHYpID0+IChvLmNhcHRpb24gPSBTdHJpbmcodikpIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3sgbmFtZTogJ2VuYWJsZWQnLCBraW5kOiAnYm9vbGVhbicsIGFwcGx5OiAobywgdikgPT4gKG8uZW5hYmxlZCA9IEJvb2xlYW4odikpIH1cbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICB9XG59XG5cbi8qXG50eXBlIEZvcm1Qcm9wcyA9IENvbnRhaW5lclByb3BzICYge1xuICAgICAgICAvL2NhcHRpb24/OiBzdHJpbmc7XG4gICAgICAgIC8vZW5hYmxlZD86IGJvb2xlYW47XG4gICAgICAgIC8vY29sb3I/OiBUQ29sb3I7IC8vIG91IFRDb2xvciwgZXRjLlxufTtcbiovXG5cbmV4cG9ydCBjbGFzcyBUTWV0YUZvcm0gZXh0ZW5kcyBUTWV0YUNvbnRhaW5lciB7XG4gICAgICAgIHN0YXRpYyByZWFkb25seSBtZXRhY2xhc3M6IFRNZXRhRm9ybSA9IG5ldyBUTWV0YUZvcm0oVE1ldGFDb250YWluZXIubWV0YWNsYXNzLCAnVEZvcm0nKTtcbiAgICAgICAgZ2V0TWV0YUNsYXNzKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBUTWV0YUZvcm0ubWV0YWNsYXNzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHN1cGVyQ2xhc3M6IFRNZXRhQ29udGFpbmVyLCBuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICBzdXBlcihzdXBlckNsYXNzLCBuYW1lKTtcbiAgICAgICAgICAgICAgICAvLyBldCB2b3VzIGNoYW5nZXoganVzdGUgbGUgbm9tIDpcbiAgICAgICAgfVxuXG4gICAgICAgIGNyZWF0ZShuYW1lOiBzdHJpbmcsIGZvcm06IFRGb3JtLCBwYXJlbnQ6IFRDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRGb3JtKG5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVmUHJvcHMoKTogUHJvcFNwZWM8YW55PltdIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICAgICAgLy97IG5hbWU6ICdjYXB0aW9uJywga2luZDogJ3N0cmluZycsIGFwcGx5OiAobywgdikgPT4gKG8uY2FwdGlvbiA9IFN0cmluZyh2KSkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8veyBuYW1lOiAnZW5hYmxlZCcsIGtpbmQ6ICdib29sZWFuJywgYXBwbHk6IChvLCB2KSA9PiAoby5lbmFibGVkID0gQm9vbGVhbih2KSkgfVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRGb3JtIGV4dGVuZHMgVENvbnRhaW5lciB7XG4gICAgICAgIGdldE1ldGFjbGFzcygpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFGb3JtLm1ldGFjbGFzcztcbiAgICAgICAgfVxuICAgICAgICBzdGF0aWMgZm9ybXMgPSBuZXcgTWFwPHN0cmluZywgVEZvcm0+KCk7XG4gICAgICAgIHByaXZhdGUgX21vdW50ZWQgPSBmYWxzZTtcbiAgICAgICAgLy8gRWFjaCBGb3JtIGhhcyBpdHMgb3duIGNvbXBvbmVudFJlZ2lzdHJ5XG4gICAgICAgIGNvbXBvbmVudFJlZ2lzdHJ5OiBUQ29tcG9uZW50UmVnaXN0cnkgPSBuZXcgVENvbXBvbmVudFJlZ2lzdHJ5KCk7XG4gICAgICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHN1cGVyKG5hbWUsIG51bGwsIG51bGwpO1xuICAgICAgICAgICAgICAgIHRoaXMuZm9ybSA9IHRoaXM7XG4gICAgICAgICAgICAgICAgVEZvcm0uZm9ybXMuc2V0KG5hbWUsIHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0IGFwcGxpY2F0aW9uKCk6IFRBcHBsaWNhdGlvbiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm9ybT8uYXBwbGljYXRpb24gPz8gVEFwcGxpY2F0aW9uLlRoZUFwcGxpY2F0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRW5nbGlzaCBjb21tZW50cyBhcyByZXF1ZXN0ZWQuXG5cbiAgICAgICAgZmluZEZvcm1Gcm9tRXZlbnRUYXJnZXQodGFyZ2V0OiBFbGVtZW50KTogVEZvcm0gfCBudWxsIHtcbiAgICAgICAgICAgICAgICAvLyAxKSBGaW5kIHRoZSBuZWFyZXN0IGVsZW1lbnQgdGhhdCBsb29rcyBsaWtlIGEgZm9ybSBjb250YWluZXJcbiAgICAgICAgICAgICAgICBjb25zdCBmb3JtRWxlbSA9IHRhcmdldC5jbG9zZXN0KCdbZGF0YS1jb21wb25lbnQ9XCJURm9ybVwiXVtkYXRhLW5hbWVdJykgYXMgRWxlbWVudCB8IG51bGw7XG4gICAgICAgICAgICAgICAgaWYgKCFmb3JtRWxlbSkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgICAgICAgICAvLyAyKSBSZXNvbHZlIHRoZSBURm9ybSBpbnN0YW5jZVxuICAgICAgICAgICAgICAgIGNvbnN0IGZvcm1OYW1lID0gZm9ybUVsZW0uZ2V0QXR0cmlidXRlKCdkYXRhLW5hbWUnKTtcbiAgICAgICAgICAgICAgICBpZiAoIWZvcm1OYW1lKSByZXR1cm4gbnVsbDtcblxuICAgICAgICAgICAgICAgIHJldHVybiBURm9ybS5mb3Jtcy5nZXQoZm9ybU5hbWUpID8/IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIF9hYzogQWJvcnRDb250cm9sbGVyIHwgbnVsbCA9IG51bGw7XG5cbiAgICAgICAgaW5zdGFsbEV2ZW50Um91dGVyKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FjPy5hYm9ydCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FjID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgc2lnbmFsIH0gPSB0aGlzLl9hYztcblxuICAgICAgICAgICAgICAgIGNvbnN0IHJvb3QgPSB0aGlzLmVsZW0gYXMgRWxlbWVudCB8IG51bGw7XG4gICAgICAgICAgICAgICAgaWYgKCFyb290KSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAvLyBzYW1lIGhhbmRsZXIgZm9yIGV2ZXJ5Ym9keVxuICAgICAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSAoZXY6IEV2ZW50KSA9PiB0aGlzLmRpc3BhdGNoRG9tRXZlbnQoZXYpO1xuXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB0eXBlIG9mIFsnY2xpY2snLCAnaW5wdXQnLCAnY2hhbmdlJywgJ2tleWRvd24nXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9vdC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGhhbmRsZXIsIHsgY2FwdHVyZTogdHJ1ZSwgc2lnbmFsIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdHlwZSBpbiB0aGlzLmdldE1ldGFjbGFzcygpLmRvbUV2ZW50cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9vdC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGhhbmRsZXIsIHsgY2FwdHVyZTogdHJ1ZSwgc2lnbmFsIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGRpc3Bvc2VFdmVudFJvdXRlcigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hYz8uYWJvcnQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hYyA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXZSByZWNlaXZlZCBhbiBET00gRXZlbnQuIERpc3BhdGNoIGl0XG4gICAgICAgIHByaXZhdGUgZGlzcGF0Y2hEb21FdmVudChldjogRXZlbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXRFbGVtID0gZXYudGFyZ2V0IGFzIEVsZW1lbnQgfCBudWxsO1xuICAgICAgICAgICAgICAgIGlmICghdGFyZ2V0RWxlbSkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgcHJvcE5hbWUgPSBgb24ke2V2LnR5cGV9YDtcblxuICAgICAgICAgICAgICAgIGxldCBlbDogRWxlbWVudCB8IG51bGwgPSB0YXJnZXRFbGVtLmNsb3Nlc3QoJ1tkYXRhLWNvbXBvbmVudF0nKTtcbiAgICAgICAgICAgICAgICBpZiAoIWVsKSByZXR1cm47XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1uYW1lJyk7XG4gICAgICAgICAgICAgICAgbGV0IGNvbXAgPSBuYW1lID8gdGhpcy5jb21wb25lbnRSZWdpc3RyeS5nZXQobmFtZSkgOiBudWxsO1xuICAgICAgICAgICAgICAgIHdoaWxlIChjb21wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gY29tcC5nZXRQcm9wPFRIYW5kbGVyPihwcm9wTmFtZSk7IC8vIDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NvbnN0IGhhbmRsZXIgPSBjb21wLmdldFByb3BlcnR5KHByb3BOYW1lKTsgLy9jb21wPy5wcm9wc1twcm9wTmFtZSBhcyBrZXlvZiB0eXBlb2YgY29tcC5wcm9wc10gYXMgVEhhbmRsZXIgfCBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhhbmRsZXIgJiYgaGFuZGxlci5zICYmIGhhbmRsZXIucyAhPSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyLmZpcmUodGhpcywgcHJvcE5hbWUsIGV2LCBjb21wKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy9lbCA9IG5leHQgPz8gZWwucGFyZW50RWxlbWVudD8uY2xvc2VzdCgnW2RhdGEtY29tcG9uZW50XScpID8/IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wID0gY29tcC5wYXJlbnQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gTm8gaGFuZGxlciBoZXJlOiB0cnkgZ29pbmcgXCJ1cFwiIHVzaW5nIHlvdXIgY29tcG9uZW50IHRyZWUgaWYgcG9zc2libGVcbiAgICAgICAgfVxuXG4gICAgICAgIHNob3coKSB7XG4gICAgICAgICAgICAgICAgLy8gTXVzdCBiZSBkb25lIGJlZm9yZSBidWlsZENvbXBvbmVudFRyZWUoKSBiZWNhdXNlIGBidWlsZENvbXBvbmVudFRyZWUoKWAgZG9lcyBub3QgZG8gYHJlc29sdmVSb290KClgIGl0c2VsZi5cbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZWxlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbGVtID0gdGhpcy5jb21wb25lbnRSZWdpc3RyeS5yZXNvbHZlUm9vdCgpOyAvLyBvdSB0aGlzLnJlc29sdmVSb290KClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9tb3VudGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbXBvbmVudFJlZ2lzdHJ5LmJ1aWxkQ29tcG9uZW50VHJlZSh0aGlzLCB0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25DcmVhdGUoKTsgLy8gTWF5YmUgY291bGQgYmUgZG9uZSBhZnRlciBpbnN0YWxsRXZlbnRSb3V0ZXIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnN0YWxsRXZlbnRSb3V0ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX21vdW50ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLm9uU2hvd24oKTtcblxuICAgICAgICAgICAgICAgIC8vIFRPRE9cbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbkNyZWF0ZSgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvblNob3duTmFtZSA9IHRoaXMuZWxlbSEuZ2V0QXR0cmlidXRlKCdkYXRhLW9uY3JlYXRlJyk7XG4gICAgICAgICAgICAgICAgaWYgKG9uU2hvd25OYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZU1pY3JvdGFzaygoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZuID0gKHRoaXMgYXMgYW55KVtvblNob3duTmFtZV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicpIGZuLmNhbGwodGhpcywgbnVsbCwgdGhpcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25TaG93bigpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvblNob3duTmFtZSA9IHRoaXMuZWxlbSEuZ2V0QXR0cmlidXRlKCdkYXRhLW9uc2hvd24nKTtcbiAgICAgICAgICAgICAgICBpZiAob25TaG93bk5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTWljcm90YXNrKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZm4gPSAodGhpcyBhcyBhbnkpW29uU2hvd25OYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJykgZm4uY2FsbCh0aGlzLCBudWxsLCB0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxufVxuXG4vKlxudHlwZSBCdXR0b25Qcm9wcyA9IENvbXBvbmVudFByb3BzICYge1xuICAgICAgICBjYXB0aW9uPzogc3RyaW5nO1xuICAgICAgICBlbmFibGVkPzogYm9vbGVhbjtcbiAgICAgICAgLy9jb2xvcj86IFRDb2xvcjsgLy8gb3UgVENvbG9yLCBldGMuXG59O1xuKi9cblxuZXhwb3J0IGNsYXNzIFRCdXR0b24gZXh0ZW5kcyBUQ29tcG9uZW50IHtcbiAgICAgICAgZ2V0TWV0YWNsYXNzKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBUTWV0YUJ1dHRvbi5tZXRhY2xhc3M7XG4gICAgICAgIH1cblxuICAgICAgICBodG1sQnV0dG9uKCk6IEhUTUxCdXR0b25FbGVtZW50IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5odG1sRWxlbWVudCEgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG4gICAgICAgIH1cblxuICAgICAgICBfY2FwdGlvbjogc3RyaW5nID0gJyc7XG4gICAgICAgIF9lbmFibGVkOiBib29sZWFuID0gdHJ1ZTtcbiAgICAgICAgLypcbiAgICAgICAgcHJvdGVjdGVkIGdldCBicHJvcHMoKTogQnV0dG9uUHJvcHMge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnByb3BzIGFzIEJ1dHRvblByb3BzO1xuICAgICAgICB9XG4gICAgICAgICAgICAgICAgKi9cblxuICAgICAgICBnZXQgY2FwdGlvbigpOiBzdHJpbmcge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9jYXB0aW9uO1xuICAgICAgICB9XG4gICAgICAgIHNldCBjYXB0aW9uKGNhcHRpb246IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NhcHRpb24gPSBjYXB0aW9uO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVsID0gdGhpcy5odG1sRWxlbWVudDtcbiAgICAgICAgICAgICAgICBpZiAoIWVsKSByZXR1cm47XG4gICAgICAgICAgICAgICAgZWwudGV4dENvbnRlbnQgPSB0aGlzLmNhcHRpb247XG4gICAgICAgIH1cblxuICAgICAgICBnZXQgZW5hYmxlZCgpOiBib29sZWFuIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZW5hYmxlZCA/PyB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHNldCBlbmFibGVkKGVuYWJsZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbmFibGVkID0gZW5hYmxlZDtcbiAgICAgICAgICAgICAgICB0aGlzLmh0bWxCdXR0b24oKS5kaXNhYmxlZCA9ICFlbmFibGVkO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nLCBmb3JtOiBURm9ybSwgcGFyZW50OiBUQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgc3VwZXIobmFtZSwgZm9ybSwgcGFyZW50KTtcbiAgICAgICAgfVxuICAgICAgICBzeW5jRG9tRnJvbVByb3BzKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVsID0gdGhpcy5odG1sRWxlbWVudDtcbiAgICAgICAgICAgICAgICBpZiAoIWVsKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICBlbC50ZXh0Q29udGVudCA9IHRoaXMuY2FwdGlvbjtcbiAgICAgICAgICAgICAgICB0aGlzLmh0bWxCdXR0b24oKS5kaXNhYmxlZCA9ICF0aGlzLmVuYWJsZWQ7XG4gICAgICAgICAgICAgICAgc3VwZXIuc3luY0RvbUZyb21Qcm9wcygpO1xuICAgICAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUTWV0YUJ1dHRvbjxUIGV4dGVuZHMgVEJ1dHRvbj4gZXh0ZW5kcyBUTWV0YUNvbXBvbmVudCB7XG4gICAgICAgIHN0YXRpYyByZWFkb25seSBtZXRhY2xhc3MgPSBuZXcgVE1ldGFCdXR0b24oVE1ldGFDb21wb25lbnQubWV0YWNsYXNzLCAnVEJ1dHRvbicpO1xuXG4gICAgICAgIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihzdXBlckNsYXNzOiBUTWV0YUNvbXBvbmVudCwgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoc3VwZXJDbGFzcywgbmFtZSk7XG4gICAgICAgICAgICAgICAgLy8gZXQgdm91cyBjaGFuZ2V6IGp1c3RlIGxlIG5vbSA6XG4gICAgICAgIH1cbiAgICAgICAgZ2V0TWV0YWNsYXNzKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBUTWV0YUJ1dHRvbi5tZXRhY2xhc3M7XG4gICAgICAgIH1cblxuICAgICAgICBjcmVhdGUobmFtZTogc3RyaW5nLCBmb3JtOiBURm9ybSwgcGFyZW50OiBUQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUQnV0dG9uKG5hbWUsIGZvcm0sIHBhcmVudCkgYXMgVDtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlZlByb3BzKCk6IFByb3BTcGVjPGFueT5bXSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2NhcHRpb24nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBraW5kOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0cmlldmU6IChvKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG8uY2FwdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwbHk6IChvLCB2KSA9PiAoby5jYXB0aW9uID0gU3RyaW5nKHYpKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2VuYWJsZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBraW5kOiAnYm9vbGVhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHJpZXZlOiAobykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvLmVuYWJsZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGx5OiAobywgdikgPT4gKG8uZW5hYmxlZCA9IEJvb2xlYW4odikpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVE1ldGFBcHBsaWNhdGlvbiBleHRlbmRzIFRNZXRhY2xhc3Mge1xuICAgICAgICBzdGF0aWMgcmVhZG9ubHkgbWV0YWNsYXNzOiBUTWV0YUFwcGxpY2F0aW9uID0gbmV3IFRNZXRhQXBwbGljYXRpb24oVE1ldGFjbGFzcy5tZXRhY2xhc3MsICdUQXBwbGljYXRpb24nKTtcblxuICAgICAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3Ioc3VwZXJDbGFzczogVE1ldGFjbGFzcywgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoc3VwZXJDbGFzcywgbmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0TWV0YWNsYXNzKCk6IFRNZXRhQXBwbGljYXRpb24ge1xuICAgICAgICAgICAgICAgIHJldHVybiBUTWV0YUFwcGxpY2F0aW9uLm1ldGFjbGFzcztcbiAgICAgICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVEFwcGxpY2F0aW9uIHtcbiAgICAgICAgZ2V0TWV0YWNsYXNzKCk6IFRNZXRhQXBwbGljYXRpb24ge1xuICAgICAgICAgICAgICAgIHJldHVybiBUTWV0YUFwcGxpY2F0aW9uLm1ldGFjbGFzcztcbiAgICAgICAgfVxuICAgICAgICBzdGF0aWMgVGhlQXBwbGljYXRpb246IFRBcHBsaWNhdGlvbjtcbiAgICAgICAgLy9zdGF0aWMgcGx1Z2luUmVnaXN0cnkgPSBuZXcgUGx1Z2luUmVnaXN0cnkoKTtcbiAgICAgICAgLy9wbHVnaW5zOiBJUGx1Z2luUmVnaXN0cnk7XG4gICAgICAgIHByaXZhdGUgZm9ybXM6IFRGb3JtW10gPSBbXTtcbiAgICAgICAgcmVhZG9ubHkgdHlwZXMgPSBuZXcgVENvbXBvbmVudFR5cGVSZWdpc3RyeSgpO1xuICAgICAgICBtYWluRm9ybTogVEZvcm0gfCBudWxsID0gbnVsbDtcblxuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgICAgICBUQXBwbGljYXRpb24uVGhlQXBwbGljYXRpb24gPSB0aGlzO1xuICAgICAgICAgICAgICAgIHJlZ2lzdGVyQnVpbHRpbnModGhpcy50eXBlcyk7XG4gICAgICAgIH1cblxuICAgICAgICBjcmVhdGVGb3JtPFQgZXh0ZW5kcyBURm9ybT4oY3RvcjogbmV3ICguLi5hcmdzOiBhbnlbXSkgPT4gVCwgbmFtZTogc3RyaW5nKTogVCB7XG4gICAgICAgICAgICAgICAgY29uc3QgZiA9IG5ldyBjdG9yKG5hbWUpO1xuICAgICAgICAgICAgICAgIHRoaXMuZm9ybXMucHVzaChmKTtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubWFpbkZvcm0pIHRoaXMubWFpbkZvcm0gPSBmO1xuICAgICAgICAgICAgICAgIHJldHVybiBmO1xuICAgICAgICB9XG5cbiAgICAgICAgcnVuKCkge1xuICAgICAgICAgICAgICAgIHRoaXMucnVuV2hlbkRvbVJlYWR5KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm1haW5Gb3JtKSB0aGlzLm1haW5Gb3JtLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgdGhpcy5hdXRvU3RhcnQoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBhdXRvU3RhcnQoKSB7XG4gICAgICAgICAgICAgICAgLy8gZmFsbGJhY2s6IGNob2lzaXIgdW5lIGZvcm0gZW5yZWdpc3RyXHUwMEU5ZSwgb3UgY3JcdTAwRTllciB1bmUgZm9ybSBpbXBsaWNpdGVcbiAgICAgICAgfVxuXG4gICAgICAgIHJ1bldoZW5Eb21SZWFkeShmbjogKCkgPT4gdm9pZCkge1xuICAgICAgICAgICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnbG9hZGluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZm4sIHsgb25jZTogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IFBMVUdJTkhPU1QgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgY2xhc3MgVE1ldGFQbHVnaW5Ib3N0IGV4dGVuZHMgVE1ldGFDb21wb25lbnQge1xuICAgICAgICBzdGF0aWMgbWV0YWNsYXNzID0gbmV3IFRNZXRhUGx1Z2luSG9zdChUTWV0YUNvbXBvbmVudC5tZXRhY2xhc3MsICdUUGx1Z2luSG9zdCcpO1xuICAgICAgICBnZXRNZXRhY2xhc3MoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhUGx1Z2luSG9zdC5tZXRhY2xhc3M7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3Ioc3VwZXJDbGFzczogVE1ldGFjbGFzcywgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoc3VwZXJDbGFzcywgbmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICBjcmVhdGUobmFtZTogc3RyaW5nLCBmb3JtOiBURm9ybSwgcGFyZW50OiBUQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUUGx1Z2luSG9zdChuYW1lLCBmb3JtLCBwYXJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvcHMoKTogUHJvcFNwZWM8VFBsdWdpbkhvc3Q+W10ge1xuICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVFBsdWdpbkhvc3QgZXh0ZW5kcyBUQ29tcG9uZW50IHtcbiAgICAgICAgcHJpdmF0ZSBpbnN0YW5jZTogVUlQbHVnaW5JbnN0YW5jZSB8IG51bGwgPSBudWxsO1xuXG4gICAgICAgIHBsdWdpbk5hbWU6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICAgICAgICBwbHVnaW5Qcm9wczogSnNvbiA9IHt9O1xuICAgICAgICBwcml2YXRlIGZhY3Rvcnk6IFVJUGx1Z2luRmFjdG9yeSB8IG51bGwgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgZm9ybTogVEZvcm0sIHBhcmVudDogVENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHN1cGVyKG5hbWUsIGZvcm0sIHBhcmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYWxsZWQgYnkgdGhlIG1ldGFjbGFzcyAob3IgYnkgeW91ciByZWdpc3RyeSkgcmlnaHQgYWZ0ZXIgY3JlYXRpb25cbiAgICAgICAgc2V0UGx1Z2luRmFjdG9yeShmYWN0b3J5OiBVSVBsdWdpbkZhY3RvcnkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZhY3RvcnkgPSBmYWN0b3J5O1xuICAgICAgICB9XG5cbiAgICAgICAgbW91bnRQbHVnaW4ocHJvcHM6IEpzb24sIHNlcnZpY2VzOiBEZWxwaGluZVNlcnZpY2VzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29udGFpbmVyID0gdGhpcy5odG1sRWxlbWVudDtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbnRhaW5lcikgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmZhY3RvcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZpY2VzLmxvZy53YXJuKCdUUGx1Z2luSG9zdDogbm8gcGx1Z2luIGZhY3Rvcnkgc2V0JywgeyBob3N0OiB0aGlzLm5hbWUgYXMgYW55IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIERpc3Bvc2Ugb2xkIGluc3RhbmNlIGlmIGFueVxuICAgICAgICAgICAgICAgIHRoaXMudW5tb3VudCgpO1xuXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIHBsdWdpbiBpbnN0YW5jZSB0aGVuIG1vdW50XG4gICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZSA9IHRoaXMuZmFjdG9yeSh7IGhvc3Q6IHRoaXMsIGZvcm06IHRoaXMuZm9ybSEgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZSEubW91bnQoY29udGFpbmVyLCBwcm9wcywgc2VydmljZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FsbGVkIGJ5IGJ1aWxkQ29tcG9uZW50VHJlZSgpXG4gICAgICAgIHNldFBsdWdpblNwZWMoc3BlYzogeyBwbHVnaW46IHN0cmluZyB8IG51bGw7IHByb3BzOiBhbnkgfSkge1xuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luTmFtZSA9IHNwZWMucGx1Z2luO1xuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luUHJvcHMgPSBzcGVjLnByb3BzID8/IHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FsbGVkIGJ5IGJ1aWxkQ29tcG9uZW50VHJlZSgpXG4gICAgICAgIG1vdW50UGx1Z2luSWZSZWFkeShzZXJ2aWNlczogRGVscGhpbmVTZXJ2aWNlcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRhaW5lciA9IHRoaXMuaHRtbEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgaWYgKCFjb250YWluZXIgfHwgIXRoaXMuZm9ybSB8fCAhdGhpcy5wbHVnaW5OYW1lKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICBjb25zdCBhcHAgPSBUQXBwbGljYXRpb24uVGhlQXBwbGljYXRpb247IC8vIG91IHVuIGFjY1x1MDBFOHMgXHUwMEU5cXVpdmFsZW50XG4gICAgICAgICAgICAgICAgY29uc3QgZGVmID0gUGx1Z2luUmVnaXN0cnkucGx1Z2luUmVnaXN0cnkuZ2V0KHRoaXMucGx1Z2luTmFtZSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWRlZikge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VydmljZXMubG9nLndhcm4oJ1Vua25vd24gcGx1Z2luJywgeyBwbHVnaW46IHRoaXMucGx1Z2luTmFtZSBhcyBhbnkgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy51bm1vdW50KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZSA9IGRlZi5mYWN0b3J5KHsgaG9zdDogdGhpcywgZm9ybTogdGhpcy5mb3JtIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFuY2UhLm1vdW50KGNvbnRhaW5lciwgdGhpcy5wbHVnaW5Qcm9wcywgc2VydmljZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdXBkYXRlKHByb3BzOiBhbnkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpblByb3BzID0gcHJvcHM7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZT8udXBkYXRlKHByb3BzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHVubW91bnQoKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFuY2U/LnVubW91bnQoKTtcbiAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG59XG5cbmV4cG9ydCB0eXBlIFVJUGx1Z2luRmFjdG9yeTxQcm9wcyBleHRlbmRzIEpzb24gPSBKc29uPiA9IChhcmdzOiB7IGhvc3Q6IFRQbHVnaW5Ib3N0OyBmb3JtOiBURm9ybSB9KSA9PiBVSVBsdWdpbkluc3RhbmNlPFByb3BzPjtcblxuZXhwb3J0IGludGVyZmFjZSBTaXplSGludHMge1xuICAgICAgICBtaW5XaWR0aD86IG51bWJlcjtcbiAgICAgICAgbWluSGVpZ2h0PzogbnVtYmVyO1xuICAgICAgICBwcmVmZXJyZWRXaWR0aD86IG51bWJlcjtcbiAgICAgICAgcHJlZmVycmVkSGVpZ2h0PzogbnVtYmVyO1xufVxuXG5leHBvcnQgdHlwZSBVSVBsdWdpbkRlZiA9IHtcbiAgICAgICAgZmFjdG9yeTogVUlQbHVnaW5GYWN0b3J5O1xuICAgICAgICAvLyBvcHRpb25uZWwgOiB1biBzY2hcdTAwRTltYSBkZSBwcm9wcywgYWlkZSBhdSBkZXNpZ25lclxuICAgICAgICAvLyBwcm9wcz86IFByb3BTY2hlbWE7XG59O1xuXG5leHBvcnQgY2xhc3MgUGx1Z2luUmVnaXN0cnkge1xuICAgICAgICBzdGF0aWMgcGx1Z2luUmVnaXN0cnkgPSBuZXcgUGx1Z2luUmVnaXN0cnkoKTtcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSBwbHVnaW5zID0gbmV3IE1hcDxzdHJpbmcsIFVJUGx1Z2luRGVmPigpO1xuXG4gICAgICAgIHJlZ2lzdGVyKG5hbWU6IHN0cmluZywgZGVmOiBVSVBsdWdpbkRlZikge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBsdWdpbnMuaGFzKG5hbWUpKSB0aHJvdyBuZXcgRXJyb3IoYFBsdWdpbiBhbHJlYWR5IHJlZ2lzdGVyZWQ6ICR7bmFtZX1gKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbnMuc2V0KG5hbWUsIGRlZik7XG4gICAgICAgIH1cblxuICAgICAgICBnZXQobmFtZTogc3RyaW5nKTogVUlQbHVnaW5EZWYgfCB1bmRlZmluZWQge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBsdWdpbnMuZ2V0KG5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaGFzKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBsdWdpbnMuaGFzKG5hbWUpO1xuICAgICAgICB9XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gRENDID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLy8gRENDID0gRGVscGhpbmUgQ3VzdG9tIENvbXBvbmVudFxuXG4vKlxudHlwZSBTaW1wbGVEQ0NQcm9wcyA9IENvbXBvbmVudFByb3BzICYge1xuICAgICAgICAvL2NhcHRpb24/OiBzdHJpbmc7XG4gICAgICAgIC8vZW5hYmxlZD86IGJvb2xlYW47XG4gICAgICAgIC8vY29sb3I/OiBUQ29sb3I7IC8vIG91IFRDb2xvciwgZXRjLlxufTtcbiovXG5cbi8vIE5vdGU6IHRoaXMgY2xhc3MgZG9lcyBub3QgZG8gYW55dGhpbmcuIFBlcmhhcHMgdGhhdCBEQ0MgY2FuIGhlcml0IGRpcmVjdGx5IGZyb20gVENvbXBvbmVudFxuXG5leHBvcnQgY2xhc3MgVFNpbXBsZURDQyBleHRlbmRzIFRDb21wb25lbnQge1xuICAgICAgICBnZXRNZXRhY2xhc3MoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhU2ltcGxlRENDLm1ldGFjbGFzcztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgZm9ybTogVEZvcm0sIHBhcmVudDogVENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHN1cGVyKG5hbWUsIGZvcm0sIHBhcmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKlxuICAgICAgICBwcm90ZWN0ZWQgZ2V0IGRjY3Byb3BzKCk6IFNpbXBsZURDQ1Byb3BzIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9wcyBhcyBTaW1wbGVEQ0NQcm9wcztcbiAgICAgICAgfVxuICAgICAgICAgICAgICAgICovXG59XG5cbmV4cG9ydCBjbGFzcyBUTWV0YVNpbXBsZURDQyBleHRlbmRzIFRNZXRhQ29tcG9uZW50IHtcbiAgICAgICAgc3RhdGljIHJlYWRvbmx5IG1ldGFjbGFzczogVE1ldGFTaW1wbGVEQ0MgPSBuZXcgVE1ldGFTaW1wbGVEQ0MoVE1ldGFDb21wb25lbnQubWV0YWNsYXNzLCAnVFNpbXBsZURDQycpO1xuXG4gICAgICAgIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihzdXBlckNsYXNzOiBUTWV0YUNvbXBvbmVudCwgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoc3VwZXJDbGFzcywgbmFtZSk7XG4gICAgICAgICAgICAgICAgLy8gZXQgdm91cyBjaGFuZ2V6IGp1c3RlIGxlIG5vbSA6XG4gICAgICAgIH1cbiAgICAgICAgZ2V0TWV0YWNsYXNzKCk6IFRNZXRhU2ltcGxlRENDIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFTaW1wbGVEQ0MubWV0YWNsYXNzO1xuICAgICAgICB9XG5cbiAgICAgICAgY3JlYXRlKG5hbWU6IHN0cmluZywgZm9ybTogVEZvcm0sIHBhcmVudDogVENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVFNpbXBsZURDQyhuYW1lLCBmb3JtLCBwYXJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVmUHJvcHMoKTogUHJvcFNwZWM8YW55PltdIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICAgICAgLy97IG5hbWU6ICdjYXB0aW9uJywga2luZDogJ3N0cmluZycsIGFwcGx5OiAobywgdikgPT4gKG8uY2FwdGlvbiA9IFN0cmluZyh2KSkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8veyBuYW1lOiAnZW5hYmxlZCcsIGtpbmQ6ICdib29sZWFuJywgYXBwbHk6IChvLCB2KSA9PiAoby5lbmFibGVkID0gQm9vbGVhbih2KSkgfVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgIH1cbn1cblxuLypcbmV4cG9ydCB0eXBlIENvbXBvc2l0ZURDQ1Byb3BzID0gQ29tcG9uZW50UHJvcHMgJiB7XG4gICAgICAgIC8vY2FwdGlvbj86IHN0cmluZztcbiAgICAgICAgLy9lbmFibGVkPzogYm9vbGVhbjtcbiAgICAgICAgLy9jb2xvcj86IFRDb2xvcjsgLy8gb3UgVENvbG9yLCBldGMuXG59O1xuKi9cblxuLy8gTm90ZTogdGhpcyBjbGFzcyBkb2VzIG5vdCBkbyBhbnl0aGluZy4gUGVyaGFwcyB0aGF0IERDQyBjYW4gaGVyaXQgZGlyZWN0bHkgZnJvbSBUQ29udGFpbmVyIG9yIFRQYW5lbFxuLy8gVENvbnRhaW5lciBvciBUUGFuZWwgPyBBY3R1YWxseSB0aGlzIGlzIG5vdCBjbGVhci4gVGhvc2UgdHdvIGNsYXNzIGRvIG5vdCBkbyBhbnl0aGluZyB1c2VmdWwgYWJvZiBUQ29tcG9uZW50XG5leHBvcnQgY2xhc3MgVENvbXBvc2l0ZURDQyBleHRlbmRzIFRDb250YWluZXIge1xuICAgICAgICBnZXRNZXRhY2xhc3MoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhQ29tcG9zaXRlRENDLm1ldGFjbGFzcztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgZm9ybTogVEZvcm0sIHBhcmVudDogVENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHN1cGVyKG5hbWUsIGZvcm0sIHBhcmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgLypcbiAgICAgICAgcHJvdGVjdGVkIGdldCBkY2Nwcm9wcygpOiBDb21wb3NpdGVEQ0NQcm9wcyB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMgYXMgQ29tcG9zaXRlRENDUHJvcHM7XG4gICAgICAgIH1cbiAgICAgICAgICAgICAgICAqL1xufVxuXG5leHBvcnQgY2xhc3MgVE1ldGFDb21wb3NpdGVEQ0MgZXh0ZW5kcyBUTWV0YUNvbnRhaW5lciB7XG4gICAgICAgIHN0YXRpYyByZWFkb25seSBtZXRhY2xhc3M6IFRNZXRhQ29tcG9zaXRlRENDID0gbmV3IFRNZXRhQ29tcG9zaXRlRENDKFRNZXRhQ29udGFpbmVyLm1ldGFjbGFzcywgJ1RDb21wb3NpdERDQycpO1xuXG4gICAgICAgIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihzdXBlckNsYXNzOiBUTWV0YUNvbnRhaW5lciwgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoc3VwZXJDbGFzcywgbmFtZSk7XG4gICAgICAgICAgICAgICAgLy8gZXQgdm91cyBjaGFuZ2V6IGp1c3RlIGxlIG5vbSA6XG4gICAgICAgIH1cbiAgICAgICAgZ2V0TWV0YWNsYXNzKCk6IFRNZXRhQ29tcG9zaXRlRENDIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFDb21wb3NpdGVEQ0MubWV0YWNsYXNzO1xuICAgICAgICB9XG5cbiAgICAgICAgY3JlYXRlKG5hbWU6IHN0cmluZywgZm9ybTogVEZvcm0sIHBhcmVudDogVENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVENvbXBvc2l0ZURDQyhuYW1lLCBmb3JtLCBwYXJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVmUHJvcHMoKTogUHJvcFNwZWM8YW55PltdIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICAgICAgLy97IG5hbWU6ICdjYXB0aW9uJywga2luZDogJ3N0cmluZycsIGFwcGx5OiAobywgdikgPT4gKG8uY2FwdGlvbiA9IFN0cmluZyh2KSkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8veyBuYW1lOiAnZW5hYmxlZCcsIGtpbmQ6ICdib29sZWFuJywgYXBwbHk6IChvLCB2KSA9PiAoby5lbmFibGVkID0gQm9vbGVhbih2KSkgfVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIiwgImV4cG9ydCBjbGFzcyBNZXRhUm9vdCB7XG4gICAgICAgIHN0YXRpYyByZWFkb25seSBtZXRhY2xhc3M6IE1ldGFSb290ID0gbmV3IE1ldGFSb290KG51bGwpO1xuXG4gICAgICAgIHJlYWRvbmx5IHN1cGVyQ2xhc3M6IE1ldGFSb290IHwgbnVsbDtcbiAgICAgICAgcmVhZG9ubHkgdHlwZU5hbWU6IHN0cmluZztcblxuICAgICAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3Ioc3VwZXJDbGFzczogTWV0YVJvb3QgfCBudWxsLCB0eXBlTmFtZSA9ICdUTWV0YVJvb3QnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdXBlckNsYXNzID0gc3VwZXJDbGFzcztcbiAgICAgICAgICAgICAgICB0aGlzLnR5cGVOYW1lID0gdHlwZU5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0TWV0YWNsYXNzKCk6IE1ldGFSb290IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWV0YVJvb3QubWV0YWNsYXNzO1xuICAgICAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBNZXRhVGVzdEEgZXh0ZW5kcyBNZXRhUm9vdCB7XG4gICAgICAgIHN0YXRpYyByZWFkb25seSBtZXRhY2xhc3M6IE1ldGFUZXN0QSA9IG5ldyBNZXRhVGVzdEEoTWV0YVJvb3QubWV0YWNsYXNzKTtcblxuICAgICAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3Ioc3VwZXJDbGFzczogTWV0YVJvb3QpIHtcbiAgICAgICAgICAgICAgICBzdXBlcihzdXBlckNsYXNzLCAnVGVzdEEnKTtcbiAgICAgICAgfVxuICAgICAgICBnZXRNZXRhY2xhc3MoKTogTWV0YVRlc3RBIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWV0YVRlc3RBLm1ldGFjbGFzcztcbiAgICAgICAgfVxufVxuXG5leHBvcnQgY2xhc3MgTWV0YVRlc3RCIGV4dGVuZHMgTWV0YVRlc3RBIHtcbiAgICAgICAgc3RhdGljIHJlYWRvbmx5IG1ldGFjbGFzczogTWV0YVRlc3RCID0gbmV3IE1ldGFUZXN0QihNZXRhVGVzdEEubWV0YWNsYXNzKTtcblxuICAgICAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3Ioc3VwZXJDbGFzczogTWV0YVRlc3RBKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoc3VwZXJDbGFzcyk7XG4gICAgICAgICAgICAgICAgLy8gZXQgdm91cyBjaGFuZ2V6IGp1c3RlIGxlIG5vbSA6XG4gICAgICAgICAgICAgICAgKHRoaXMgYXMgYW55KS50eXBlTmFtZSA9ICdUZXN0Qic7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0TWV0YWNsYXNzKCk6IE1ldGFUZXN0QiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1ldGFUZXN0Qi5tZXRhY2xhc3M7XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1ldGFUZXN0QyBleHRlbmRzIE1ldGFUZXN0QiB7XG4gICAgICAgIHN0YXRpYyByZWFkb25seSBtZXRhY2xhc3M6IE1ldGFUZXN0QyA9IG5ldyBNZXRhVGVzdEMoTWV0YVRlc3RCLm1ldGFjbGFzcyk7XG5cbiAgICAgICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHN1cGVyQ2xhc3M6IE1ldGFUZXN0Qikge1xuICAgICAgICAgICAgICAgIHN1cGVyKHN1cGVyQ2xhc3MpO1xuICAgICAgICAgICAgICAgICh0aGlzIGFzIGFueSkudHlwZU5hbWUgPSAnVGVzdEMnO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0TWV0YWNsYXNzKCk6IE1ldGFUZXN0QyB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1ldGFUZXN0Qy5tZXRhY2xhc3M7XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRlc3QoKSB7XG4gICAgICAgIGxldCBjOiBNZXRhUm9vdCB8IG51bGwgPSBNZXRhVGVzdEMubWV0YWNsYXNzO1xuICAgICAgICB3aGlsZSAoYykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2MuZ2V0TWV0YWNsYXNzKCkudHlwZU5hbWV9IC0gJHtjLnR5cGVOYW1lfSAtPiAke2Muc3VwZXJDbGFzcz8udHlwZU5hbWV9YCk7XG4gICAgICAgICAgICAgICAgYyA9IGMuc3VwZXJDbGFzcztcbiAgICAgICAgfVxufVxuIiwgIi8vLyA8cmVmZXJlbmNlIGxpYj1cImRvbVwiIC8+XG5jb25zb2xlLmxvZygnSSBBTSBaQVpBJyk7XG4vL2ltcG9ydCB7IGluc3RhbGxEZWxwaGluZVJ1bnRpbWUgfSBmcm9tIFwiLi9zcmMvZHJ0XCI7IC8vIDwtLSBUUywgcGFzIC5qc1xuaW1wb3J0IHsgVEZvcm0sIFRDb2xvciwgVEFwcGxpY2F0aW9uLCBUQ29tcG9uZW50LCBUQnV0dG9uIH0gZnJvbSAnQHZjbCc7XG5pbXBvcnQgeyB0ZXN0IH0gZnJvbSAnLi90ZXN0JztcblxuLy9pbXBvcnQgeyBDb21wb25lbnRUeXBlUmVnaXN0cnkgfSBmcm9tICdAdmNsL1N0ZEN0cmxzJztcbi8vaW1wb3J0IHsgQ29tcG9uZW50UmVnaXN0cnkgfSBmcm9tICdAZHJ0L0NvbXBvbmVudFJlZ2lzdHJ5Jztcbi8vaW1wb3J0IHsgVFBsdWdpbkhvc3QgfSBmcm9tICdAZHJ0L1VJUGx1Z2luJztcbi8qXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJQbHVnaW5UeXBlcyhyZWc6IENvbXBvbmVudFR5cGVSZWdpc3RyeSk6IHZvaWQge1xuICAgICAgICAvICpcbiAgICAgICAgLy8gRXhhbXBsZTogYW55IHR5cGUgbmFtZSBjYW4gYmUgcHJvdmlkZWQgYnkgYSBwbHVnaW4uXG4gICAgICAgIHJlZy5yZWdpc3Rlci5yZWdpc3RlclR5cGUoJ2NoYXJ0anMtcGllJywgKG5hbWU6IHN0cmluZywgZm9ybTogVEZvcm0sIHBhcmVudDogVENvbXBvbmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUGx1Z2luSG9zdChuYW1lLCBmb3JtLCBwYXJlbnQpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZWcucmVnaXN0ZXJUeXBlKCd2dWUtaGVsbG8nLCAobmFtZTogc3RyaW5nLCBmb3JtOiBURm9ybSwgcGFyZW50OiBUQ29tcG9uZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQbHVnaW5Ib3N0KG5hbWUsIGZvcm0sIHBhcmVudCk7XG4gICAgICAgIH0pO1xuICAgICAgICAqIC9cbn1cbiovXG5jb25zb2xlLmxvZygnSSBBTSBaQVpBJyk7XG5cbmNsYXNzIFphemEgZXh0ZW5kcyBURm9ybSB7XG4gICAgICAgIC8vIEZvcm0gY29tcG9uZW50cyAtIFRoaXMgbGlzdCBpcyBhdXRvIGdlbmVyYXRlZCBieSBEZWxwaGluZVxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgLy9idXR0b24xIDogVEJ1dHRvbiA9IG5ldyBUQnV0dG9uKFwiYnV0dG9uMVwiLCB0aGlzLCB0aGlzKTtcbiAgICAgICAgLy9idXR0b24yIDogVEJ1dHRvbiA9IG5ldyBUQnV0dG9uKFwiYnV0dG9uMlwiLCB0aGlzLCB0aGlzKTtcbiAgICAgICAgLy9idXR0b24zIDogVEJ1dHRvbiA9IG5ldyBUQnV0dG9uKFwiYnV0dG9uM1wiLCB0aGlzLCB0aGlzKTtcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAgICAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIobmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgLy9pbXBvcnQgeyBpbnN0YWxsRGVscGhpbmVSdW50aW1lIH0gZnJvbSBcIi4vZHJ0XCI7XG5cbiAgICAgICAgLypcbmNvbnN0IHJ1bnRpbWUgPSB7ICAgXG4gIGhhbmRsZUNsaWNrKHsgZWxlbWVudCB9OiB7IGVsZW1lbnQ6IEVsZW1lbnQgfSkge1xuICAgIGNvbnNvbGUubG9nKFwiY2xpY2tlZCFcIiwgZWxlbWVudCk7XG4gICAgLy8oZWxlbWVudCBhcyBIVE1MRWxlbWVudCkuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJyZWRcIjtcbiAgfSxcbn07IFxuKi9cblxuICAgICAgICBwcm90ZWN0ZWQgb25NeUNyZWF0ZShfZXY6IEV2ZW50IHwgbnVsbCwgX3NlbmRlcjogVENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ0biA9IHRoaXMuY29tcG9uZW50UmVnaXN0cnkuZ2V0KCdidXR0b24yJyk7XG4gICAgICAgICAgICAgICAgaWYgKGJ0bikgYnRuLmNvbG9yID0gVENvbG9yLnJnYigwLCAwLCAyNTUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTXlTaG93bihfZXY6IEV2ZW50IHwgbnVsbCwgX3NlbmRlcjogVENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ0biA9IHRoaXMuY29tcG9uZW50UmVnaXN0cnkuZ2V0KCdidXR0b24zJyk7XG4gICAgICAgICAgICAgICAgaWYgKGJ0bikgYnRuLmNvbG9yID0gVENvbG9yLnJnYigwLCAyNTUsIDI1NSk7XG4gICAgICAgIH1cblxuICAgICAgICBidXR0b24xX29uY2xpY2soX2V2OiBFdmVudCB8IG51bGwsIF9zZW5kZXI6IFRDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBidG4gPSB0aGlzLmNvbXBvbmVudFJlZ2lzdHJ5LmdldDxUQnV0dG9uPignYnV0dG9uMScpO1xuICAgICAgICAgICAgICAgIGlmICghYnRuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ2J1dHRvbjEgbm90IGZvdW5kIGluIHJlZ2lzdHJ5Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vYnRuLmNvbG9yID0gVENvbG9yLnJnYigwLCAwLCAyNTUpO1xuICAgICAgICAgICAgICAgIGJ0biEuY29sb3IgPSBUQ29sb3IucmdiKDI1NSwgMCwgMCk7XG4gICAgICAgICAgICAgICAgYnRuIS5jYXB0aW9uID0gJ01JTUknO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCdXR0b24xIGNsaWNrZWQhISEhJyk7XG4gICAgICAgIH1cblxuICAgICAgICB6YXphX29uY2xpY2soX2V2OiBFdmVudCB8IG51bGwsIF9zZW5kZXI6IFRDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBidG4gPSB0aGlzLmNvbXBvbmVudFJlZ2lzdHJ5LmdldDxUQnV0dG9uPignYnV0dG9ueCcpO1xuICAgICAgICAgICAgICAgIGJ0biEuY29sb3IgPSBUQ29sb3IucmdiKDAsIDI1NSwgMCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3phemEgY2xpY2tlZCEhISEnKTtcbiAgICAgICAgICAgICAgICAvL2J0biEuZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9pbnN0YWxsRGVscGhpbmVSdW50aW1lKHJ1bnRpbWUpO1xufSAvLyBjbGFzcyB6YXphXG5cbmNsYXNzIE15QXBwbGljYXRpb24gZXh0ZW5kcyBUQXBwbGljYXRpb24ge1xuICAgICAgICB6YXphOiBaYXphO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy56YXphID0gbmV3IFphemEoJ3phemEnKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1haW5Gb3JtID0gdGhpcy56YXphO1xuICAgICAgICB9XG5cbiAgICAgICAgcnVuKCkge1xuICAgICAgICAgICAgICAgIC8vdGhpcy56YXphLmNvbXBvbmVudFJlZ2lzdHJ5LmJ1aWxkQ29tcG9uZW50VHJlZSh0aGlzLnphemEpO1xuICAgICAgICAgICAgICAgIC8vdGhpcy56YXphLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyk7XG5cbiAgICAgICAgICAgICAgICAvLyBhdSBsYW5jZW1lbnRcbiAgICAgICAgICAgICAgICB0aGlzLnJ1bldoZW5Eb21SZWFkeSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnphemEuc2hvdygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG59IC8vIGNsYXNzIE15QXBwbGljYXRpb25cblxuY29uc3QgbXlBcHBsaWNhdGlvbjogTXlBcHBsaWNhdGlvbiA9IG5ldyBNeUFwcGxpY2F0aW9uKCk7XG50ZXN0KCk7XG5teUFwcGxpY2F0aW9uLnJ1bigpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7QUFFTyxTQUFTLGlCQUFpQixPQUErQjtBQUN4RCxRQUFNLFNBQVMsWUFBWSxTQUFTO0FBQ3BDLFFBQU0sU0FBUyxnQkFBZ0IsU0FBUztBQUN4QyxRQUFNLFNBQVMsVUFBVSxTQUFTO0FBQ2xDLFFBQU0sU0FBUyxXQUFXLFNBQVM7QUFHM0M7OztBQ0FPLElBQU0sU0FBTixNQUFNLFFBQU87QUFBQSxFQUdaLFlBQVksR0FBVztBQUZ2QjtBQUdRLFNBQUssSUFBSTtBQUFBLEVBQ2pCO0FBQUE7QUFBQSxFQUNjLE9BQU8sSUFBSSxHQUFXLEdBQVcsR0FBbUI7QUFDMUQsV0FBTyxJQUFJLFFBQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRztBQUFBLEVBQ2pEO0FBQUE7QUFBQSxF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
