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
var TComponent2 = class {
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
    return TMetaComponent2.metaclass;
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
    return new TComponent2(name, form, parent);
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
var TMetaComponent2 = _TMetaComponent;
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
var TContainer = class extends TComponent2 {
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
};
var _TMetaContainer = class _TMetaContainer extends TMetaComponent2 {
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
__publicField(_TMetaContainer, "metaclass", new _TMetaContainer(TMetaComponent2.metaclass, "TContainer"));
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
    return new TForm2(name);
  }
  defProps() {
    return [
      //{ name: 'caption', kind: 'string', apply: (o, v) => (o.caption = String(v)) },
      //{ name: 'enabled', kind: 'boolean', apply: (o, v) => (o.enabled = Boolean(v)) }
    ];
  }
};
__publicField(_TMetaForm, "metaclass", new _TMetaForm(TMetaComponent2.metaclass, "TForm"));
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
var TForm2 = _TForm;
var TButton2 = class extends TComponent2 {
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
var _TMetaButton = class _TMetaButton extends TMetaComponent2 {
  constructor(superClass, name) {
    super(superClass, name);
  }
  getMetaclass() {
    return _TMetaButton.metaclass;
  }
  create(name, form, parent) {
    return new TButton2(name, form, parent);
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
__publicField(_TMetaButton, "metaclass", new _TMetaButton(TMetaComponent2.metaclass, "TButton"));
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
var _TMetaPluginHost = class _TMetaPluginHost extends TMetaComponent2 {
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
__publicField(_TMetaPluginHost, "metaclass", new _TMetaPluginHost(TMetaComponent2.metaclass, "TPluginHost"));
var TMetaPluginHost = _TMetaPluginHost;
var TPluginHost = class extends TComponent2 {
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
var TSimpleDCC = class extends TComponent2 {
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
var _TMetaSimpleDCC = class _TMetaSimpleDCC extends TMetaComponent2 {
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
__publicField(_TMetaSimpleDCC, "metaclass", new _TMetaSimpleDCC(TMetaComponent2.metaclass, "TSimpleDCC"));
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
var _TMetaCompositeDCC = class _TMetaCompositeDCC extends TMetaComponent2 {
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
var Zaza = class extends TForm2 {
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL3ZjbC9yZWdpc3RlclZjbC50cyIsICIuLi9zcmMvdmNsL1N0ZEN0cmxzLnRzIiwgIi4uL2V4YW1wbGVzL3phemEvdGVzdC50cyIsICIuLi9leGFtcGxlcy96YXphL3phemEudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vIEVuZ2xpc2ggY29tbWVudHMgYXMgcmVxdWVzdGVkLlxuXG4vL2ltcG9ydCB7IENvbXBvbmVudFR5cGVSZWdpc3RyeSB9IGZyb20gJ0BkcnQnO1xuaW1wb3J0IHsgVEJ1dHRvbiwgVE1ldGFDb21wb25lbnQsIFRGb3JtLCBUQ29tcG9uZW50LCBUQ29tcG9uZW50VHlwZVJlZ2lzdHJ5LCBUTWV0YUJ1dHRvbiwgVE1ldGFQbHVnaW5Ib3N0LCBUTWV0YUZvcm0sIFRNZXRhUGFuZWwgfSBmcm9tICdAdmNsJztcbi8vaW1wb3J0IHsgVE1ldGFQbHVnaW5Ib3N0IH0gZnJvbSAnLi4vZHJ0L1VJUGx1Z2luJzsgLy8gTk9UIEdPT0QgISBpbXBvcnQgVkNMIVxuXG4vLyBFbmdsaXNoIGNvbW1lbnRzIGFzIHJlcXVlc3RlZC5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckJ1aWx0aW5zKHR5cGVzOiBUQ29tcG9uZW50VHlwZVJlZ2lzdHJ5KSB7XG4gICAgICAgIHR5cGVzLnJlZ2lzdGVyKFRNZXRhQnV0dG9uLm1ldGFjbGFzcyk7XG4gICAgICAgIHR5cGVzLnJlZ2lzdGVyKFRNZXRhUGx1Z2luSG9zdC5tZXRhY2xhc3MpO1xuICAgICAgICB0eXBlcy5yZWdpc3RlcihUTWV0YUZvcm0ubWV0YWNsYXNzKTtcbiAgICAgICAgdHlwZXMucmVnaXN0ZXIoVE1ldGFQYW5lbC5tZXRhY2xhc3MpO1xuICAgICAgICAvLyB0eXBlcy5yZWdpc3RlcihURWRpdENsYXNzKTtcbiAgICAgICAgLy8gdHlwZXMucmVnaXN0ZXIoVExhYmVsQ2xhc3MpO1xufVxuIiwgImltcG9ydCB7IHJlZ2lzdGVyQnVpbHRpbnMgfSBmcm9tICcuL3JlZ2lzdGVyVmNsJztcblxuLypcbiAgIFRvIGNyZWF0ZSBhIG5ldyBjb21wb25lbnQgdHlwZTpcblxuICAgVG8gY3JlYXRlIGEgbmV3IGNvbXBvbmVudCBhdHRyaWJ1dFxuXG4qL1xuXG5leHBvcnQgY2xhc3MgVENvbG9yIHtcbiAgICAgICAgczogc3RyaW5nO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHM6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHRoaXMucyA9IHM7XG4gICAgICAgIH1cbiAgICAgICAgLyogZmFjdG9yeSAqLyBzdGF0aWMgcmdiKHI6IG51bWJlciwgZzogbnVtYmVyLCBiOiBudW1iZXIpOiBUQ29sb3Ige1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVENvbG9yKGByZ2IoJHtyfSwgJHtnfSwgJHtifSlgKTtcbiAgICAgICAgfVxuICAgICAgICAvKiBmYWN0b3J5ICovIHN0YXRpYyByZ2JhKHI6IG51bWJlciwgZzogbnVtYmVyLCBiOiBudW1iZXIsIGE6IG51bWJlcik6IFRDb2xvciB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUQ29sb3IoYHJnYmEoJHtyfSwgJHtnfSwgJHtifSwgJHthfSlgKTtcbiAgICAgICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVEhhbmRsZXIge1xuICAgICAgICBzOiBzdHJpbmc7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioczogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zID0gcztcbiAgICAgICAgfVxuICAgICAgICBmaXJlKGZvcm06IFRGb3JtLCBoYW5kbGVyTmFtZTogc3RyaW5nLCBldjogRXZlbnQsIHNlbmRlcjogYW55KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF5YmVNZXRob2QgPSAoZm9ybSBhcyBhbnkpW3RoaXMuc107XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBtYXliZU1ldGhvZCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ05PVCBBIE1FVEhPRCcsIGhhbmRsZXJOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBJZiBzZW5kZXIgaXMgbWlzc2luZywgZmFsbGJhY2sgdG8gdGhlIGZvcm0gaXRzZWxmIChzYWZlKVxuICAgICAgICAgICAgICAgIChtYXliZU1ldGhvZCBhcyAoZXZlbnQ6IEV2ZW50LCBzZW5kZXI6IGFueSkgPT4gYW55KS5jYWxsKGZvcm0sIGV2LCBzZW5kZXIgPz8gdGhpcyk7XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IHR5cGUgQ29tcG9uZW50RmFjdG9yeSA9IChuYW1lOiBzdHJpbmcsIGZvcm06IFRGb3JtLCBvd25lcjogVENvbXBvbmVudCkgPT4gVENvbXBvbmVudDtcblxuZXhwb3J0IHR5cGUgSnNvbiA9IG51bGwgfCBib29sZWFuIHwgbnVtYmVyIHwgc3RyaW5nIHwgSnNvbltdIHwgeyBba2V5OiBzdHJpbmddOiBKc29uIH07XG5cbnR5cGUgUHJvcEtpbmQgPSAnc3RyaW5nJyB8ICdudW1iZXInIHwgJ2Jvb2xlYW4nIHwgJ2NvbG9yJyB8ICdoYW5kbGVyJztcblxuZXhwb3J0IHR5cGUgUHJvcFNwZWM8VCwgViA9IHVua25vd24+ID0ge1xuICAgICAgICBuYW1lOiBzdHJpbmc7XG4gICAgICAgIGtpbmQ6IFByb3BLaW5kO1xuICAgICAgICByZXRyaWV2ZTogKG9iajogVCkgPT4gVjtcbiAgICAgICAgYXBwbHk6IChvYmo6IFQsIHZhbHVlOiBWKSA9PiB2b2lkO1xufTtcblxudHlwZSBVbmtub3duUmVjb3JkID0gUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5leHBvcnQgdHlwZSBDb21wb25lbnRQcm9wcyA9IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG5jb25zdCBSRVNFUlZFRF9EQVRBX0FUVFJTID0gbmV3IFNldDxzdHJpbmc+KFtcbiAgICAgICAgJ2RhdGEtY29tcG9uZW50JyxcbiAgICAgICAgJ2RhdGEtbmFtZScsXG4gICAgICAgICdkYXRhLXByb3BzJyxcbiAgICAgICAgJ2RhdGEtcGx1Z2luJyxcbiAgICAgICAgJ2RhdGEtbWVzc2FnZScgLy8gYWRkIGFueSBtZXRhL2ZyYW1ld29yayBhdHRycyB5b3UgZG9uJ3Qgd2FudCB0cmVhdGVkIGFzIHByb3BzXG5dKTtcblxuZXhwb3J0IGludGVyZmFjZSBJUGx1Z2luSG9zdCB7XG4gICAgICAgIHNldFBsdWdpblNwZWMoc3BlYzogeyBwbHVnaW46IHN0cmluZyB8IG51bGw7IHByb3BzOiBhbnkgfSk6IHZvaWQ7XG4gICAgICAgIG1vdW50UGx1Z2luSWZSZWFkeShzZXJ2aWNlczogRGVscGhpbmVTZXJ2aWNlcyk6IHZvaWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGVscGhpbmVMb2dnZXIge1xuICAgICAgICBkZWJ1Zyhtc2c6IHN0cmluZywgZGF0YT86IEpzb24pOiB2b2lkO1xuICAgICAgICBpbmZvKG1zZzogc3RyaW5nLCBkYXRhPzogSnNvbik6IHZvaWQ7XG4gICAgICAgIHdhcm4obXNnOiBzdHJpbmcsIGRhdGE/OiBKc29uKTogdm9pZDtcbiAgICAgICAgZXJyb3IobXNnOiBzdHJpbmcsIGRhdGE/OiBKc29uKTogdm9pZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEZWxwaGluZUV2ZW50QnVzIHtcbiAgICAgICAgLy8gU3Vic2NyaWJlIHRvIGFuIGFwcCBldmVudC5cbiAgICAgICAgb24oZXZlbnROYW1lOiBzdHJpbmcsIGhhbmRsZXI6IChwYXlsb2FkOiBKc29uKSA9PiB2b2lkKTogKCkgPT4gdm9pZDtcblxuICAgICAgICAvLyBQdWJsaXNoIGFuIGFwcCBldmVudC5cbiAgICAgICAgZW1pdChldmVudE5hbWU6IHN0cmluZywgcGF5bG9hZDogSnNvbik6IHZvaWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGVscGhpbmVTdG9yYWdlIHtcbiAgICAgICAgZ2V0KGtleTogc3RyaW5nKTogUHJvbWlzZTxKc29uIHwgdW5kZWZpbmVkPjtcbiAgICAgICAgc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogSnNvbik6IFByb21pc2U8dm9pZD47XG4gICAgICAgIHJlbW92ZShrZXk6IHN0cmluZyk6IFByb21pc2U8dm9pZD47XG59XG5leHBvcnQgaW50ZXJmYWNlIERlbHBoaW5lU2VydmljZXMge1xuICAgICAgICBsb2c6IHtcbiAgICAgICAgICAgICAgICBkZWJ1Zyhtc2c6IHN0cmluZywgZGF0YT86IGFueSk6IHZvaWQ7XG4gICAgICAgICAgICAgICAgaW5mbyhtc2c6IHN0cmluZywgZGF0YT86IGFueSk6IHZvaWQ7XG4gICAgICAgICAgICAgICAgd2Fybihtc2c6IHN0cmluZywgZGF0YT86IGFueSk6IHZvaWQ7XG4gICAgICAgICAgICAgICAgZXJyb3IobXNnOiBzdHJpbmcsIGRhdGE/OiBhbnkpOiB2b2lkO1xuICAgICAgICB9O1xuXG4gICAgICAgIGJ1czoge1xuICAgICAgICAgICAgICAgIG9uKGV2ZW50OiBzdHJpbmcsIGhhbmRsZXI6IChwYXlsb2FkOiBhbnkpID0+IHZvaWQpOiAoKSA9PiB2b2lkO1xuICAgICAgICAgICAgICAgIGVtaXQoZXZlbnQ6IHN0cmluZywgcGF5bG9hZDogYW55KTogdm9pZDtcbiAgICAgICAgfTtcblxuICAgICAgICBzdG9yYWdlOiB7XG4gICAgICAgICAgICAgICAgZ2V0KGtleTogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHwgbnVsbDtcbiAgICAgICAgICAgICAgICBzZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpOiBQcm9taXNlPHZvaWQ+IHwgbnVsbDtcbiAgICAgICAgICAgICAgICByZW1vdmUoa2V5OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHwgbnVsbDtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBmdXR1clxuICAgICAgICAvLyBpMThuPzogLi4uXG4gICAgICAgIC8vIG5hdj86IC4uLlxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFVJUGx1Z2luSW5zdGFuY2U8UHJvcHMgZXh0ZW5kcyBKc29uID0gSnNvbj4ge1xuICAgICAgICByZWFkb25seSBpZDogc3RyaW5nO1xuXG4gICAgICAgIC8vIENhbGxlZCBleGFjdGx5IG9uY2UgYWZ0ZXIgY3JlYXRpb24gKGZvciBhIGdpdmVuIGluc3RhbmNlKS5cbiAgICAgICAgbW91bnQoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgcHJvcHM6IFByb3BzLCBzZXJ2aWNlczogRGVscGhpbmVTZXJ2aWNlcyk6IHZvaWQ7XG5cbiAgICAgICAgLy8gQ2FsbGVkIGFueSB0aW1lIHByb3BzIGNoYW5nZSAobWF5IGJlIGZyZXF1ZW50KS5cbiAgICAgICAgdXBkYXRlKHByb3BzOiBQcm9wcyk6IHZvaWQ7XG5cbiAgICAgICAgLy8gQ2FsbGVkIGV4YWN0bHkgb25jZSBiZWZvcmUgZGlzcG9zYWwuXG4gICAgICAgIHVubW91bnQoKTogdm9pZDtcblxuICAgICAgICAvLyBPcHRpb25hbCBlcmdvbm9taWNzLlxuICAgICAgICBnZXRTaXplSGludHM/KCk6IG51bWJlcjtcbiAgICAgICAgZm9jdXM/KCk6IHZvaWQ7XG5cbiAgICAgICAgLy8gT3B0aW9uYWwgcGVyc2lzdGVuY2UgaG9vayAoRGVscGhpbmUgbWF5IHN0b3JlICYgcmVzdG9yZSB0aGlzKS5cbiAgICAgICAgc2VyaWFsaXplU3RhdGU/KCk6IEpzb247XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBUTWV0YWNsYXNzIHtcbiAgICAgICAgcmVhZG9ubHkgdHlwZU5hbWU6IHN0cmluZyA9ICdUTWV0YWNsYXNzJztcbiAgICAgICAgc3RhdGljIG1ldGFjbGFzczogVE1ldGFjbGFzcztcbiAgICAgICAgcmVhZG9ubHkgc3VwZXJDbGFzczogVE1ldGFjbGFzcyB8IG51bGwgPSBudWxsO1xuXG4gICAgICAgIGFic3RyYWN0IGdldE1ldGFjbGFzcygpOiBUTWV0YWNsYXNzO1xuICAgICAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3Ioc3VwZXJDbGFzczogVE1ldGFjbGFzcyB8IG51bGwsIHR5cGVOYW1lID0gJ1RNZXRhY2xhc3MnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdXBlckNsYXNzID0gc3VwZXJDbGFzcztcbiAgICAgICAgICAgICAgICB0aGlzLnR5cGVOYW1lID0gdHlwZU5hbWU7XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRPYmplY3Qge1xuICAgICAgICBnZXRNZXRhQ2xhc3MoKTogVE1ldGFPYmplY3Qge1xuICAgICAgICAgICAgICAgIHJldHVybiBUTWV0YU9iamVjdC5tZXRhQ2xhc3M7XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRNZXRhT2JqZWN0IGV4dGVuZHMgVE1ldGFjbGFzcyB7XG4gICAgICAgIHN0YXRpYyByZWFkb25seSBtZXRhQ2xhc3M6IFRNZXRhT2JqZWN0ID0gbmV3IFRNZXRhT2JqZWN0KFRNZXRhY2xhc3MubWV0YWNsYXNzLCAnVE9iamVjdCcpO1xuXG4gICAgICAgIGdldE1ldGFjbGFzcygpOiBUTWV0YU9iamVjdCB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhT2JqZWN0Lm1ldGFDbGFzcztcbiAgICAgICAgfVxuICAgICAgICBjb25zdHJ1Y3RvcihzdXBlckNsYXNzOiBUTWV0YWNsYXNzLCBuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICBzdXBlcihzdXBlckNsYXNzLCBuYW1lKTtcbiAgICAgICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVENvbXBvbmVudCB7XG4gICAgICAgIGdldE1ldGFjbGFzcygpOiBUTWV0YUNvbXBvbmVudCB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhQ29tcG9uZW50Lm1ldGFjbGFzcztcbiAgICAgICAgfVxuXG4gICAgICAgIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcbiAgICAgICAgcmVhZG9ubHkgcGFyZW50OiBUQ29tcG9uZW50IHwgbnVsbCA9IG51bGw7XG5cbiAgICAgICAgcHJvdGVjdGVkIHByb3BzOiBDb21wb25lbnRQcm9wcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgICAgICAgZ2V0UHJvcDxUID0gdW5rbm93bj4obmFtZTogc3RyaW5nKTogVCB8IHVuZGVmaW5lZCB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvcHNbbmFtZV0gYXMgVCB8IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHNldFByb3AobmFtZTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IHZvaWQge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHNbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG9wdGlvbmFsXG4gICAgICAgIGhhc1Byb3AobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLnByb3BzLCBuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICAvL3Byb3RlY3RlZCBwcm9wczogQ29tcG9uZW50UHJvcHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICBmb3JtOiBURm9ybSB8IG51bGwgPSBudWxsO1xuICAgICAgICBjaGlsZHJlbjogVENvbXBvbmVudFtdID0gW107XG5cbiAgICAgICAgZWxlbTogRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgICAgICBnZXQgaHRtbEVsZW1lbnQoKTogSFRNTEVsZW1lbnQgfCBudWxsIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5lbGVtIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIGZvcm06IFRGb3JtIHwgbnVsbCwgcGFyZW50OiBUQ29tcG9uZW50IHwgbnVsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgICAgICAgICAgICAgcGFyZW50Py5jaGlsZHJlbi5wdXNoKHRoaXMpOyAvLyBDb3VsZCBiZSBkb25lIGluIGJ1aWxkQ29tcG9uZW50VHJlZSgpXG4gICAgICAgICAgICAgICAgdGhpcy5mb3JtID0gZm9ybTtcblxuICAgICAgICAgICAgICAgIC8vIElNUE9SVEFOVDogSW5pdGlhbGl6ZSBwcm9wcyBhdCBydW50aW1lIChkZWNsYXJlIHdvdWxkIG5vdCBkbyBpdCkuXG4gICAgICAgICAgICAgICAgLy90aGlzLnByb3BzID0ge307XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOT1RFOiBUaGlzIGlzIHJ1bnRpbWUgZGF0YSwgc28gaXQgbXVzdCBiZSBpbml0aWFsaXplZCAobm8gXCJkZWNsYXJlXCIpLlxuICAgICAgICAvL3Byb3BzOiBDb21wb25lbnRQcm9wcztcblxuICAgICAgICAvKiogTWF5IGNvbnRhaW4gY2hpbGQgY29tcG9uZW50cyAqL1xuICAgICAgICBfb25jbGljazogVEhhbmRsZXIgPSBuZXcgVEhhbmRsZXIoJycpO1xuICAgICAgICBhbGxvd3NDaGlsZHJlbigpOiBib29sZWFuIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IGNvbG9yKCk6IFRDb2xvciB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUQ29sb3IodGhpcy5nZXRIdG1sU3R5bGVQcm9wKCdjb2xvcicpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNldCBjb2xvcihjb2xvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0SHRtbFN0eWxlUHJvcCgnY29sb3InLCBjb2xvci5zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdldCBvbmNsaWNrKCk6IFRIYW5kbGVyIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fb25jbGljayA/PyBuZXcgVEhhbmRsZXIoJycpO1xuICAgICAgICB9XG4gICAgICAgIHNldCBvbmNsaWNrKGhhbmRsZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9vbmNsaWNrID0gaGFuZGxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHN5bmNEb21Gcm9tUHJvcHMoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZWwgPSB0aGlzLmh0bWxFbGVtZW50O1xuICAgICAgICAgICAgICAgIGlmICghZWwpIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGdldCBiYWNrZ3JvdW5kQ29sb3IoKTogVENvbG9yIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRDb2xvcih0aGlzLmdldEh0bWxTdHlsZVByb3AoJ2JhY2tncm91bmQtY29sb3InKSk7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IGJhY2tncm91bmRDb2xvcih2OiBUQ29sb3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEh0bWxTdHlsZVByb3AoJ2JhY2tncm91bmQtY29sb3InLCB2LnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0IHdpZHRoKCk6IHN0cmluZyB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SHRtbFByb3AoJ3dpZHRoJykgPz8gJyc7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IHdpZHRoKHY6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0SHRtbFByb3AoJ3dpZHRoJywgdik7XG4gICAgICAgIH1cblxuICAgICAgICBnZXQgaGVpZ2h0KCk6IHN0cmluZyB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SHRtbFByb3AoJ2hlaWdodCcpID8/ICcnO1xuICAgICAgICB9XG4gICAgICAgIHNldCBoZWlnaHQodjogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRIdG1sUHJvcCgnaGVpZ2h0Jywgdik7XG4gICAgICAgIH1cblxuICAgICAgICBnZXQgb2Zmc2V0V2lkdGgoKTogbnVtYmVyIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5odG1sRWxlbWVudCEub2Zmc2V0V2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IG9mZnNldEhlaWdodCgpOiBudW1iZXIge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmh0bWxFbGVtZW50IS5vZmZzZXRIZWlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICBzZXRIdG1sU3R5bGVQcm9wKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHRoaXMuaHRtbEVsZW1lbnQhLnN0eWxlLnNldFByb3BlcnR5KG5hbWUsIHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdldEh0bWxTdHlsZVByb3AobmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaHRtbEVsZW1lbnQhLnN0eWxlLmdldFByb3BlcnR5VmFsdWUobmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICBzZXRIdG1sUHJvcChuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmh0bWxFbGVtZW50IS5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0SHRtbFByb3AobmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMhLmh0bWxFbGVtZW50IS5nZXRBdHRyaWJ1dGUobmFtZSk7XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRNZXRhQ29tcG9uZW50IGV4dGVuZHMgVE1ldGFjbGFzcyB7XG4gICAgICAgIHN0YXRpYyByZWFkb25seSBtZXRhY2xhc3M6IFRNZXRhQ29tcG9uZW50ID0gbmV3IFRNZXRhQ29tcG9uZW50KFRNZXRhY2xhc3MubWV0YWNsYXNzLCAnVENvbXBvbmVudCcpO1xuICAgICAgICAvLyBUaGUgc3ltYm9saWMgbmFtZSB1c2VkIGluIEhUTUw6IGRhdGEtY29tcG9uZW50PVwiVEJ1dHRvblwiIG9yIFwibXktYnV0dG9uXCJcbiAgICAgICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHN1cGVyQ2xhc3M6IFRNZXRhY2xhc3MsIG5hbWU6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHN1cGVyKHN1cGVyQ2xhc3MsIG5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0TWV0YWNsYXNzKCk6IFRNZXRhQ29tcG9uZW50IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFDb21wb25lbnQubWV0YWNsYXNzO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBydW50aW1lIGluc3RhbmNlIGFuZCBhdHRhY2ggaXQgdG8gdGhlIERPTSBlbGVtZW50LlxuICAgICAgICBjcmVhdGUobmFtZTogc3RyaW5nLCBmb3JtOiBURm9ybSwgcGFyZW50OiBUQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUQ29tcG9uZW50KG5hbWUsIGZvcm0sIHBhcmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBkZWZQcm9wcygpOiBQcm9wU3BlYzxhbnk+W10ge1xuICAgICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3sgbmFtZTogJ2NvbG9yJywga2luZDogJ2NvbG9yJywgYXBwbHk6IChvLCB2KSA9PiAoby5jb2xvciA9IG5ldyBUQ29sb3IoU3RyaW5nKHYpKSkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ29uY2xpY2snLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBraW5kOiAnaGFuZGxlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHJpZXZlOiAobykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvLm9uY2xpY2s7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGx5OiAobywgdikgPT4gKG8ub25jbGljayA9IG5ldyBUSGFuZGxlcihTdHJpbmcodikpKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy97IG5hbWU6ICdvbmNyZWF0ZScsIGtpbmQ6ICdoYW5kbGVyJywgYXBwbHk6IChvLCB2KSA9PiAoby5vbmNyZWF0ZSA9IG5ldyBUSGFuZGxlcihTdHJpbmcodikpKSB9XG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvbUV2ZW50cz8oKTogc3RyaW5nW107IC8vIGRlZmF1bHQgW107XG59XG5cbmV4cG9ydCBjbGFzcyBUTWV0YUNvbXBvbmVudFR5cGVSZWdpc3RyeSBleHRlbmRzIFRNZXRhT2JqZWN0IHtcbiAgICAgICAgc3RhdGljIHJlYWRvbmx5IG1ldGFjbGFzczogVE1ldGFDb21wb25lbnRUeXBlUmVnaXN0cnkgPSBuZXcgVE1ldGFDb21wb25lbnRUeXBlUmVnaXN0cnkoVE1ldGFPYmplY3QubWV0YUNsYXNzLCAnVENvbXBvbmVudFR5cGVSZWdpc3RyeScpO1xuICAgICAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3Ioc3VwZXJDbGFzczogVE1ldGFPYmplY3QsIG5hbWU6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHN1cGVyKHN1cGVyQ2xhc3MsIG5hbWUpO1xuICAgICAgICAgICAgICAgIC8vIGV0IHZvdXMgY2hhbmdleiBqdXN0ZSBsZSBub20gOlxuICAgICAgICB9XG4gICAgICAgIGdldE1ldGFjbGFzcygpOiBUTWV0YUNvbXBvbmVudFR5cGVSZWdpc3RyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhQ29tcG9uZW50VHlwZVJlZ2lzdHJ5Lm1ldGFjbGFzcztcbiAgICAgICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVENvbXBvbmVudFR5cGVSZWdpc3RyeSBleHRlbmRzIFRPYmplY3Qge1xuICAgICAgICAvLyBXZSBzdG9yZSBoZXRlcm9nZW5lb3VzIG1ldGFzLCBzbyB3ZSBrZWVwIHRoZW0gYXMgVE1ldGFDb21wb25lbnQ8YW55Pi5cbiAgICAgICAgZ2V0TWV0YWNsYXNzKCk6IFRNZXRhQ29tcG9uZW50VHlwZVJlZ2lzdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFDb21wb25lbnRUeXBlUmVnaXN0cnkubWV0YUNsYXNzO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgY2xhc3NlcyA9IG5ldyBNYXA8c3RyaW5nLCBUTWV0YUNvbXBvbmVudD4oKTtcblxuICAgICAgICByZWdpc3RlcihtZXRhOiBUTWV0YUNvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNsYXNzZXMuaGFzKG1ldGEudHlwZU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENvbXBvbmVudCB0eXBlIGFscmVhZHkgcmVnaXN0ZXJlZDogJHttZXRhLnR5cGVOYW1lfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmNsYXNzZXMuc2V0KG1ldGEudHlwZU5hbWUsIG1ldGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgeW91IGp1c3QgbmVlZCBcInNvbWV0aGluZyBtZXRhXCIsIHJldHVybiBhbnktbWV0YS5cbiAgICAgICAgZ2V0KHR5cGVOYW1lOiBzdHJpbmcpOiBUTWV0YUNvbXBvbmVudCB8IHVuZGVmaW5lZCB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xhc3Nlcy5nZXQodHlwZU5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaGFzKHR5cGVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jbGFzc2VzLmhhcyh0eXBlTmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICBsaXN0KCk6IHN0cmluZ1tdIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gWy4uLnRoaXMuY2xhc3Nlcy5rZXlzKCldLnNvcnQoKTtcbiAgICAgICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVE1ldGFDb21wb25lbnRSZWdpc3RyeSBleHRlbmRzIFRNZXRhY2xhc3Mge1xuICAgICAgICBzdGF0aWMgcmVhZG9ubHkgbWV0YWNsYXNzOiBUTWV0YUNvbXBvbmVudFJlZ2lzdHJ5ID0gbmV3IFRNZXRhQ29tcG9uZW50UmVnaXN0cnkoVE1ldGFjbGFzcy5tZXRhY2xhc3MsICdUQ29tcG9uZW50VHlwZVJlZ2lzdHJ5Jyk7XG5cbiAgICAgICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHN1cGVyQ2xhc3M6IFRNZXRhY2xhc3MsIG5hbWU6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHN1cGVyKHN1cGVyQ2xhc3MsIG5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGdldE1ldGFjbGFzcygpOiBUTWV0YUNvbXBvbmVudFJlZ2lzdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFDb21wb25lbnRSZWdpc3RyeS5tZXRhY2xhc3M7XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRDb21wb25lbnRSZWdpc3RyeSBleHRlbmRzIFRPYmplY3Qge1xuICAgICAgICBnZXRNZXRhY2xhc3MoKTogVE1ldGFDb21wb25lbnRSZWdpc3RyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhQ29tcG9uZW50UmVnaXN0cnkubWV0YWNsYXNzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBpbnN0YW5jZXMgPSBuZXcgTWFwPHN0cmluZywgVENvbXBvbmVudD4oKTtcblxuICAgICAgICBsb2dnZXIgPSB7XG4gICAgICAgICAgICAgICAgZGVidWcobXNnOiBzdHJpbmcsIGRhdGE/OiBKc29uKTogdm9pZCB7fSxcbiAgICAgICAgICAgICAgICBpbmZvKG1zZzogc3RyaW5nLCBkYXRhPzogSnNvbik6IHZvaWQge30sXG4gICAgICAgICAgICAgICAgd2Fybihtc2c6IHN0cmluZywgZGF0YT86IEpzb24pOiB2b2lkIHt9LFxuICAgICAgICAgICAgICAgIGVycm9yKG1zZzogc3RyaW5nLCBkYXRhPzogSnNvbik6IHZvaWQge31cbiAgICAgICAgfTtcblxuICAgICAgICBldmVudEJ1cyA9IHtcbiAgICAgICAgICAgICAgICBvbihldmVudDogc3RyaW5nLCBoYW5kbGVyOiAocGF5bG9hZDogYW55KSA9PiB2b2lkKTogKCkgPT4gdm9pZCB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4gdm9pZCB7fTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVtaXQoZXZlbnQ6IHN0cmluZywgcGF5bG9hZDogYW55KTogdm9pZCB7fVxuICAgICAgICB9O1xuXG4gICAgICAgIHN0b3JhZ2UgPSB7XG4gICAgICAgICAgICAgICAgZ2V0KGtleTogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHwgbnVsbCB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNldChrZXk6IHN0cmluZywgdmFsdWU6IGFueSk6IFByb21pc2U8dm9pZD4gfCBudWxsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcmVtb3ZlKGtleTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB8IG51bGwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZWdpc3Rlckluc3RhbmNlKG5hbWU6IHN0cmluZywgYzogVENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VzLnNldChuYW1lLCBjKTtcbiAgICAgICAgfVxuICAgICAgICBnZXQ8VCBleHRlbmRzIFRDb21wb25lbnQgPSBUQ29tcG9uZW50PihuYW1lOiBzdHJpbmcpOiBUIHwgdW5kZWZpbmVkIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5pbnN0YW5jZXMuZ2V0KG5hbWUpIGFzIFQgfCB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBzZXJ2aWNlczogRGVscGhpbmVTZXJ2aWNlcyA9IHtcbiAgICAgICAgICAgICAgICBsb2c6IHRoaXMubG9nZ2VyLFxuICAgICAgICAgICAgICAgIGJ1czogdGhpcy5ldmVudEJ1cyxcbiAgICAgICAgICAgICAgICBzdG9yYWdlOiB0aGlzLnN0b3JhZ2VcbiAgICAgICAgfTtcblxuICAgICAgICBjbGVhcigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluc3RhbmNlcy5jbGVhcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzb2x2ZVJvb3QoKTogSFRNTEVsZW1lbnQge1xuICAgICAgICAgICAgICAgIC8vIFByZWZlciBib2R5IGFzIHRoZSBjYW5vbmljYWwgcm9vdC5cbiAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQuYm9keT8uZGF0YXNldD8uY29tcG9uZW50KSByZXR1cm4gZG9jdW1lbnQuYm9keTtcblxuICAgICAgICAgICAgICAgIC8vIEJhY2t3YXJkIGNvbXBhdGliaWxpdHk6IG9sZCB3cmFwcGVyIGRpdi5cbiAgICAgICAgICAgICAgICBjb25zdCBsZWdhY3kgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGVscGhpbmUtcm9vdCcpO1xuICAgICAgICAgICAgICAgIGlmIChsZWdhY3kpIHJldHVybiBsZWdhY3k7XG5cbiAgICAgICAgICAgICAgICAvLyBMYXN0IHJlc29ydC5cbiAgICAgICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQuYm9keSA/PyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIGNvbnZlcnQocmF3OiBzdHJpbmcsIGtpbmQ6IFByb3BLaW5kKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByYXcgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGtpbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmF3O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBOdW1iZXIocmF3KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJhdyA9PT0gJ3RydWUnIHx8IHJhdyA9PT0gJzEnIHx8IHJhdyA9PT0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2NvbG9yJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRDb2xvcihyYXcpOyAvLyBvdSBwYXJzZSBlbiBUQ29sb3Igc2kgdm91cyBhdmV6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2hhbmRsZXInOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVEhhbmRsZXIocmF3KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJhdztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tIFByb3BlcnRpZXMgLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgICAgICAvKipcbiAgICAgICAgICogRmluZCB0aGUgbmVhcmVzdCBQcm9wU3BlYyBmb3IgYSBwcm9wIG5hbWUgYnkgd2Fsa2luZyBtZXRhIGluaGVyaXRhbmNlOlxuICAgICAgICAgKiBtZXRhIC0+IG1ldGEuc3VwZXJDbGFzcyAtPiAuLi5cbiAgICAgICAgICogVXNlcyBjYWNoaW5nIGZvciBzcGVlZC5cbiAgICAgICAgICovXG4gICAgICAgIHByaXZhdGUgcmVzb2x2ZU5lYXJlc3RQcm9wU3BlYyhtZXRhOiBUTWV0YUNvbXBvbmVudCwgcHJvcE5hbWU6IHN0cmluZyk6IFByb3BTcGVjPGFueT4gfCBudWxsIHtcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgIGxldCBwZXJNZXRhID0gdGhpcy5fcHJvcFNwZWNDYWNoZS5nZXQobWV0YSk7XG4gICAgICAgICAgICAgICAgaWYgKCFwZXJNZXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJNZXRhID0gbmV3IE1hcDxzdHJpbmcsIFByb3BTcGVjPGFueT4gfCBudWxsPigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcHJvcFNwZWNDYWNoZS5zZXQobWV0YSwgcGVyTWV0YSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHBlck1ldGEuaGFzKHByb3BOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBlck1ldGEuZ2V0KHByb3BOYW1lKSE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgICAgIC8vIFdhbGsgdXAgbWV0YWNsYXNzIGluaGVyaXRhbmNlOiBjaGlsZCBmaXJzdCAobmVhcmVzdCB3aW5zKVxuICAgICAgICAgICAgICAgIGxldCBtYzogVE1ldGFDb21wb25lbnQgfCBudWxsID0gbWV0YTtcblxuICAgICAgICAgICAgICAgIHdoaWxlIChtYykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBtYy5kZWZQcm9wcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkZWZzID0gbWMuZGVmUHJvcHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBzcGVjIG9mIGRlZnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3BlYy5uYW1lID09PSBwcm9wTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9wZXJNZXRhLnNldChwcm9wTmFtZSwgc3BlYyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3BlYztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG1jID0gKG1jLnN1cGVyQ2xhc3MgYXMgVE1ldGFDb21wb25lbnQpID8/IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy9wZXJNZXRhLnNldChwcm9wTmFtZSwgbnVsbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIGFwcGx5UHJvcHNGcm9tU291cmNlKGNvbXA6IFRDb21wb25lbnQsIHNyYzogVW5rbm93blJlY29yZCwgbWV0YTogVE1ldGFDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IFtuYW1lLCByYXdWYWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoc3JjKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3BlYyA9IHRoaXMucmVzb2x2ZU5lYXJlc3RQcm9wU3BlYyhtZXRhLCBuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghc3BlYykgY29udGludWU7IC8vIE5vdCBhIGRlY2xhcmVkIHByb3AgLT4gaWdub3JlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2OiBzdHJpbmcgPSByYXdWYWx1ZSBhcyBzdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlOiBkYXRhLXh4eCBnaXZlcyBzdHJpbmdzOyBkYXRhLXByb3BzIGNhbiBnaXZlIGFueSBKU09OIHR5cGUuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuY29udmVydCh2LCBzcGVjLmtpbmQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvL291dFtuYW1lXSA9IHZhbHVlOyAvLyA8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY29tcC5zZXRIdG1sUHJvcChuYW1lLCB2YWx1ZSk7IC8vIGZvciBjb252ZW5pZW5jZSwgc2V0SHRtbFByb3AgY2FuIGJlIHVzZWQgYnkgdGhlIGNvbXBvbmVudCBpdHNlbGYgdG8gcmVhY3QgdG8gcHJvcCBjaGFuZ2VzLlxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcC5zZXRQcm9wKG5hbWUsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwZWMuYXBwbHkoY29tcCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgZXh0cmFjdEpzb25Qcm9wcyhlbDogRWxlbWVudCk6IFVua25vd25SZWNvcmQge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJhdyA9IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1wcm9wcycpO1xuICAgICAgICAgICAgICAgIGlmICghcmF3KSByZXR1cm4ge307XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShyYXcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gT25seSBhY2NlcHQgcGxhaW4gb2JqZWN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlZCAmJiB0eXBlb2YgcGFyc2VkID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShwYXJzZWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZWQgYXMgVW5rbm93blJlY29yZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdJbnZhbGlkIEpTT04gaW4gZGF0YS1wcm9wcycsIHJhdywgZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBleHRyYWN0RGF0YUF0dHJpYnV0ZXMoZWw6IEVsZW1lbnQpOiBVbmtub3duUmVjb3JkIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvdXQ6IFVua25vd25SZWNvcmQgPSB7fTtcblxuICAgICAgICAgICAgICAgIC8vIEl0ZXJhdGUgYWxsIGF0dHJpYnV0ZXMsIGtlZXAgb25seSBkYXRhLXh4eCAoZXhjZXB0IHJlc2VydmVkKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgYXR0ciBvZiBBcnJheS5mcm9tKGVsLmF0dHJpYnV0ZXMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhdHRyTmFtZSA9IGF0dHIubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYXR0ck5hbWUuc3RhcnRzV2l0aCgnZGF0YS0nKSkgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoUkVTRVJWRURfREFUQV9BVFRSUy5oYXMoYXR0ck5hbWUpKSBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvcE5hbWUgPSBhdHRyTmFtZS5zbGljZSgnZGF0YS0nLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTa2lwIGVtcHR5IG5hbWVzXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXByb3BOYW1lKSBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0W3Byb3BOYW1lXSA9IGF0dHIudmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG91dDtcbiAgICAgICAgfVxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAgICAgLy8gRW5nbGlzaCBjb21tZW50cyBhcyByZXF1ZXN0ZWQuXG5cbiAgICAgICAgLy8gQ2FjaGU6IHBlciBtZXRhY2xhc3MgLT4gKHByb3BOYW1lIC0+IG5lYXJlc3QgUHJvcFNwZWMgb3IgbnVsbCBpZiBub3QgZm91bmQpXG4gICAgICAgIC8vcHJpdmF0ZSByZWFkb25seSBfcHJvcFNwZWNDYWNoZSA9IG5ldyBXZWFrTWFwPFRNZXRhQ29tcG9uZW50LCBNYXA8c3RyaW5nLCBQcm9wU3BlYzxhbnk+IHwgbnVsbD4+KCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBhcnNlIEhUTUwgYXR0cmlidXRlcyArIEpTT04gYnVsayBpbnRvIGEgcGxhaW4gb2JqZWN0IG9mIHR5cGVkIHByb3BzLlxuICAgICAgICAgKiAtIFJlYWRzIEpTT04gZnJvbSBkYXRhLXByb3BzXG4gICAgICAgICAqIC0gUmVhZHMgZGF0YS14eHggYXR0cmlidXRlcyAoZXhjbHVkaW5nIHJlc2VydmVkIG9uZXMpXG4gICAgICAgICAqIC0gRm9yIGVhY2ggY2FuZGlkYXRlIHByb3AgbmFtZSwgcmVzb2x2ZXMgdGhlIG5lYXJlc3QgUHJvcFNwZWMgYnkgd2Fsa2luZyBtZXRhY2xhc3MgaW5oZXJpdGFuY2UuXG4gICAgICAgICAqIC0gQXBwbGllcyBjb252ZXJzaW9uIGJhc2VkIG9uIHNwZWMua2luZFxuICAgICAgICAgKiAtIGRhdGEteHh4IG92ZXJyaWRlcyBkYXRhLXByb3BzXG4gICAgICAgICAqL1xuICAgICAgICBwYXJzZVByb3BzRnJvbUVsZW1lbnQoY29tcDogVENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVsOiBFbGVtZW50IHwgbnVsbCA9IGNvbXAuZWxlbTtcblxuICAgICAgICAgICAgICAgIGlmICghZWwpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIC8vIDEpIEV4dHJhY3QgSlNPTiBidWxrIHByb3BzIGZyb20gZGF0YS1wcm9wc1xuICAgICAgICAgICAgICAgIGNvbnN0IGpzb25Qcm9wcyA9IHRoaXMuZXh0cmFjdEpzb25Qcm9wcyhlbCk7XG5cbiAgICAgICAgICAgICAgICAvLyAyKSBFeHRyYWN0IGRhdGEteHh4IGF0dHJpYnV0ZXMgKGV4Y2x1ZGluZyByZXNlcnZlZClcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhQXR0cnMgPSB0aGlzLmV4dHJhY3REYXRhQXR0cmlidXRlcyhlbCk7XG5cbiAgICAgICAgICAgICAgICAvLyAzKSBBcHBseSBKU09OIGZpcnN0LCB0aGVuIGRhdGEteHh4IG92ZXJyaWRlc1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwbHlQcm9wc0Zyb21Tb3VyY2UoY29tcCwganNvblByb3BzLCBjb21wLmdldE1ldGFjbGFzcygpKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGx5UHJvcHNGcm9tU291cmNlKGNvbXAsIGRhdGFBdHRycywgY29tcC5nZXRNZXRhY2xhc3MoKSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIHByb2Nlc3NFbGVtKGVsOiBFbGVtZW50LCBmb3JtOiBURm9ybSwgcGFyZW50OiBUQ29tcG9uZW50KTogVENvbXBvbmVudCB8IG51bGwge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbmFtZScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY29tcG9uZW50Jyk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBjbHMgPSBUQXBwbGljYXRpb24uVGhlQXBwbGljYXRpb24udHlwZXMuZ2V0KHR5cGUhKTtcblxuICAgICAgICAgICAgICAgIGlmICghY2xzKSByZXR1cm4gbnVsbDtcblxuICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IHBhcmVudDtcbiAgICAgICAgICAgICAgICBpZiAoY2xzICE9IFRNZXRhRm9ybS5tZXRhY2xhc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBURm9ybSBhcmUgYWxyZWFkeSBjcmVhdGVkIGJ5IHRoZSB1c2VyLlxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQgPSBjbHMuY3JlYXRlKG5hbWUhLCBmb3JtLCBwYXJlbnQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMucmVnaXN0ZXJJbnN0YW5jZShuYW1lISwgY2hpbGQpO1xuICAgICAgICAgICAgICAgIC8vIG5hbWU6IHN0cmluZywgZm9ybTogVEZvcm0sIHBhcmVudDogVENvbXBvbmVudCwgZWxlbTogSFRNTEVsZW1lbnRcbiAgICAgICAgICAgICAgICBpZiAoIWNoaWxkKSByZXR1cm4gbnVsbDtcblxuICAgICAgICAgICAgICAgIC8vY2hpbGQucGFyZW50ID0gY29tcG9uZW50O1xuXG4gICAgICAgICAgICAgICAgY2hpbGQuZWxlbSA9IGVsO1xuICAgICAgICAgICAgICAgIC8vY2hpbGQuZm9ybSA9IGZvcm07XG4gICAgICAgICAgICAgICAgLy9jaGlsZC5uYW1lID0gbmFtZSE7XG4gICAgICAgICAgICAgICAgLy9jaGlsZC5wcm9wcyA9IHt9O1xuXG4gICAgICAgICAgICAgICAgLy8gV2UgY29sbGVjdFxuICAgICAgICAgICAgICAgIHRoaXMucGFyc2VQcm9wc0Zyb21FbGVtZW50KGNoaWxkKTtcbiAgICAgICAgICAgICAgICBjaGlsZC5zeW5jRG9tRnJvbVByb3BzKCk7XG4gICAgICAgICAgICAgICAgKGNoaWxkIGFzIGFueSkub25BdHRhY2hlZFRvRG9tPy4oKTtcblxuICAgICAgICAgICAgICAgIC8vIERvbmUgaW4gdGhlIGNvbnN0cnVjdG9yIC8vcGFyZW50LmNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1heWJlSG9zdCA9IGNoaWxkIGFzIHVua25vd24gYXMgUGFydGlhbDxJUGx1Z2luSG9zdD47XG4gICAgICAgICAgICAgICAgaWYgKG1heWJlSG9zdCAmJiB0eXBlb2YgbWF5YmVIb3N0LnNldFBsdWdpblNwZWMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBsdWdpbiA9IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1wbHVnaW4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhdyA9IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1wcm9wcycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvcHMgPSByYXcgPyBKU09OLnBhcnNlKHJhdykgOiB7fTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbWF5YmVIb3N0LnNldFBsdWdpblNwZWMoeyBwbHVnaW4sIHByb3BzIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF5YmVIb3N0Lm1vdW50UGx1Z2luSWZSZWFkeSEodGhpcy5zZXJ2aWNlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL21heWJlSG9zdC5tb3VudEZyb21SZWdpc3RyeShzZXJ2aWNlcyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkLmFsbG93c0NoaWxkcmVuKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJzpzY29wZSA+IFtkYXRhLWNvbXBvbmVudF0nKS5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NFbGVtKGVsLCBmb3JtLCBjaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vaWYgKGVsID09PSByb290KSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkO1xuICAgICAgICAgICAgICAgIC8vaWYgKGVsID09PSByb290KSByZXR1cm47IC8vIE5vIG5lZWQgdG8gZ28gaGlnaGVyIGluIHRoZSBoaWVyYWNoeVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQganVzdGUgb25jZSwgd2hlbiB0aGUgZm9ybSBpcyBjcmVhdGVkXG4gICAgICAgIGJ1aWxkQ29tcG9uZW50VHJlZShmb3JtOiBURm9ybSwgcm9vdDogVENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgICAgICAgICAvLyAtLS0gRk9STSAtLS1cbiAgICAgICAgICAgICAgICAvLyBwcm92aXNvaXJlbWVudCBpZiAocm9vdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY29tcG9uZW50JykgPT09ICdURm9ybScpIHtcbiAgICAgICAgICAgICAgICAvL2NvbnN0IGVsID0gcm9vdC5lbGVtITtcblxuICAgICAgICAgICAgICAgIC8vdGhpcy5yZWdpc3Rlckluc3RhbmNlKHJvb3QubmFtZSwgZm9ybSk7XG4gICAgICAgICAgICAgICAgLy99XG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vdEVsZW0gPSByb290LmVsZW0hO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc0VsZW0ocm9vdEVsZW0sIGZvcm0sIHJvb3QpO1xuXG4gICAgICAgICAgICAgICAgLy8gLS0tIENISUxEIENPTVBPTkVOVFMgLS0tXG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICByb290RWxlbS5xdWVyeVNlbGVjdG9yQWxsKCc6c2NvcGUgPiBbZGF0YS1jb21wb25lbnRdJykuZm9yRWFjaCgoZWwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkOiBUQ29tcG9uZW50IHwgbnVsbCA9IHRoaXMucHJvY2Vzc0VsZW0oZWwsIGZvcm0sIHJvb3QpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9pZiAoZWwgPT09IHJvb3QpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZCAmJiBjaGlsZC5hbGxvd3NDaGlsZHJlbigpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJzpzY29wZSA+IFtkYXRhLWNvbXBvbmVudF0nKS5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc0VsZW0oZWwsIGZvcm0sIGNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2lmIChlbCA9PT0gcm9vdCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAqL1xuICAgICAgICB9XG59XG5cbi8qXG5leHBvcnQgdHlwZSBDb21wb25lbnRQcm9wcyA9IHtcbiAgICAgICAgb25jbGljaz86IFRIYW5kbGVyO1xuICAgICAgICBvbmNyZWF0ZT86IFRIYW5kbGVyO1xuICAgICAgICAvL2NvbG9yPzogVENvbG9yOyAvLyBvdSBUQ29sb3IsIGV0Yy5cbiAgICAgICAgbmFtZT86IHN0cmluZztcbiAgICAgICAgY29tcG9uZW50Pzogc3RyaW5nO1xufTtcbiovXG5cbi8vdHlwZSBSYXdQcm9wID0gUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcblxuZXhwb3J0IGNsYXNzIFREb2N1bWVudCBleHRlbmRzIFRPYmplY3Qge1xuICAgICAgICBzdGF0aWMgZG9jdW1lbnQ6IFREb2N1bWVudCA9IG5ldyBURG9jdW1lbnQoZG9jdW1lbnQpO1xuICAgICAgICBzdGF0aWMgYm9keSA9IGRvY3VtZW50LmJvZHk7XG4gICAgICAgIGh0bWxEb2M6IERvY3VtZW50O1xuICAgICAgICBjb25zdHJ1Y3RvcihodG1sRG9jOiBEb2N1bWVudCkge1xuICAgICAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5odG1sRG9jID0gaHRtbERvYztcbiAgICAgICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVE1ldGFEb2N1bWVudCBleHRlbmRzIFRNZXRhT2JqZWN0IHtcbiAgICAgICAgc3RhdGljIHJlYWRvbmx5IG1ldGFjbGFzczogVE1ldGFEb2N1bWVudCA9IG5ldyBUTWV0YURvY3VtZW50KFRNZXRhT2JqZWN0Lm1ldGFjbGFzcywgJ1REb2N1bWVudCcpO1xuXG4gICAgICAgIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihzdXBlckNsYXNzOiBUTWV0YU9iamVjdCwgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoc3VwZXJDbGFzcywgbmFtZSk7XG4gICAgICAgICAgICAgICAgLy8gZXQgdm91cyBjaGFuZ2V6IGp1c3RlIGxlIG5vbSA6XG4gICAgICAgIH1cbiAgICAgICAgZ2V0TWV0YWNsYXNzKCk6IFRNZXRhRG9jdW1lbnQge1xuICAgICAgICAgICAgICAgIHJldHVybiBUTWV0YURvY3VtZW50Lm1ldGFjbGFzcztcbiAgICAgICAgfVxufVxuXG4vKlxudHlwZSBDb250YWluZXJQcm9wcyA9IENvbXBvbmVudFByb3BzICYge1xuICAgICAgICAvL2NhcHRpb24/OiBzdHJpbmc7XG4gICAgICAgIC8vZW5hYmxlZD86IGJvb2xlYW47XG4gICAgICAgIC8vY29sb3I/OiBUQ29sb3I7IC8vIG91IFRDb2xvciwgZXRjLlxufTtcbiovXG5cbi8vIFRoaXMgY2xhcyBkb2VzIG5vdCBkbyBhbnl0aGluZyBleGNlcHQgb3ZlcnJpZGVzIGFsbG93c0NoaWxkcmVuKClcbmV4cG9ydCBjbGFzcyBUQ29udGFpbmVyIGV4dGVuZHMgVENvbXBvbmVudCB7XG4gICAgICAgIGdldE1ldGFjbGFzcygpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFDb250YWluZXIubWV0YWNsYXNzO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9wcml2YXRlIGdldCBjcHJvcHMoKTogQ29udGFpbmVyUHJvcHMge1xuICAgICAgICAvL3JldHVybiB0aGlzLnByb3BzIGFzIENvbnRhaW5lclByb3BzO1xuICAgICAgICAvL31cblxuICAgICAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIGZvcm06IFRGb3JtIHwgbnVsbCwgcGFyZW50OiBUQ29tcG9uZW50IHwgbnVsbCkge1xuICAgICAgICAgICAgICAgIHN1cGVyKG5hbWUsIGZvcm0sIHBhcmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBzeW5jRG9tRnJvbVByb3BzKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVsID0gdGhpcy5odG1sRWxlbWVudDtcbiAgICAgICAgICAgICAgICBpZiAoIWVsKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICBzdXBlci5zeW5jRG9tRnJvbVByb3BzKCk7XG4gICAgICAgIH1cblxuICAgICAgICBhbGxvd3NDaGlsZHJlbigpOiBib29sZWFuIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVE1ldGFDb250YWluZXIgZXh0ZW5kcyBUTWV0YUNvbXBvbmVudCB7XG4gICAgICAgIHN0YXRpYyByZWFkb25seSBtZXRhY2xhc3M6IFRNZXRhQ29udGFpbmVyID0gbmV3IFRNZXRhQ29udGFpbmVyKFRNZXRhQ29tcG9uZW50Lm1ldGFjbGFzcywgJ1RDb250YWluZXInKTtcblxuICAgICAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3Ioc3VwZXJDbGFzczogVE1ldGFDb21wb25lbnQsIG5hbWU6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHN1cGVyKHN1cGVyQ2xhc3MsIG5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGdldE1ldGFjbGFzcygpOiBUTWV0YUNvbnRhaW5lciB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhQ29udGFpbmVyLm1ldGFjbGFzcztcbiAgICAgICAgfVxuXG4gICAgICAgIGNyZWF0ZShuYW1lOiBzdHJpbmcsIGZvcm06IFRGb3JtLCBwYXJlbnQ6IFRDb21wb25lbnQpOiBUQ29udGFpbmVyIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRDb250YWluZXIobmFtZSwgZm9ybSwgcGFyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlZlByb3BzKCk6IFByb3BTcGVjPGFueT5bXSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8veyBuYW1lOiAnY2FwdGlvbicsIGtpbmQ6ICdzdHJpbmcnLCBhcHBseTogKG8sIHYpID0+IChvLmNhcHRpb24gPSBTdHJpbmcodikpIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3sgbmFtZTogJ2VuYWJsZWQnLCBraW5kOiAnYm9vbGVhbicsIGFwcGx5OiAobywgdikgPT4gKG8uZW5hYmxlZCA9IEJvb2xlYW4odikpIH1cbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICB9XG59XG5cbi8qXG50eXBlIFBhbmVsUHJvcHMgPSBDb250YWluZXJQcm9wcyAmIHtcbiAgICAgICAgLy9jYXB0aW9uPzogc3RyaW5nO1xuICAgICAgICAvL2VuYWJsZWQ/OiBib29sZWFuO1xuICAgICAgICAvL2NvbG9yPzogVENvbG9yOyAvLyBvdSBUQ29sb3IsIGV0Yy5cbn07XG4qL1xuXG4vLyBUaGlzIGNsYXNzIGRvZXMgbm90IGRvIGFueXRoaW5nIHVzZWZ1bFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZXhwb3J0IGNsYXNzIFRQYW5lbCBleHRlbmRzIFRDb250YWluZXIge1xuICAgICAgICBnZXRNZXRhY2xhc3MoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhUGFuZWwubWV0YWNsYXNzO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9wcm90ZWN0ZWQgZ2V0IHBwcm9wcygpOiBQYW5lbFByb3BzIHtcbiAgICAgICAgLy9yZXR1cm4gdGhpcy5wcm9wcyBhcyBQYW5lbFByb3BzO1xuICAgICAgICAvL31cblxuICAgICAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIGZvcm06IFRGb3JtIHwgbnVsbCwgcGFyZW50OiBUQ29tcG9uZW50IHwgbnVsbCkge1xuICAgICAgICAgICAgICAgIHN1cGVyKG5hbWUsIGZvcm0sIHBhcmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgc3luY0RvbUZyb21Qcm9wcygpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlbCA9IHRoaXMuaHRtbEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgaWYgKCFlbCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgc3VwZXIuc3luY0RvbUZyb21Qcm9wcygpO1xuICAgICAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUTWV0YVBhbmVsIGV4dGVuZHMgVE1ldGFDb250YWluZXIge1xuICAgICAgICBzdGF0aWMgcmVhZG9ubHkgbWV0YWNsYXNzOiBUTWV0YVBhbmVsID0gbmV3IFRNZXRhUGFuZWwoVE1ldGFDb250YWluZXIubWV0YWNsYXNzLCAnVFBhbmVsJyk7XG5cbiAgICAgICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHN1cGVyQ2xhc3M6IFRNZXRhUGFuZWwsIG5hbWU6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHN1cGVyKHN1cGVyQ2xhc3MsIG5hbWUpO1xuICAgICAgICAgICAgICAgIC8vIGV0IHZvdXMgY2hhbmdleiBqdXN0ZSBsZSBub20gOlxuICAgICAgICB9XG4gICAgICAgIGdldE1ldGFjbGFzcygpOiBUTWV0YVBhbmVsIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFQYW5lbC5tZXRhY2xhc3M7XG4gICAgICAgIH1cblxuICAgICAgICBjcmVhdGUobmFtZTogc3RyaW5nLCBmb3JtOiBURm9ybSwgcGFyZW50OiBUQ29tcG9uZW50KTogVFBhbmVsIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRQYW5lbChuYW1lLCBmb3JtLCBwYXJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVmUHJvcHMoKTogUHJvcFNwZWM8VFBhbmVsPltdIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICAgICAgLy97IG5hbWU6ICdjYXB0aW9uJywga2luZDogJ3N0cmluZycsIGFwcGx5OiAobywgdikgPT4gKG8uY2FwdGlvbiA9IFN0cmluZyh2KSkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8veyBuYW1lOiAnZW5hYmxlZCcsIGtpbmQ6ICdib29sZWFuJywgYXBwbHk6IChvLCB2KSA9PiAoby5lbmFibGVkID0gQm9vbGVhbih2KSkgfVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgIH1cbn1cblxuLypcbnR5cGUgRm9ybVByb3BzID0gQ29udGFpbmVyUHJvcHMgJiB7XG4gICAgICAgIC8vY2FwdGlvbj86IHN0cmluZztcbiAgICAgICAgLy9lbmFibGVkPzogYm9vbGVhbjtcbiAgICAgICAgLy9jb2xvcj86IFRDb2xvcjsgLy8gb3UgVENvbG9yLCBldGMuXG59O1xuKi9cblxuZXhwb3J0IGNsYXNzIFRNZXRhRm9ybSBleHRlbmRzIFRNZXRhQ29udGFpbmVyIHtcbiAgICAgICAgc3RhdGljIHJlYWRvbmx5IG1ldGFjbGFzczogVE1ldGFGb3JtID0gbmV3IFRNZXRhRm9ybShUTWV0YUNvbXBvbmVudC5tZXRhY2xhc3MsICdURm9ybScpO1xuICAgICAgICBnZXRNZXRhQ2xhc3MoKTogVE1ldGFGb3JtIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFGb3JtLm1ldGFjbGFzcztcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihzdXBlckNsYXNzOiBUTWV0YUNvbXBvbmVudCwgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoc3VwZXJDbGFzcywgbmFtZSk7XG4gICAgICAgICAgICAgICAgLy8gZXQgdm91cyBjaGFuZ2V6IGp1c3RlIGxlIG5vbSA6XG4gICAgICAgIH1cblxuICAgICAgICBjcmVhdGUobmFtZTogc3RyaW5nLCBmb3JtOiBURm9ybSwgcGFyZW50OiBUQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBURm9ybShuYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlZlByb3BzKCk6IFByb3BTcGVjPFRGb3JtPltdIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICAgICAgLy97IG5hbWU6ICdjYXB0aW9uJywga2luZDogJ3N0cmluZycsIGFwcGx5OiAobywgdikgPT4gKG8uY2FwdGlvbiA9IFN0cmluZyh2KSkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8veyBuYW1lOiAnZW5hYmxlZCcsIGtpbmQ6ICdib29sZWFuJywgYXBwbHk6IChvLCB2KSA9PiAoby5lbmFibGVkID0gQm9vbGVhbih2KSkgfVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRGb3JtIGV4dGVuZHMgVENvbnRhaW5lciB7XG4gICAgICAgIGdldE1ldGFjbGFzcygpOiBUTWV0YUZvcm0ge1xuICAgICAgICAgICAgICAgIHJldHVybiBUTWV0YUZvcm0ubWV0YWNsYXNzO1xuICAgICAgICB9XG4gICAgICAgIHN0YXRpYyBmb3JtcyA9IG5ldyBNYXA8c3RyaW5nLCBURm9ybT4oKTtcbiAgICAgICAgcHJpdmF0ZSBfbW91bnRlZCA9IGZhbHNlO1xuICAgICAgICAvLyBFYWNoIEZvcm0gaGFzIGl0cyBvd24gY29tcG9uZW50UmVnaXN0cnlcbiAgICAgICAgY29tcG9uZW50UmVnaXN0cnk6IFRDb21wb25lbnRSZWdpc3RyeSA9IG5ldyBUQ29tcG9uZW50UmVnaXN0cnkoKTtcbiAgICAgICAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIobmFtZSwgbnVsbCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgdGhpcy5mb3JtID0gdGhpcztcbiAgICAgICAgICAgICAgICBURm9ybS5mb3Jtcy5zZXQobmFtZSwgdGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBnZXQgYXBwbGljYXRpb24oKTogVEFwcGxpY2F0aW9uIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mb3JtPy5hcHBsaWNhdGlvbiA/PyBUQXBwbGljYXRpb24uVGhlQXBwbGljYXRpb247XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFbmdsaXNoIGNvbW1lbnRzIGFzIHJlcXVlc3RlZC5cblxuICAgICAgICBmaW5kRm9ybUZyb21FdmVudFRhcmdldCh0YXJnZXQ6IEVsZW1lbnQpOiBURm9ybSB8IG51bGwge1xuICAgICAgICAgICAgICAgIC8vIDEpIEZpbmQgdGhlIG5lYXJlc3QgZWxlbWVudCB0aGF0IGxvb2tzIGxpa2UgYSBmb3JtIGNvbnRhaW5lclxuICAgICAgICAgICAgICAgIGNvbnN0IGZvcm1FbGVtID0gdGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWNvbXBvbmVudD1cIlRGb3JtXCJdW2RhdGEtbmFtZV0nKSBhcyBFbGVtZW50IHwgbnVsbDtcbiAgICAgICAgICAgICAgICBpZiAoIWZvcm1FbGVtKSByZXR1cm4gbnVsbDtcblxuICAgICAgICAgICAgICAgIC8vIDIpIFJlc29sdmUgdGhlIFRGb3JtIGluc3RhbmNlXG4gICAgICAgICAgICAgICAgY29uc3QgZm9ybU5hbWUgPSBmb3JtRWxlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbmFtZScpO1xuICAgICAgICAgICAgICAgIGlmICghZm9ybU5hbWUpIHJldHVybiBudWxsO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIFRGb3JtLmZvcm1zLmdldChmb3JtTmFtZSkgPz8gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2FjOiBBYm9ydENvbnRyb2xsZXIgfCBudWxsID0gbnVsbDtcblxuICAgICAgICBpbnN0YWxsRXZlbnRSb3V0ZXIoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWM/LmFib3J0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWMgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgeyBzaWduYWwgfSA9IHRoaXMuX2FjO1xuXG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vdCA9IHRoaXMuZWxlbSBhcyBFbGVtZW50IHwgbnVsbDtcbiAgICAgICAgICAgICAgICBpZiAoIXJvb3QpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIC8vIHNhbWUgaGFuZGxlciBmb3IgZXZlcnlib2R5XG4gICAgICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IChldjogRXZlbnQpID0+IHRoaXMuZGlzcGF0Y2hEb21FdmVudChldik7XG5cbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHR5cGUgb2YgWydjbGljaycsICdpbnB1dCcsICdjaGFuZ2UnLCAna2V5ZG93biddKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb290LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgaGFuZGxlciwgeyBjYXB0dXJlOiB0cnVlLCBzaWduYWwgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB0eXBlIGluIHRoaXMuZ2V0TWV0YWNsYXNzKCkuZG9tRXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb290LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgaGFuZGxlciwgeyBjYXB0dXJlOiB0cnVlLCBzaWduYWwgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZGlzcG9zZUV2ZW50Um91dGVyKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FjPy5hYm9ydCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FjID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdlIHJlY2VpdmVkIGFuIERPTSBFdmVudC4gRGlzcGF0Y2ggaXRcbiAgICAgICAgcHJpdmF0ZSBkaXNwYXRjaERvbUV2ZW50KGV2OiBFdmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldEVsZW0gPSBldi50YXJnZXQgYXMgRWxlbWVudCB8IG51bGw7XG4gICAgICAgICAgICAgICAgaWYgKCF0YXJnZXRFbGVtKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICBjb25zdCBwcm9wTmFtZSA9IGBvbiR7ZXYudHlwZX1gO1xuXG4gICAgICAgICAgICAgICAgbGV0IGVsOiBFbGVtZW50IHwgbnVsbCA9IHRhcmdldEVsZW0uY2xvc2VzdCgnW2RhdGEtY29tcG9uZW50XScpO1xuICAgICAgICAgICAgICAgIGlmICghZWwpIHJldHVybjtcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLW5hbWUnKTtcbiAgICAgICAgICAgICAgICBsZXQgY29tcCA9IG5hbWUgPyB0aGlzLmNvbXBvbmVudFJlZ2lzdHJ5LmdldChuYW1lKSA6IG51bGw7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGNvbXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSBjb21wLmdldFByb3A8VEhhbmRsZXI+KHByb3BOYW1lKTsgLy8gPDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY29uc3QgaGFuZGxlciA9IGNvbXAuZ2V0UHJvcGVydHkocHJvcE5hbWUpOyAvL2NvbXA/LnByb3BzW3Byb3BOYW1lIGFzIGtleW9mIHR5cGVvZiBjb21wLnByb3BzXSBhcyBUSGFuZGxlciB8IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGFuZGxlciAmJiBoYW5kbGVyLnMgJiYgaGFuZGxlci5zICE9ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXIuZmlyZSh0aGlzLCBwcm9wTmFtZSwgZXYsIGNvbXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2VsID0gbmV4dCA/PyBlbC5wYXJlbnRFbGVtZW50Py5jbG9zZXN0KCdbZGF0YS1jb21wb25lbnRdJykgPz8gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXAgPSBjb21wLnBhcmVudDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBObyBoYW5kbGVyIGhlcmU6IHRyeSBnb2luZyBcInVwXCIgdXNpbmcgeW91ciBjb21wb25lbnQgdHJlZSBpZiBwb3NzaWJsZVxuICAgICAgICB9XG5cbiAgICAgICAgc2hvdygpIHtcbiAgICAgICAgICAgICAgICAvLyBNdXN0IGJlIGRvbmUgYmVmb3JlIGJ1aWxkQ29tcG9uZW50VHJlZSgpIGJlY2F1c2UgYGJ1aWxkQ29tcG9uZW50VHJlZSgpYCBkb2VzIG5vdCBkbyBgcmVzb2x2ZVJvb3QoKWAgaXRzZWxmLlxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5lbGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVsZW0gPSB0aGlzLmNvbXBvbmVudFJlZ2lzdHJ5LnJlc29sdmVSb290KCk7IC8vIG91IHRoaXMucmVzb2x2ZVJvb3QoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX21vdW50ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29tcG9uZW50UmVnaXN0cnkuYnVpbGRDb21wb25lbnRUcmVlKHRoaXMsIHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkNyZWF0ZSgpOyAvLyBNYXliZSBjb3VsZCBiZSBkb25lIGFmdGVyIGluc3RhbGxFdmVudFJvdXRlcigpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluc3RhbGxFdmVudFJvdXRlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fbW91bnRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMub25TaG93bigpO1xuXG4gICAgICAgICAgICAgICAgLy8gVE9ET1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ3JlYXRlKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9uU2hvd25OYW1lID0gdGhpcy5lbGVtIS5nZXRBdHRyaWJ1dGUoJ2RhdGEtb25jcmVhdGUnKTtcbiAgICAgICAgICAgICAgICBpZiAob25TaG93bk5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTWljcm90YXNrKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZm4gPSAodGhpcyBhcyBhbnkpW29uU2hvd25OYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJykgZm4uY2FsbCh0aGlzLCBudWxsLCB0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvblNob3duKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9uU2hvd25OYW1lID0gdGhpcy5lbGVtIS5nZXRBdHRyaWJ1dGUoJ2RhdGEtb25zaG93bicpO1xuICAgICAgICAgICAgICAgIGlmIChvblNob3duTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVNaWNyb3Rhc2soKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmbiA9ICh0aGlzIGFzIGFueSlbb25TaG93bk5hbWVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSBmbi5jYWxsKHRoaXMsIG51bGwsIHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG59XG5cbi8qXG50eXBlIEJ1dHRvblByb3BzID0gQ29tcG9uZW50UHJvcHMgJiB7XG4gICAgICAgIGNhcHRpb24/OiBzdHJpbmc7XG4gICAgICAgIGVuYWJsZWQ/OiBib29sZWFuO1xuICAgICAgICAvL2NvbG9yPzogVENvbG9yOyAvLyBvdSBUQ29sb3IsIGV0Yy5cbn07XG4qL1xuXG5leHBvcnQgY2xhc3MgVEJ1dHRvbiBleHRlbmRzIFRDb21wb25lbnQge1xuICAgICAgICBnZXRNZXRhY2xhc3MoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhQnV0dG9uLm1ldGFjbGFzcztcbiAgICAgICAgfVxuXG4gICAgICAgIGh0bWxCdXR0b24oKTogSFRNTEJ1dHRvbkVsZW1lbnQge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmh0bWxFbGVtZW50ISBhcyBIVE1MQnV0dG9uRWxlbWVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIF9jYXB0aW9uOiBzdHJpbmcgPSAnJztcbiAgICAgICAgX2VuYWJsZWQ6IGJvb2xlYW4gPSB0cnVlO1xuICAgICAgICAvKlxuICAgICAgICBwcm90ZWN0ZWQgZ2V0IGJwcm9wcygpOiBCdXR0b25Qcm9wcyB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMgYXMgQnV0dG9uUHJvcHM7XG4gICAgICAgIH1cbiAgICAgICAgICAgICAgICAqL1xuXG4gICAgICAgIGdldCBjYXB0aW9uKCk6IHN0cmluZyB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NhcHRpb247XG4gICAgICAgIH1cbiAgICAgICAgc2V0IGNhcHRpb24oY2FwdGlvbjogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FwdGlvbiA9IGNhcHRpb247XG4gICAgICAgICAgICAgICAgY29uc3QgZWwgPSB0aGlzLmh0bWxFbGVtZW50O1xuICAgICAgICAgICAgICAgIGlmICghZWwpIHJldHVybjtcbiAgICAgICAgICAgICAgICBlbC50ZXh0Q29udGVudCA9IHRoaXMuY2FwdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIGdldCBlbmFibGVkKCk6IGJvb2xlYW4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9lbmFibGVkID8/IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IGVuYWJsZWQoZW5hYmxlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2VuYWJsZWQgPSBlbmFibGVkO1xuICAgICAgICAgICAgICAgIHRoaXMuaHRtbEJ1dHRvbigpLmRpc2FibGVkID0gIWVuYWJsZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIGZvcm06IFRGb3JtLCBwYXJlbnQ6IFRDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICBzdXBlcihuYW1lLCBmb3JtLCBwYXJlbnQpO1xuICAgICAgICB9XG4gICAgICAgIHN5bmNEb21Gcm9tUHJvcHMoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZWwgPSB0aGlzLmh0bWxFbGVtZW50O1xuICAgICAgICAgICAgICAgIGlmICghZWwpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIGVsLnRleHRDb250ZW50ID0gdGhpcy5jYXB0aW9uO1xuICAgICAgICAgICAgICAgIHRoaXMuaHRtbEJ1dHRvbigpLmRpc2FibGVkID0gIXRoaXMuZW5hYmxlZDtcbiAgICAgICAgICAgICAgICBzdXBlci5zeW5jRG9tRnJvbVByb3BzKCk7XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRNZXRhQnV0dG9uIGV4dGVuZHMgVE1ldGFDb21wb25lbnQge1xuICAgICAgICBzdGF0aWMgcmVhZG9ubHkgbWV0YWNsYXNzOiBUTWV0YUJ1dHRvbiA9IG5ldyBUTWV0YUJ1dHRvbihUTWV0YUNvbXBvbmVudC5tZXRhY2xhc3MsICdUQnV0dG9uJyk7XG5cbiAgICAgICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHN1cGVyQ2xhc3M6IFRNZXRhQ29tcG9uZW50LCBuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICBzdXBlcihzdXBlckNsYXNzLCBuYW1lKTtcbiAgICAgICAgICAgICAgICAvLyBldCB2b3VzIGNoYW5nZXoganVzdGUgbGUgbm9tIDpcbiAgICAgICAgfVxuICAgICAgICBnZXRNZXRhY2xhc3MoKTogVE1ldGFCdXR0b24ge1xuICAgICAgICAgICAgICAgIHJldHVybiBUTWV0YUJ1dHRvbi5tZXRhY2xhc3M7XG4gICAgICAgIH1cblxuICAgICAgICBjcmVhdGUobmFtZTogc3RyaW5nLCBmb3JtOiBURm9ybSwgcGFyZW50OiBUQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUQnV0dG9uKG5hbWUsIGZvcm0sIHBhcmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBkZWZQcm9wcygpOiBQcm9wU3BlYzxUQnV0dG9uPltdIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnY2FwdGlvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXRyaWV2ZTogKG8pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gby5jYXB0aW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBseTogKG8sIHYpID0+IChvLmNhcHRpb24gPSBTdHJpbmcodikpXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnZW5hYmxlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ6ICdib29sZWFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0cmlldmU6IChvKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG8uZW5hYmxlZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwbHk6IChvLCB2KSA9PiAoby5lbmFibGVkID0gQm9vbGVhbih2KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUTWV0YUFwcGxpY2F0aW9uIGV4dGVuZHMgVE1ldGFjbGFzcyB7XG4gICAgICAgIHN0YXRpYyByZWFkb25seSBtZXRhY2xhc3M6IFRNZXRhQXBwbGljYXRpb24gPSBuZXcgVE1ldGFBcHBsaWNhdGlvbihUTWV0YWNsYXNzLm1ldGFjbGFzcywgJ1RBcHBsaWNhdGlvbicpO1xuXG4gICAgICAgIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihzdXBlckNsYXNzOiBUTWV0YWNsYXNzLCBuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICBzdXBlcihzdXBlckNsYXNzLCBuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBnZXRNZXRhY2xhc3MoKTogVE1ldGFBcHBsaWNhdGlvbiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhQXBwbGljYXRpb24ubWV0YWNsYXNzO1xuICAgICAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUQXBwbGljYXRpb24ge1xuICAgICAgICBnZXRNZXRhY2xhc3MoKTogVE1ldGFBcHBsaWNhdGlvbiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhQXBwbGljYXRpb24ubWV0YWNsYXNzO1xuICAgICAgICB9XG4gICAgICAgIHN0YXRpYyBUaGVBcHBsaWNhdGlvbjogVEFwcGxpY2F0aW9uO1xuICAgICAgICAvL3N0YXRpYyBwbHVnaW5SZWdpc3RyeSA9IG5ldyBQbHVnaW5SZWdpc3RyeSgpO1xuICAgICAgICAvL3BsdWdpbnM6IElQbHVnaW5SZWdpc3RyeTtcbiAgICAgICAgcHJpdmF0ZSBmb3JtczogVEZvcm1bXSA9IFtdO1xuICAgICAgICByZWFkb25seSB0eXBlcyA9IG5ldyBUQ29tcG9uZW50VHlwZVJlZ2lzdHJ5KCk7XG4gICAgICAgIG1haW5Gb3JtOiBURm9ybSB8IG51bGwgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgICAgIFRBcHBsaWNhdGlvbi5UaGVBcHBsaWNhdGlvbiA9IHRoaXM7XG4gICAgICAgICAgICAgICAgcmVnaXN0ZXJCdWlsdGlucyh0aGlzLnR5cGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNyZWF0ZUZvcm08VCBleHRlbmRzIFRGb3JtPihjdG9yOiBuZXcgKC4uLmFyZ3M6IGFueVtdKSA9PiBULCBuYW1lOiBzdHJpbmcpOiBUIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmID0gbmV3IGN0b3IobmFtZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5mb3Jtcy5wdXNoKGYpO1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5tYWluRm9ybSkgdGhpcy5tYWluRm9ybSA9IGY7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGY7XG4gICAgICAgIH1cblxuICAgICAgICBydW4oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ydW5XaGVuRG9tUmVhZHkoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubWFpbkZvcm0pIHRoaXMubWFpbkZvcm0uc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB0aGlzLmF1dG9TdGFydCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIGF1dG9TdGFydCgpIHtcbiAgICAgICAgICAgICAgICAvLyBmYWxsYmFjazogY2hvaXNpciB1bmUgZm9ybSBlbnJlZ2lzdHJcdTAwRTllLCBvdSBjclx1MDBFOWVyIHVuZSBmb3JtIGltcGxpY2l0ZVxuICAgICAgICB9XG5cbiAgICAgICAgcnVuV2hlbkRvbVJlYWR5KGZuOiAoKSA9PiB2b2lkKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdsb2FkaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmbiwgeyBvbmNlOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gUExVR0lOSE9TVCA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBjbGFzcyBUTWV0YVBsdWdpbkhvc3QgZXh0ZW5kcyBUTWV0YUNvbXBvbmVudCB7XG4gICAgICAgIHN0YXRpYyBtZXRhY2xhc3MgPSBuZXcgVE1ldGFQbHVnaW5Ib3N0KFRNZXRhQ29tcG9uZW50Lm1ldGFjbGFzcywgJ1RQbHVnaW5Ib3N0Jyk7XG4gICAgICAgIGdldE1ldGFjbGFzcygpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFQbHVnaW5Ib3N0Lm1ldGFjbGFzcztcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihzdXBlckNsYXNzOiBUTWV0YWNsYXNzLCBuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICBzdXBlcihzdXBlckNsYXNzLCBuYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNyZWF0ZShuYW1lOiBzdHJpbmcsIGZvcm06IFRGb3JtLCBwYXJlbnQ6IFRDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRQbHVnaW5Ib3N0KG5hbWUsIGZvcm0sIHBhcmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm9wcygpOiBQcm9wU3BlYzxUUGx1Z2luSG9zdD5bXSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUUGx1Z2luSG9zdCBleHRlbmRzIFRDb21wb25lbnQge1xuICAgICAgICBwcml2YXRlIGluc3RhbmNlOiBVSVBsdWdpbkluc3RhbmNlIHwgbnVsbCA9IG51bGw7XG5cbiAgICAgICAgcGx1Z2luTmFtZTogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gICAgICAgIHBsdWdpblByb3BzOiBKc29uID0ge307XG4gICAgICAgIHByaXZhdGUgZmFjdG9yeTogVUlQbHVnaW5GYWN0b3J5IHwgbnVsbCA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nLCBmb3JtOiBURm9ybSwgcGFyZW50OiBUQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgc3VwZXIobmFtZSwgZm9ybSwgcGFyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhbGxlZCBieSB0aGUgbWV0YWNsYXNzIChvciBieSB5b3VyIHJlZ2lzdHJ5KSByaWdodCBhZnRlciBjcmVhdGlvblxuICAgICAgICBzZXRQbHVnaW5GYWN0b3J5KGZhY3Rvcnk6IFVJUGx1Z2luRmFjdG9yeSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZmFjdG9yeSA9IGZhY3Rvcnk7XG4gICAgICAgIH1cblxuICAgICAgICBtb3VudFBsdWdpbihwcm9wczogSnNvbiwgc2VydmljZXM6IERlbHBoaW5lU2VydmljZXMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLmh0bWxFbGVtZW50O1xuICAgICAgICAgICAgICAgIGlmICghY29udGFpbmVyKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZmFjdG9yeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VydmljZXMubG9nLndhcm4oJ1RQbHVnaW5Ib3N0OiBubyBwbHVnaW4gZmFjdG9yeSBzZXQnLCB7IGhvc3Q6IHRoaXMubmFtZSBhcyBhbnkgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gRGlzcG9zZSBvbGQgaW5zdGFuY2UgaWYgYW55XG4gICAgICAgICAgICAgICAgdGhpcy51bm1vdW50KCk7XG5cbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgcGx1Z2luIGluc3RhbmNlIHRoZW4gbW91bnRcbiAgICAgICAgICAgICAgICB0aGlzLmluc3RhbmNlID0gdGhpcy5mYWN0b3J5KHsgaG9zdDogdGhpcywgZm9ybTogdGhpcy5mb3JtISB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLmluc3RhbmNlIS5tb3VudChjb250YWluZXIsIHByb3BzLCBzZXJ2aWNlcyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYWxsZWQgYnkgYnVpbGRDb21wb25lbnRUcmVlKClcbiAgICAgICAgc2V0UGx1Z2luU3BlYyhzcGVjOiB7IHBsdWdpbjogc3RyaW5nIHwgbnVsbDsgcHJvcHM6IGFueSB9KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW5OYW1lID0gc3BlYy5wbHVnaW47XG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW5Qcm9wcyA9IHNwZWMucHJvcHMgPz8ge307XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYWxsZWQgYnkgYnVpbGRDb21wb25lbnRUcmVlKClcbiAgICAgICAgbW91bnRQbHVnaW5JZlJlYWR5KHNlcnZpY2VzOiBEZWxwaGluZVNlcnZpY2VzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29udGFpbmVyID0gdGhpcy5odG1sRWxlbWVudDtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbnRhaW5lciB8fCAhdGhpcy5mb3JtIHx8ICF0aGlzLnBsdWdpbk5hbWUpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGFwcCA9IFRBcHBsaWNhdGlvbi5UaGVBcHBsaWNhdGlvbjsgLy8gb3UgdW4gYWNjXHUwMEU4cyBcdTAwRTlxdWl2YWxlbnRcbiAgICAgICAgICAgICAgICBjb25zdCBkZWYgPSBQbHVnaW5SZWdpc3RyeS5wbHVnaW5SZWdpc3RyeS5nZXQodGhpcy5wbHVnaW5OYW1lKTtcblxuICAgICAgICAgICAgICAgIGlmICghZGVmKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlcy5sb2cud2FybignVW5rbm93biBwbHVnaW4nLCB7IHBsdWdpbjogdGhpcy5wbHVnaW5OYW1lIGFzIGFueSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLnVubW91bnQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmluc3RhbmNlID0gZGVmLmZhY3RvcnkoeyBob3N0OiB0aGlzLCBmb3JtOiB0aGlzLmZvcm0gfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZSEubW91bnQoY29udGFpbmVyLCB0aGlzLnBsdWdpblByb3BzLCBzZXJ2aWNlcyk7XG4gICAgICAgIH1cblxuICAgICAgICB1cGRhdGUocHJvcHM6IGFueSkge1xuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luUHJvcHMgPSBwcm9wcztcbiAgICAgICAgICAgICAgICB0aGlzLmluc3RhbmNlPy51cGRhdGUocHJvcHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdW5tb3VudCgpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZT8udW5tb3VudCgpO1xuICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluc3RhbmNlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IHR5cGUgVUlQbHVnaW5GYWN0b3J5PFByb3BzIGV4dGVuZHMgSnNvbiA9IEpzb24+ID0gKGFyZ3M6IHsgaG9zdDogVFBsdWdpbkhvc3Q7IGZvcm06IFRGb3JtIH0pID0+IFVJUGx1Z2luSW5zdGFuY2U8UHJvcHM+O1xuXG5leHBvcnQgaW50ZXJmYWNlIFNpemVIaW50cyB7XG4gICAgICAgIG1pbldpZHRoPzogbnVtYmVyO1xuICAgICAgICBtaW5IZWlnaHQ/OiBudW1iZXI7XG4gICAgICAgIHByZWZlcnJlZFdpZHRoPzogbnVtYmVyO1xuICAgICAgICBwcmVmZXJyZWRIZWlnaHQ/OiBudW1iZXI7XG59XG5cbmV4cG9ydCB0eXBlIFVJUGx1Z2luRGVmID0ge1xuICAgICAgICBmYWN0b3J5OiBVSVBsdWdpbkZhY3Rvcnk7XG4gICAgICAgIC8vIG9wdGlvbm5lbCA6IHVuIHNjaFx1MDBFOW1hIGRlIHByb3BzLCBhaWRlIGF1IGRlc2lnbmVyXG4gICAgICAgIC8vIHByb3BzPzogUHJvcFNjaGVtYTtcbn07XG5cbmV4cG9ydCBjbGFzcyBQbHVnaW5SZWdpc3RyeSB7XG4gICAgICAgIHN0YXRpYyBwbHVnaW5SZWdpc3RyeSA9IG5ldyBQbHVnaW5SZWdpc3RyeSgpO1xuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IHBsdWdpbnMgPSBuZXcgTWFwPHN0cmluZywgVUlQbHVnaW5EZWY+KCk7XG5cbiAgICAgICAgcmVnaXN0ZXIobmFtZTogc3RyaW5nLCBkZWY6IFVJUGx1Z2luRGVmKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGx1Z2lucy5oYXMobmFtZSkpIHRocm93IG5ldyBFcnJvcihgUGx1Z2luIGFscmVhZHkgcmVnaXN0ZXJlZDogJHtuYW1lfWApO1xuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2lucy5zZXQobmFtZSwgZGVmKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdldChuYW1lOiBzdHJpbmcpOiBVSVBsdWdpbkRlZiB8IHVuZGVmaW5lZCB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucGx1Z2lucy5nZXQobmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICBoYXMobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucGx1Z2lucy5oYXMobmFtZSk7XG4gICAgICAgIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBEQ0MgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vLyBEQ0MgPSBEZWxwaGluZSBDdXN0b20gQ29tcG9uZW50XG5cbi8qXG50eXBlIFNpbXBsZURDQ1Byb3BzID0gQ29tcG9uZW50UHJvcHMgJiB7XG4gICAgICAgIC8vY2FwdGlvbj86IHN0cmluZztcbiAgICAgICAgLy9lbmFibGVkPzogYm9vbGVhbjtcbiAgICAgICAgLy9jb2xvcj86IFRDb2xvcjsgLy8gb3UgVENvbG9yLCBldGMuXG59O1xuKi9cblxuLy8gTm90ZTogdGhpcyBjbGFzcyBkb2VzIG5vdCBkbyBhbnl0aGluZy4gUGVyaGFwcyB0aGF0IERDQyBjYW4gaGVyaXQgZGlyZWN0bHkgZnJvbSBUQ29tcG9uZW50XG5cbmV4cG9ydCBjbGFzcyBUU2ltcGxlRENDIGV4dGVuZHMgVENvbXBvbmVudCB7XG4gICAgICAgIGdldE1ldGFjbGFzcygpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFTaW1wbGVEQ0MubWV0YWNsYXNzO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nLCBmb3JtOiBURm9ybSwgcGFyZW50OiBUQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgc3VwZXIobmFtZSwgZm9ybSwgcGFyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qXG4gICAgICAgIHByb3RlY3RlZCBnZXQgZGNjcHJvcHMoKTogU2ltcGxlRENDUHJvcHMge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnByb3BzIGFzIFNpbXBsZURDQ1Byb3BzO1xuICAgICAgICB9XG4gICAgICAgICAgICAgICAgKi9cbn1cblxuZXhwb3J0IGNsYXNzIFRNZXRhU2ltcGxlRENDIGV4dGVuZHMgVE1ldGFDb21wb25lbnQge1xuICAgICAgICBzdGF0aWMgcmVhZG9ubHkgbWV0YWNsYXNzOiBUTWV0YVNpbXBsZURDQyA9IG5ldyBUTWV0YVNpbXBsZURDQyhUTWV0YUNvbXBvbmVudC5tZXRhY2xhc3MsICdUU2ltcGxlRENDJyk7XG5cbiAgICAgICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHN1cGVyQ2xhc3M6IFRNZXRhQ29tcG9uZW50LCBuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICBzdXBlcihzdXBlckNsYXNzLCBuYW1lKTtcbiAgICAgICAgICAgICAgICAvLyBldCB2b3VzIGNoYW5nZXoganVzdGUgbGUgbm9tIDpcbiAgICAgICAgfVxuICAgICAgICBnZXRNZXRhY2xhc3MoKTogVE1ldGFTaW1wbGVEQ0Mge1xuICAgICAgICAgICAgICAgIHJldHVybiBUTWV0YVNpbXBsZURDQy5tZXRhY2xhc3M7XG4gICAgICAgIH1cblxuICAgICAgICBjcmVhdGUobmFtZTogc3RyaW5nLCBmb3JtOiBURm9ybSwgcGFyZW50OiBUQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUU2ltcGxlRENDKG5hbWUsIGZvcm0sIHBhcmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBkZWZQcm9wcygpOiBQcm9wU3BlYzxUU2ltcGxlRENDPltdIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICAgICAgLy97IG5hbWU6ICdjYXB0aW9uJywga2luZDogJ3N0cmluZycsIGFwcGx5OiAobywgdikgPT4gKG8uY2FwdGlvbiA9IFN0cmluZyh2KSkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8veyBuYW1lOiAnZW5hYmxlZCcsIGtpbmQ6ICdib29sZWFuJywgYXBwbHk6IChvLCB2KSA9PiAoby5lbmFibGVkID0gQm9vbGVhbih2KSkgfVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgIH1cbn1cblxuLypcbmV4cG9ydCB0eXBlIENvbXBvc2l0ZURDQ1Byb3BzID0gQ29tcG9uZW50UHJvcHMgJiB7XG4gICAgICAgIC8vY2FwdGlvbj86IHN0cmluZztcbiAgICAgICAgLy9lbmFibGVkPzogYm9vbGVhbjtcbiAgICAgICAgLy9jb2xvcj86IFRDb2xvcjsgLy8gb3UgVENvbG9yLCBldGMuXG59O1xuKi9cblxuLy8gTm90ZTogdGhpcyBjbGFzcyBkb2VzIG5vdCBkbyBhbnl0aGluZy4gUGVyaGFwcyB0aGF0IERDQyBjYW4gaGVyaXQgZGlyZWN0bHkgZnJvbSBUQ29udGFpbmVyIG9yIFRQYW5lbFxuLy8gVENvbnRhaW5lciBvciBUUGFuZWwgPyBBY3R1YWxseSB0aGlzIGlzIG5vdCBjbGVhci4gVGhvc2UgdHdvIGNsYXNzIGRvIG5vdCBkbyBhbnl0aGluZyB1c2VmdWwgYWJvZiBUQ29tcG9uZW50XG5leHBvcnQgY2xhc3MgVENvbXBvc2l0ZURDQyBleHRlbmRzIFRDb250YWluZXIge1xuICAgICAgICBnZXRNZXRhY2xhc3MoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhQ29tcG9zaXRlRENDLm1ldGFjbGFzcztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgZm9ybTogVEZvcm0sIHBhcmVudDogVENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHN1cGVyKG5hbWUsIGZvcm0sIHBhcmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgLypcbiAgICAgICAgcHJvdGVjdGVkIGdldCBkY2Nwcm9wcygpOiBDb21wb3NpdGVEQ0NQcm9wcyB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMgYXMgQ29tcG9zaXRlRENDUHJvcHM7XG4gICAgICAgIH1cbiAgICAgICAgICAgICAgICAqL1xufVxuXG5leHBvcnQgY2xhc3MgVE1ldGFDb21wb3NpdGVEQ0MgZXh0ZW5kcyBUTWV0YUNvbXBvbmVudCB7XG4gICAgICAgIHN0YXRpYyByZWFkb25seSBtZXRhY2xhc3M6IFRNZXRhQ29tcG9zaXRlRENDID0gbmV3IFRNZXRhQ29tcG9zaXRlRENDKFRNZXRhQ29udGFpbmVyLm1ldGFjbGFzcywgJ1RDb21wb3NpdERDQycpO1xuXG4gICAgICAgIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihzdXBlckNsYXNzOiBUTWV0YUNvbXBvbmVudCwgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoc3VwZXJDbGFzcywgbmFtZSk7XG4gICAgICAgICAgICAgICAgLy8gZXQgdm91cyBjaGFuZ2V6IGp1c3RlIGxlIG5vbSA6XG4gICAgICAgIH1cbiAgICAgICAgZ2V0TWV0YWNsYXNzKCk6IFRNZXRhQ29tcG9zaXRlRENDIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFDb21wb3NpdGVEQ0MubWV0YWNsYXNzO1xuICAgICAgICB9XG5cbiAgICAgICAgY3JlYXRlKG5hbWU6IHN0cmluZywgZm9ybTogVEZvcm0sIHBhcmVudDogVENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVENvbXBvc2l0ZURDQyhuYW1lLCBmb3JtLCBwYXJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVmUHJvcHMoKTogUHJvcFNwZWM8VENvbXBvc2l0ZURDQz5bXSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8veyBuYW1lOiAnY2FwdGlvbicsIGtpbmQ6ICdzdHJpbmcnLCBhcHBseTogKG8sIHYpID0+IChvLmNhcHRpb24gPSBTdHJpbmcodikpIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3sgbmFtZTogJ2VuYWJsZWQnLCBraW5kOiAnYm9vbGVhbicsIGFwcGx5OiAobywgdikgPT4gKG8uZW5hYmxlZCA9IEJvb2xlYW4odikpIH1cbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICB9XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiIsICJleHBvcnQgY2xhc3MgTWV0YVJvb3Qge1xuICAgICAgICBzdGF0aWMgcmVhZG9ubHkgbWV0YWNsYXNzOiBNZXRhUm9vdCA9IG5ldyBNZXRhUm9vdChudWxsKTtcblxuICAgICAgICByZWFkb25seSBzdXBlckNsYXNzOiBNZXRhUm9vdCB8IG51bGw7XG4gICAgICAgIHJlYWRvbmx5IHR5cGVOYW1lOiBzdHJpbmc7XG5cbiAgICAgICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHN1cGVyQ2xhc3M6IE1ldGFSb290IHwgbnVsbCwgdHlwZU5hbWUgPSAnVE1ldGFSb290Jykge1xuICAgICAgICAgICAgICAgIHRoaXMuc3VwZXJDbGFzcyA9IHN1cGVyQ2xhc3M7XG4gICAgICAgICAgICAgICAgdGhpcy50eXBlTmFtZSA9IHR5cGVOYW1lO1xuICAgICAgICB9XG4gICAgICAgIGdldE1ldGFjbGFzcygpOiBNZXRhUm9vdCB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1ldGFSb290Lm1ldGFjbGFzcztcbiAgICAgICAgfVxufVxuXG5leHBvcnQgY2xhc3MgTWV0YVRlc3RBIGV4dGVuZHMgTWV0YVJvb3Qge1xuICAgICAgICBzdGF0aWMgcmVhZG9ubHkgbWV0YWNsYXNzOiBNZXRhVGVzdEEgPSBuZXcgTWV0YVRlc3RBKE1ldGFSb290Lm1ldGFjbGFzcyk7XG5cbiAgICAgICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHN1cGVyQ2xhc3M6IE1ldGFSb290KSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoc3VwZXJDbGFzcywgJ1Rlc3RBJyk7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0TWV0YWNsYXNzKCk6IE1ldGFUZXN0QSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1ldGFUZXN0QS5tZXRhY2xhc3M7XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1ldGFUZXN0QiBleHRlbmRzIE1ldGFUZXN0QSB7XG4gICAgICAgIHN0YXRpYyByZWFkb25seSBtZXRhY2xhc3M6IE1ldGFUZXN0QiA9IG5ldyBNZXRhVGVzdEIoTWV0YVRlc3RBLm1ldGFjbGFzcyk7XG5cbiAgICAgICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHN1cGVyQ2xhc3M6IE1ldGFUZXN0QSkge1xuICAgICAgICAgICAgICAgIHN1cGVyKHN1cGVyQ2xhc3MpO1xuICAgICAgICAgICAgICAgIC8vIGV0IHZvdXMgY2hhbmdleiBqdXN0ZSBsZSBub20gOlxuICAgICAgICAgICAgICAgICh0aGlzIGFzIGFueSkudHlwZU5hbWUgPSAnVGVzdEInO1xuICAgICAgICB9XG4gICAgICAgIGdldE1ldGFjbGFzcygpOiBNZXRhVGVzdEIge1xuICAgICAgICAgICAgICAgIHJldHVybiBNZXRhVGVzdEIubWV0YWNsYXNzO1xuICAgICAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBNZXRhVGVzdEMgZXh0ZW5kcyBNZXRhVGVzdEIge1xuICAgICAgICBzdGF0aWMgcmVhZG9ubHkgbWV0YWNsYXNzOiBNZXRhVGVzdEMgPSBuZXcgTWV0YVRlc3RDKE1ldGFUZXN0Qi5tZXRhY2xhc3MpO1xuXG4gICAgICAgIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihzdXBlckNsYXNzOiBNZXRhVGVzdEIpIHtcbiAgICAgICAgICAgICAgICBzdXBlcihzdXBlckNsYXNzKTtcbiAgICAgICAgICAgICAgICAodGhpcyBhcyBhbnkpLnR5cGVOYW1lID0gJ1Rlc3RDJztcbiAgICAgICAgfVxuXG4gICAgICAgIGdldE1ldGFjbGFzcygpOiBNZXRhVGVzdEMge1xuICAgICAgICAgICAgICAgIHJldHVybiBNZXRhVGVzdEMubWV0YWNsYXNzO1xuICAgICAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0ZXN0KCkge1xuICAgICAgICBsZXQgYzogTWV0YVJvb3QgfCBudWxsID0gTWV0YVRlc3RDLm1ldGFjbGFzcztcbiAgICAgICAgd2hpbGUgKGMpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtjLmdldE1ldGFjbGFzcygpLnR5cGVOYW1lfSAtICR7Yy50eXBlTmFtZX0gLT4gJHtjLnN1cGVyQ2xhc3M/LnR5cGVOYW1lfWApO1xuICAgICAgICAgICAgICAgIGMgPSBjLnN1cGVyQ2xhc3M7XG4gICAgICAgIH1cbn1cbiIsICIvLy8gPHJlZmVyZW5jZSBsaWI9XCJkb21cIiAvPlxuY29uc29sZS5sb2coJ0kgQU0gWkFaQScpO1xuLy9pbXBvcnQgeyBpbnN0YWxsRGVscGhpbmVSdW50aW1lIH0gZnJvbSBcIi4vc3JjL2RydFwiOyAvLyA8LS0gVFMsIHBhcyAuanNcbmltcG9ydCB7IFRGb3JtLCBUQ29sb3IsIFRBcHBsaWNhdGlvbiwgVENvbXBvbmVudCwgVEJ1dHRvbiB9IGZyb20gJ0B2Y2wnO1xuaW1wb3J0IHsgdGVzdCB9IGZyb20gJy4vdGVzdCc7XG5cbi8vaW1wb3J0IHsgQ29tcG9uZW50VHlwZVJlZ2lzdHJ5IH0gZnJvbSAnQHZjbC9TdGRDdHJscyc7XG4vL2ltcG9ydCB7IENvbXBvbmVudFJlZ2lzdHJ5IH0gZnJvbSAnQGRydC9Db21wb25lbnRSZWdpc3RyeSc7XG4vL2ltcG9ydCB7IFRQbHVnaW5Ib3N0IH0gZnJvbSAnQGRydC9VSVBsdWdpbic7XG4vKlxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyUGx1Z2luVHlwZXMocmVnOiBDb21wb25lbnRUeXBlUmVnaXN0cnkpOiB2b2lkIHtcbiAgICAgICAgLyAqXG4gICAgICAgIC8vIEV4YW1wbGU6IGFueSB0eXBlIG5hbWUgY2FuIGJlIHByb3ZpZGVkIGJ5IGEgcGx1Z2luLlxuICAgICAgICByZWcucmVnaXN0ZXIucmVnaXN0ZXJUeXBlKCdjaGFydGpzLXBpZScsIChuYW1lOiBzdHJpbmcsIGZvcm06IFRGb3JtLCBwYXJlbnQ6IFRDb21wb25lbnQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFBsdWdpbkhvc3QobmFtZSwgZm9ybSwgcGFyZW50KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVnLnJlZ2lzdGVyVHlwZSgndnVlLWhlbGxvJywgKG5hbWU6IHN0cmluZywgZm9ybTogVEZvcm0sIHBhcmVudDogVENvbXBvbmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUGx1Z2luSG9zdChuYW1lLCBmb3JtLCBwYXJlbnQpO1xuICAgICAgICB9KTtcbiAgICAgICAgKiAvXG59XG4qL1xuY29uc29sZS5sb2coJ0kgQU0gWkFaQScpO1xuXG5jbGFzcyBaYXphIGV4dGVuZHMgVEZvcm0ge1xuICAgICAgICAvLyBGb3JtIGNvbXBvbmVudHMgLSBUaGlzIGxpc3QgaXMgYXV0byBnZW5lcmF0ZWQgYnkgRGVscGhpbmVcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIC8vYnV0dG9uMSA6IFRCdXR0b24gPSBuZXcgVEJ1dHRvbihcImJ1dHRvbjFcIiwgdGhpcywgdGhpcyk7XG4gICAgICAgIC8vYnV0dG9uMiA6IFRCdXR0b24gPSBuZXcgVEJ1dHRvbihcImJ1dHRvbjJcIiwgdGhpcywgdGhpcyk7XG4gICAgICAgIC8vYnV0dG9uMyA6IFRCdXR0b24gPSBuZXcgVEJ1dHRvbihcImJ1dHRvbjNcIiwgdGhpcywgdGhpcyk7XG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHN1cGVyKG5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIC8vaW1wb3J0IHsgaW5zdGFsbERlbHBoaW5lUnVudGltZSB9IGZyb20gXCIuL2RydFwiO1xuXG4gICAgICAgIC8qXG5jb25zdCBydW50aW1lID0geyAgIFxuICBoYW5kbGVDbGljayh7IGVsZW1lbnQgfTogeyBlbGVtZW50OiBFbGVtZW50IH0pIHtcbiAgICBjb25zb2xlLmxvZyhcImNsaWNrZWQhXCIsIGVsZW1lbnQpO1xuICAgIC8vKGVsZW1lbnQgYXMgSFRNTEVsZW1lbnQpLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IFwicmVkXCI7XG4gIH0sXG59OyBcbiovXG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTXlDcmVhdGUoX2V2OiBFdmVudCB8IG51bGwsIF9zZW5kZXI6IFRDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBidG4gPSB0aGlzLmNvbXBvbmVudFJlZ2lzdHJ5LmdldCgnYnV0dG9uMicpO1xuICAgICAgICAgICAgICAgIGlmIChidG4pIGJ0bi5jb2xvciA9IFRDb2xvci5yZ2IoMCwgMCwgMjU1KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvbk15U2hvd24oX2V2OiBFdmVudCB8IG51bGwsIF9zZW5kZXI6IFRDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBidG4gPSB0aGlzLmNvbXBvbmVudFJlZ2lzdHJ5LmdldCgnYnV0dG9uMycpO1xuICAgICAgICAgICAgICAgIGlmIChidG4pIGJ0bi5jb2xvciA9IFRDb2xvci5yZ2IoMCwgMjU1LCAyNTUpO1xuICAgICAgICB9XG5cbiAgICAgICAgYnV0dG9uMV9vbmNsaWNrKF9ldjogRXZlbnQgfCBudWxsLCBfc2VuZGVyOiBUQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYnRuID0gdGhpcy5jb21wb25lbnRSZWdpc3RyeS5nZXQ8VEJ1dHRvbj4oJ2J1dHRvbjEnKTtcbiAgICAgICAgICAgICAgICBpZiAoIWJ0bikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdidXR0b24xIG5vdCBmb3VuZCBpbiByZWdpc3RyeScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvL2J0bi5jb2xvciA9IFRDb2xvci5yZ2IoMCwgMCwgMjU1KTtcbiAgICAgICAgICAgICAgICBidG4hLmNvbG9yID0gVENvbG9yLnJnYigyNTUsIDAsIDApO1xuICAgICAgICAgICAgICAgIGJ0biEuY2FwdGlvbiA9ICdNSU1JJztcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQnV0dG9uMSBjbGlja2VkISEhIScpO1xuICAgICAgICB9XG5cbiAgICAgICAgemF6YV9vbmNsaWNrKF9ldjogRXZlbnQgfCBudWxsLCBfc2VuZGVyOiBUQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYnRuID0gdGhpcy5jb21wb25lbnRSZWdpc3RyeS5nZXQ8VEJ1dHRvbj4oJ2J1dHRvbngnKTtcbiAgICAgICAgICAgICAgICBidG4hLmNvbG9yID0gVENvbG9yLnJnYigwLCAyNTUsIDApO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd6YXphIGNsaWNrZWQhISEhJyk7XG4gICAgICAgICAgICAgICAgLy9idG4hLmVuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vaW5zdGFsbERlbHBoaW5lUnVudGltZShydW50aW1lKTtcbn0gLy8gY2xhc3MgemF6YVxuXG5jbGFzcyBNeUFwcGxpY2F0aW9uIGV4dGVuZHMgVEFwcGxpY2F0aW9uIHtcbiAgICAgICAgemF6YTogWmF6YTtcblxuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgICAgICBzdXBlcigpO1xuICAgICAgICAgICAgICAgIHRoaXMuemF6YSA9IG5ldyBaYXphKCd6YXphJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5tYWluRm9ybSA9IHRoaXMuemF6YTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJ1bigpIHtcbiAgICAgICAgICAgICAgICAvL3RoaXMuemF6YS5jb21wb25lbnRSZWdpc3RyeS5idWlsZENvbXBvbmVudFRyZWUodGhpcy56YXphKTtcbiAgICAgICAgICAgICAgICAvL3RoaXMuemF6YS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycpO1xuXG4gICAgICAgICAgICAgICAgLy8gYXUgbGFuY2VtZW50XG4gICAgICAgICAgICAgICAgdGhpcy5ydW5XaGVuRG9tUmVhZHkoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy56YXphLnNob3coKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxufSAvLyBjbGFzcyBNeUFwcGxpY2F0aW9uXG5cbmNvbnN0IG15QXBwbGljYXRpb246IE15QXBwbGljYXRpb24gPSBuZXcgTXlBcHBsaWNhdGlvbigpO1xudGVzdCgpO1xubXlBcHBsaWNhdGlvbi5ydW4oKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7O0FBT08sU0FBUyxpQkFBaUIs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QUFVO0FBQ25DLFNBQU8sR0FBRztBQUNGLFlBQVEsSUFBSSxHQUFHLEVBQUUsYUFBYSxFQUFFLFFBQVEsTUFBTSxFQUFFLFFBQVEsT0FBTyxFQUFFLFlBQVksUUFBUSxFQUFFO0FBQ3ZGLFFBQUksRUFBRTtBQUFBLEVBQ2Q7QUFDUjs7O0FDekRBLFFBQVEsSUFBSSxXQUFXO0FBc0J2QixRQUFRLElBQUksV0FBVztBQUV2QixJQUFNLE9BQU4sY0FBbUJLLE9BQU07QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQVFqQixZQUFZLE1BQWM7QUFDbEIsVUFBTSxJQUFJO0FBQUEsRUFDbEI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQVlVLFdBQVcsS0FBbUIsU0FBcUI7QUFDckQsVUFBTSxNQUFNLEtBQUssa0JBQWtCLElBQUksU0FBUztBQUNoRCxRQUFJLElBQUssS0FBSSxRQUFRLE9BQU8sSUFBSSxHQUFHLEdBQUcsR0FBRztBQUFBLEVBQ2pEO0FBQUEsRUFFVSxVQUFVLEtBQW1CLFNBQXFCO0FBQ3BELFVBQU0sTUFBTSxLQUFLLGtCQUFrQixJQUFJLFNBQVM7QUFDaEQsUUFBSSxJQUFLLEtBQUksUUFBUSxPQUFPLElBQUksR0FBRyxLQUFLLEdBQUc7QUFBQSxFQUNuRDtBQUFBLEVBRUEsZ0JBQWdCLEtBQW1CLFNBQXFCO0FBQ2hELFVBQU0sTUFBTSxLQUFLLGtCQUFrQixJQUFhLFNBQVM7QUFDekQsUUFBSSxDQUFDLEtBQUs7QUFDRixjQUFRLEtBQUssK0JBQStCO0FBQzVDO0FBQUEsSUFDUjtBQUVBLFFBQUssUUFBUSxPQUFPLElBQUksS0FBSyxHQUFHLENBQUM7QUFDakMsUUFBSyxVQUFVO0FBQ2YsWUFBUSxJQUFJLHFCQUFxQjtBQUFBLEVBQ3pDO0FBQUEsRUFFQSxhQUFhLEtBQW1CLFNBQXFCO0FBQzdDLFVBQU0sTUFBTSxLQUFLLGtCQUFrQixJQUFhLFNBQVM7QUFDekQsUUFBSyxRQUFRLE9BQU8sSUFBSSxHQUFHLEtBQUssQ0FBQztBQUNqQyxZQUFRLElBQUksa0JBQWtCO0FBQUEsRUFFdEM7QUFBQTtBQUdSO0FBRUEsSUFBTSxnQkFBTixjQUE0QixhQUFhO0FBQUEsRUFHakMsY0FBYztBQUNOLFVBQU07QUFIZDtBQUlRLFNBQUssT0FBTyxJQUFJLEtBQUssTUFBTTtBQUMzQixTQUFLLFdBQVcsS0FBSztBQUFBLEVBQzdCO0FBQUEsRUFFQSxNQUFNO0FBS0UsU0FBSyxnQkFBZ0IsTUFBTTtBQUNuQixXQUFLLEtBQUssS0FBSztBQUFBLElBQ3ZCLENBQUM7QUFBQSxFQUNUO0FBQ1I7QUFFQSxJQUFNLGdCQUErQixJQUFJLGNBQWM7QUFDdkQsS0FBSztBQUNMLGNBQWMsSUFBSTsiLAogICJuYW1lcyI6IFsiVENvbXBvbmVudCIsICJUTWV0YUNvbXBvbmVudCIsICJUQ29tcG9uZW50VHlwZVJlZ2lzdHJ5IiwgImVsIiwgIlRGb3JtIiwgIlRCdXR0b24iLCAiVEZvcm0iXQp9Cg==
