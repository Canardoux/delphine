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
  }
  //_toto: Toto = new Toto();
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
      maybeHost.mountPluginIfReady();
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

// src/vcl/plugin.ts
var Toto = class {
  constructor() {
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
};
var toto = new Toto();
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
  defProps() {
    return [];
  }
};
__publicField(_TMetaPluginHost, "metaclass", new _TMetaPluginHost(TMetaComponent.metaclass, "TPluginHost"));
var TMetaPluginHost = _TMetaPluginHost;
function safeParseJson(s) {
  if (!s) return {};
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}
function stableStringify(v) {
  try {
    return JSON.stringify(v);
  } catch {
    return "";
  }
}
var TPluginHost = class extends TComponent {
  constructor() {
    super(...arguments);
    __publicField(this, "instance", null);
    __publicField(this, "services", null);
    __publicField(this, "pluginName", null);
    __publicField(this, "pluginProps", {});
    __publicField(this, "pluginPropsKey", "");
    __publicField(this, "factory", null);
    __publicField(this, "mountPoint", null);
    __publicField(this, "observer", null);
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
  // Called by the metaclass (or by your registry) right after creation
  setPluginFactory(factory) {
    this.factory = factory;
  }
  // Called by buildComponentTree() when DOM element is assigned
  mountPluginIfReady() {
    const hostEl = this.htmlElement;
    if (!hostEl || !this.form) return;
    this.services = toto.services;
    if (!this.mountPoint) {
      this.mountPoint = document.createElement("div");
      this.mountPoint.setAttribute("data-delphine-mount", "1");
      hostEl.replaceChildren(this.mountPoint);
    }
    this.refreshFromDom();
    if (!this.observer) {
      this.observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.type === "attributes") {
            const a = m.attributeName;
            if (a === "data-plugin" || a === "data-props") {
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
  refreshFromDom() {
    const services = this.services;
    const hostEl = this.htmlElement;
    if (!services || !hostEl || !this.form || !this.mountPoint) return;
    const newPlugin = hostEl.getAttribute("data-plugin");
    const newProps = safeParseJson(hostEl.getAttribute("data-props"));
    const newKey = stableStringify(newProps);
    if (!newPlugin) {
      this.pluginName = null;
      this.pluginProps = {};
      this.pluginPropsKey = "";
      this.unmount();
      return;
    }
    const needRemount = !this.instance || // <-- first time: no instance yet
    newPlugin !== this.pluginName;
    if (needRemount) {
      this.pluginName = newPlugin;
      this.pluginProps = newProps;
      this.pluginPropsKey = newKey;
      this.remount();
      return;
    }
    if (newKey !== this.pluginPropsKey) {
      this.pluginProps = newProps;
      this.pluginPropsKey = newKey;
      this.instance?.update(newProps);
    }
  }
  remount() {
    const services = this.services;
    if (!services || !this.form || !this.mountPoint) return;
    if (!this.pluginName) {
      this.unmount();
      return;
    }
    const def = PluginRegistry.pluginRegistry.get(this.pluginName);
    if (!def) {
      services.log.warn("Unknown plugin", { plugin: this.pluginName });
      this.unmount();
      return;
    }
    this.unmount();
    this.instance = def.factory({ host: this, form: this.form });
    this.instance.mount(this.mountPoint, this.pluginProps, services);
  }
  unmount() {
    try {
      this.instance?.unmount();
    } finally {
      this.instance = null;
    }
  }
  dispose() {
    this.unmount();
    this.observer?.disconnect();
    this.observer = null;
    this.mountPoint = null;
    this.services = null;
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL3ZjbC9yZWdpc3RlclZjbC50cyIsICIuLi9zcmMvdmNsL1N0ZEN0cmxzLnRzIiwgIi4uL3NyYy92Y2wvcGx1Z2luLnRzIiwgIi4uL2V4YW1wbGVzL3phemEvdGVzdC50cyIsICIuLi9leGFtcGxlcy96YXphL3phemEudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IFRDb21wb25lbnRUeXBlUmVnaXN0cnksIFRNZXRhQnV0dG9uLCBUTWV0YVBsdWdpbkhvc3QsIFRNZXRhRm9ybSwgVE1ldGFQYW5lbCB9IGZyb20gJ0B2Y2wnO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJCdWlsdGlucyh0eXBlczogVENvbXBvbmVudFR5cGVSZWdpc3RyeSkge1xuICAgICAgICB0eXBlcy5yZWdpc3RlcihUTWV0YUJ1dHRvbi5tZXRhY2xhc3MpO1xuICAgICAgICB0eXBlcy5yZWdpc3RlcihUTWV0YVBsdWdpbkhvc3QubWV0YWNsYXNzKTtcbiAgICAgICAgdHlwZXMucmVnaXN0ZXIoVE1ldGFGb3JtLm1ldGFjbGFzcyk7XG4gICAgICAgIHR5cGVzLnJlZ2lzdGVyKFRNZXRhUGFuZWwubWV0YWNsYXNzKTtcbiAgICAgICAgLy8gdHlwZXMucmVnaXN0ZXIoVEVkaXRDbGFzcyk7XG4gICAgICAgIC8vIHR5cGVzLnJlZ2lzdGVyKFRMYWJlbENsYXNzKTtcbn1cbiIsICJpbXBvcnQgeyByZWdpc3RlckJ1aWx0aW5zIH0gZnJvbSAnLi9yZWdpc3RlclZjbCc7XG4vL2ltcG9ydCB7IFRvdG8gfSBmcm9tICcuL3BsdWdpbic7XG5pbXBvcnQgdHlwZSB7IElQbHVnaW5Ib3N0IH0gZnJvbSAnLi9JUGx1Z2luJztcblxuLypcbiAgIFRvIGNyZWF0ZSBhIG5ldyBjb21wb25lbnQgdHlwZTpcblxuICAgVG8gY3JlYXRlIGEgbmV3IGNvbXBvbmVudCBhdHRyaWJ1dFxuXG4qL1xuXG5leHBvcnQgY2xhc3MgVENvbG9yIHtcbiAgICAgICAgczogc3RyaW5nO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHM6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHRoaXMucyA9IHM7XG4gICAgICAgIH1cbiAgICAgICAgLyogZmFjdG9yeSAqLyBzdGF0aWMgcmdiKHI6IG51bWJlciwgZzogbnVtYmVyLCBiOiBudW1iZXIpOiBUQ29sb3Ige1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVENvbG9yKGByZ2IoJHtyfSwgJHtnfSwgJHtifSlgKTtcbiAgICAgICAgfVxuICAgICAgICAvKiBmYWN0b3J5ICovIHN0YXRpYyByZ2JhKHI6IG51bWJlciwgZzogbnVtYmVyLCBiOiBudW1iZXIsIGE6IG51bWJlcik6IFRDb2xvciB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUQ29sb3IoYHJnYmEoJHtyfSwgJHtnfSwgJHtifSwgJHthfSlgKTtcbiAgICAgICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVEhhbmRsZXIge1xuICAgICAgICBzOiBzdHJpbmc7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioczogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zID0gcztcbiAgICAgICAgfVxuICAgICAgICBmaXJlKGZvcm06IFRGb3JtLCBoYW5kbGVyTmFtZTogc3RyaW5nLCBldjogRXZlbnQsIHNlbmRlcjogYW55KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF5YmVNZXRob2QgPSAoZm9ybSBhcyBhbnkpW3RoaXMuc107XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBtYXliZU1ldGhvZCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ05PVCBBIE1FVEhPRCcsIGhhbmRsZXJOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBJZiBzZW5kZXIgaXMgbWlzc2luZywgZmFsbGJhY2sgdG8gdGhlIGZvcm0gaXRzZWxmIChzYWZlKVxuICAgICAgICAgICAgICAgIChtYXliZU1ldGhvZCBhcyAoZXZlbnQ6IEV2ZW50LCBzZW5kZXI6IGFueSkgPT4gYW55KS5jYWxsKGZvcm0sIGV2LCBzZW5kZXIgPz8gdGhpcyk7XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IHR5cGUgQ29tcG9uZW50RmFjdG9yeSA9IChuYW1lOiBzdHJpbmcsIGZvcm06IFRGb3JtLCBvd25lcjogVENvbXBvbmVudCkgPT4gVENvbXBvbmVudDtcblxudHlwZSBQcm9wS2luZCA9ICdzdHJpbmcnIHwgJ251bWJlcicgfCAnYm9vbGVhbicgfCAnY29sb3InIHwgJ2hhbmRsZXInO1xuXG5leHBvcnQgdHlwZSBQcm9wU3BlYzxULCBWID0gdW5rbm93bj4gPSB7XG4gICAgICAgIG5hbWU6IHN0cmluZztcbiAgICAgICAga2luZDogUHJvcEtpbmQ7XG4gICAgICAgIHJldHJpZXZlOiAob2JqOiBUKSA9PiBWO1xuICAgICAgICBhcHBseTogKG9iajogVCwgdmFsdWU6IFYpID0+IHZvaWQ7XG59O1xuXG50eXBlIFVua25vd25SZWNvcmQgPSBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbmV4cG9ydCB0eXBlIENvbXBvbmVudFByb3BzID0gUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbmNvbnN0IFJFU0VSVkVEX0RBVEFfQVRUUlMgPSBuZXcgU2V0PHN0cmluZz4oW1xuICAgICAgICAnZGF0YS1jb21wb25lbnQnLFxuICAgICAgICAnZGF0YS1uYW1lJyxcbiAgICAgICAgJ2RhdGEtcHJvcHMnLFxuICAgICAgICAnZGF0YS1wbHVnaW4nLFxuICAgICAgICAnZGF0YS1tZXNzYWdlJyAvLyBhZGQgYW55IG1ldGEvZnJhbWV3b3JrIGF0dHJzIHlvdSBkb24ndCB3YW50IHRyZWF0ZWQgYXMgcHJvcHNcbl0pO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVE1ldGFjbGFzcyB7XG4gICAgICAgIHJlYWRvbmx5IHR5cGVOYW1lOiBzdHJpbmcgPSAnVE1ldGFjbGFzcyc7XG4gICAgICAgIHN0YXRpYyBtZXRhY2xhc3M6IFRNZXRhY2xhc3M7XG4gICAgICAgIHJlYWRvbmx5IHN1cGVyQ2xhc3M6IFRNZXRhY2xhc3MgfCBudWxsID0gbnVsbDtcblxuICAgICAgICBhYnN0cmFjdCBnZXRNZXRhY2xhc3MoKTogVE1ldGFjbGFzcztcbiAgICAgICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHN1cGVyQ2xhc3M6IFRNZXRhY2xhc3MgfCBudWxsLCB0eXBlTmFtZSA9ICdUTWV0YWNsYXNzJykge1xuICAgICAgICAgICAgICAgIHRoaXMuc3VwZXJDbGFzcyA9IHN1cGVyQ2xhc3M7XG4gICAgICAgICAgICAgICAgdGhpcy50eXBlTmFtZSA9IHR5cGVOYW1lO1xuICAgICAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUT2JqZWN0IHtcbiAgICAgICAgZ2V0TWV0YUNsYXNzKCk6IFRNZXRhT2JqZWN0IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFPYmplY3QubWV0YUNsYXNzO1xuICAgICAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUTWV0YU9iamVjdCBleHRlbmRzIFRNZXRhY2xhc3Mge1xuICAgICAgICBzdGF0aWMgcmVhZG9ubHkgbWV0YUNsYXNzOiBUTWV0YU9iamVjdCA9IG5ldyBUTWV0YU9iamVjdChUTWV0YWNsYXNzLm1ldGFjbGFzcywgJ1RPYmplY3QnKTtcblxuICAgICAgICBnZXRNZXRhY2xhc3MoKTogVE1ldGFPYmplY3Qge1xuICAgICAgICAgICAgICAgIHJldHVybiBUTWV0YU9iamVjdC5tZXRhQ2xhc3M7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3RydWN0b3Ioc3VwZXJDbGFzczogVE1ldGFjbGFzcywgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoc3VwZXJDbGFzcywgbmFtZSk7XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRDb21wb25lbnQge1xuICAgICAgICBnZXRNZXRhY2xhc3MoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhQ29tcG9uZW50Lm1ldGFjbGFzcztcbiAgICAgICAgfVxuXG4gICAgICAgIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcbiAgICAgICAgcmVhZG9ubHkgcGFyZW50OiBUQ29tcG9uZW50IHwgbnVsbCA9IG51bGw7XG5cbiAgICAgICAgcHJvcHM6IENvbXBvbmVudFByb3BzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICAgICAgICBnZXRQcm9wPFQgPSB1bmtub3duPihuYW1lOiBzdHJpbmcpOiBUIHwgdW5kZWZpbmVkIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9wc1tuYW1lXSBhcyBUIHwgdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgc2V0UHJvcChuYW1lOiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKTogdm9pZCB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gb3B0aW9uYWxcbiAgICAgICAgaGFzUHJvcChuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMucHJvcHMsIG5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIC8vcHJvdGVjdGVkIHByb3BzOiBDb21wb25lbnRQcm9wcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgIGZvcm06IFRGb3JtIHwgbnVsbCA9IG51bGw7XG4gICAgICAgIGNoaWxkcmVuOiBUQ29tcG9uZW50W10gPSBbXTtcblxuICAgICAgICBlbGVtOiBFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgICAgIGdldCBodG1sRWxlbWVudCgpOiBIVE1MRWxlbWVudCB8IG51bGwge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmVsZW0gYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgZm9ybTogVEZvcm0gfCBudWxsLCBwYXJlbnQ6IFRDb21wb25lbnQgfCBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICAgICAgICAgICAgICBwYXJlbnQ/LmNoaWxkcmVuLnB1c2godGhpcyk7IC8vIENvdWxkIGJlIGRvbmUgaW4gYnVpbGRDb21wb25lbnRUcmVlKClcbiAgICAgICAgICAgICAgICB0aGlzLmZvcm0gPSBmb3JtO1xuXG4gICAgICAgICAgICAgICAgLy8gSU1QT1JUQU5UOiBJbml0aWFsaXplIHByb3BzIGF0IHJ1bnRpbWUgKGRlY2xhcmUgd291bGQgbm90IGRvIGl0KS5cbiAgICAgICAgICAgICAgICAvL3RoaXMucHJvcHMgPSB7fTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5PVEU6IFRoaXMgaXMgcnVudGltZSBkYXRhLCBzbyBpdCBtdXN0IGJlIGluaXRpYWxpemVkIChubyBcImRlY2xhcmVcIikuXG4gICAgICAgIC8vcHJvcHM6IENvbXBvbmVudFByb3BzO1xuXG4gICAgICAgIC8qKiBNYXkgY29udGFpbiBjaGlsZCBjb21wb25lbnRzICovXG4gICAgICAgIF9vbmNsaWNrOiBUSGFuZGxlciA9IG5ldyBUSGFuZGxlcignJyk7XG4gICAgICAgIGFsbG93c0NoaWxkcmVuKCk6IGJvb2xlYW4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBnZXQgY29sb3IoKTogVENvbG9yIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRDb2xvcih0aGlzLmdldEh0bWxTdHlsZVByb3AoJ2NvbG9yJykpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2V0IGNvbG9yKGNvbG9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRIdG1sU3R5bGVQcm9wKCdjb2xvcicsIGNvbG9yLnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0IG9uY2xpY2soKTogVEhhbmRsZXIge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9vbmNsaWNrID8/IG5ldyBUSGFuZGxlcignJyk7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IG9uY2xpY2soaGFuZGxlcikge1xuICAgICAgICAgICAgICAgIHRoaXMuX29uY2xpY2sgPSBoYW5kbGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgc3luY0RvbUZyb21Qcm9wcygpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlbCA9IHRoaXMuaHRtbEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgaWYgKCFlbCkgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0IGJhY2tncm91bmRDb2xvcigpOiBUQ29sb3Ige1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVENvbG9yKHRoaXMuZ2V0SHRtbFN0eWxlUHJvcCgnYmFja2dyb3VuZC1jb2xvcicpKTtcbiAgICAgICAgfVxuICAgICAgICBzZXQgYmFja2dyb3VuZENvbG9yKHY6IFRDb2xvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0SHRtbFN0eWxlUHJvcCgnYmFja2dyb3VuZC1jb2xvcicsIHYucyk7XG4gICAgICAgIH1cblxuICAgICAgICBnZXQgd2lkdGgoKTogc3RyaW5nIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRIdG1sUHJvcCgnd2lkdGgnKSA/PyAnJztcbiAgICAgICAgfVxuICAgICAgICBzZXQgd2lkdGgodjogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRIdG1sUHJvcCgnd2lkdGgnLCB2KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdldCBoZWlnaHQoKTogc3RyaW5nIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRIdG1sUHJvcCgnaGVpZ2h0JykgPz8gJyc7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IGhlaWdodCh2OiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEh0bWxQcm9wKCdoZWlnaHQnLCB2KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdldCBvZmZzZXRXaWR0aCgpOiBudW1iZXIge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmh0bWxFbGVtZW50IS5vZmZzZXRXaWR0aDtcbiAgICAgICAgfVxuICAgICAgICBnZXQgb2Zmc2V0SGVpZ2h0KCk6IG51bWJlciB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaHRtbEVsZW1lbnQhLm9mZnNldEhlaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIHNldEh0bWxTdHlsZVByb3AobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5odG1sRWxlbWVudCEuc3R5bGUuc2V0UHJvcGVydHkobmFtZSwgdmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0SHRtbFN0eWxlUHJvcChuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5odG1sRWxlbWVudCEuc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShuYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNldEh0bWxQcm9wKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHRoaXMuaHRtbEVsZW1lbnQhLnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBnZXRIdG1sUHJvcChuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcyEuaHRtbEVsZW1lbnQhLmdldEF0dHJpYnV0ZShuYW1lKTtcbiAgICAgICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVE1ldGFDb21wb25lbnQgZXh0ZW5kcyBUTWV0YWNsYXNzIHtcbiAgICAgICAgc3RhdGljIHJlYWRvbmx5IG1ldGFjbGFzcyA9IG5ldyBUTWV0YUNvbXBvbmVudChUTWV0YWNsYXNzLm1ldGFjbGFzcywgJ1RDb21wb25lbnQnKTtcbiAgICAgICAgLy8gVGhlIHN5bWJvbGljIG5hbWUgdXNlZCBpbiBIVE1MOiBkYXRhLWNvbXBvbmVudD1cIlRCdXR0b25cIiBvciBcIm15LWJ1dHRvblwiXG4gICAgICAgIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihzdXBlckNsYXNzOiBUTWV0YWNsYXNzLCBuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICBzdXBlcihzdXBlckNsYXNzLCBuYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdldE1ldGFjbGFzcygpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFDb21wb25lbnQubWV0YWNsYXNzO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBydW50aW1lIGluc3RhbmNlIGFuZCBhdHRhY2ggaXQgdG8gdGhlIERPTSBlbGVtZW50LlxuICAgICAgICBjcmVhdGUobmFtZTogc3RyaW5nLCBmb3JtOiBURm9ybSwgcGFyZW50OiBUQ29tcG9uZW50KTogVENvbXBvbmVudCB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUQ29tcG9uZW50KG5hbWUsIGZvcm0sIHBhcmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBkZWZQcm9wcygpOiBQcm9wU3BlYzxhbnk+W10ge1xuICAgICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3sgbmFtZTogJ2NvbG9yJywga2luZDogJ2NvbG9yJywgYXBwbHk6IChvLCB2KSA9PiAoby5jb2xvciA9IG5ldyBUQ29sb3IoU3RyaW5nKHYpKSkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ29uY2xpY2snLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBraW5kOiAnaGFuZGxlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHJpZXZlOiAobykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvLm9uY2xpY2s7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGx5OiAobywgdikgPT4gKG8ub25jbGljayA9IG5ldyBUSGFuZGxlcihTdHJpbmcodikpKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy97IG5hbWU6ICdvbmNyZWF0ZScsIGtpbmQ6ICdoYW5kbGVyJywgYXBwbHk6IChvLCB2KSA9PiAoby5vbmNyZWF0ZSA9IG5ldyBUSGFuZGxlcihTdHJpbmcodikpKSB9XG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvbUV2ZW50cz8oKTogc3RyaW5nW107IC8vIGRlZmF1bHQgW107XG59XG5cbmV4cG9ydCBjbGFzcyBUTWV0YUNvbXBvbmVudFR5cGVSZWdpc3RyeSBleHRlbmRzIFRNZXRhT2JqZWN0IHtcbiAgICAgICAgc3RhdGljIHJlYWRvbmx5IG1ldGFjbGFzczogVE1ldGFDb21wb25lbnRUeXBlUmVnaXN0cnkgPSBuZXcgVE1ldGFDb21wb25lbnRUeXBlUmVnaXN0cnkoVE1ldGFPYmplY3QubWV0YUNsYXNzLCAnVENvbXBvbmVudFR5cGVSZWdpc3RyeScpO1xuICAgICAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3Ioc3VwZXJDbGFzczogVE1ldGFPYmplY3QsIG5hbWU6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHN1cGVyKHN1cGVyQ2xhc3MsIG5hbWUpO1xuICAgICAgICAgICAgICAgIC8vIGV0IHZvdXMgY2hhbmdleiBqdXN0ZSBsZSBub20gOlxuICAgICAgICB9XG4gICAgICAgIGdldE1ldGFjbGFzcygpOiBUTWV0YUNvbXBvbmVudFR5cGVSZWdpc3RyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhQ29tcG9uZW50VHlwZVJlZ2lzdHJ5Lm1ldGFjbGFzcztcbiAgICAgICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVENvbXBvbmVudFR5cGVSZWdpc3RyeSBleHRlbmRzIFRPYmplY3Qge1xuICAgICAgICAvLyBXZSBzdG9yZSBoZXRlcm9nZW5lb3VzIG1ldGFzLCBzbyB3ZSBrZWVwIHRoZW0gYXMgVE1ldGFDb21wb25lbnQ8YW55Pi5cbiAgICAgICAgZ2V0TWV0YWNsYXNzKCk6IFRNZXRhQ29tcG9uZW50VHlwZVJlZ2lzdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFDb21wb25lbnRUeXBlUmVnaXN0cnkubWV0YUNsYXNzO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgY2xhc3NlcyA9IG5ldyBNYXA8c3RyaW5nLCBUTWV0YUNvbXBvbmVudD4oKTtcblxuICAgICAgICByZWdpc3RlcihtZXRhOiBUTWV0YUNvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNsYXNzZXMuaGFzKG1ldGEudHlwZU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENvbXBvbmVudCB0eXBlIGFscmVhZHkgcmVnaXN0ZXJlZDogJHttZXRhLnR5cGVOYW1lfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmNsYXNzZXMuc2V0KG1ldGEudHlwZU5hbWUsIG1ldGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgeW91IGp1c3QgbmVlZCBcInNvbWV0aGluZyBtZXRhXCIsIHJldHVybiBhbnktbWV0YS5cbiAgICAgICAgZ2V0KHR5cGVOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jbGFzc2VzLmdldCh0eXBlTmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICBoYXModHlwZU5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNsYXNzZXMuaGFzKHR5cGVOYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxpc3QoKTogc3RyaW5nW10ge1xuICAgICAgICAgICAgICAgIHJldHVybiBbLi4udGhpcy5jbGFzc2VzLmtleXMoKV0uc29ydCgpO1xuICAgICAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUTWV0YUNvbXBvbmVudFJlZ2lzdHJ5IGV4dGVuZHMgVE1ldGFjbGFzcyB7XG4gICAgICAgIHN0YXRpYyByZWFkb25seSBtZXRhY2xhc3M6IFRNZXRhQ29tcG9uZW50UmVnaXN0cnkgPSBuZXcgVE1ldGFDb21wb25lbnRSZWdpc3RyeShUTWV0YWNsYXNzLm1ldGFjbGFzcywgJ1RDb21wb25lbnRUeXBlUmVnaXN0cnknKTtcblxuICAgICAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3Ioc3VwZXJDbGFzczogVE1ldGFjbGFzcywgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoc3VwZXJDbGFzcywgbmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0TWV0YWNsYXNzKCk6IFRNZXRhQ29tcG9uZW50UmVnaXN0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiBUTWV0YUNvbXBvbmVudFJlZ2lzdHJ5Lm1ldGFjbGFzcztcbiAgICAgICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVENvbXBvbmVudFJlZ2lzdHJ5IGV4dGVuZHMgVE9iamVjdCB7XG4gICAgICAgIC8vX3RvdG86IFRvdG8gPSBuZXcgVG90bygpO1xuICAgICAgICBnZXRNZXRhY2xhc3MoKTogVE1ldGFDb21wb25lbnRSZWdpc3RyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhQ29tcG9uZW50UmVnaXN0cnkubWV0YWNsYXNzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBpbnN0YW5jZXMgPSBuZXcgTWFwPHN0cmluZywgVENvbXBvbmVudD4oKTtcblxuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgICAgICBzdXBlcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVnaXN0ZXJJbnN0YW5jZShuYW1lOiBzdHJpbmcsIGM6IFRDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluc3RhbmNlcy5zZXQobmFtZSwgYyk7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0PFQgZXh0ZW5kcyBUQ29tcG9uZW50ID0gVENvbXBvbmVudD4obmFtZTogc3RyaW5nKTogVCB8IHVuZGVmaW5lZCB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW5zdGFuY2VzLmdldChuYW1lKSBhcyBUIHwgdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgY2xlYXIoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZXMuY2xlYXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc29sdmVSb290KCk6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgICAgICAgICAvLyBQcmVmZXIgYm9keSBhcyB0aGUgY2Fub25pY2FsIHJvb3QuXG4gICAgICAgICAgICAgICAgaWYgKGRvY3VtZW50LmJvZHk/LmRhdGFzZXQ/LmNvbXBvbmVudCkgcmV0dXJuIGRvY3VtZW50LmJvZHk7XG5cbiAgICAgICAgICAgICAgICAvLyBCYWNrd2FyZCBjb21wYXRpYmlsaXR5OiBvbGQgd3JhcHBlciBkaXYuXG4gICAgICAgICAgICAgICAgY29uc3QgbGVnYWN5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RlbHBoaW5lLXJvb3QnKTtcbiAgICAgICAgICAgICAgICBpZiAobGVnYWN5KSByZXR1cm4gbGVnYWN5O1xuXG4gICAgICAgICAgICAgICAgLy8gTGFzdCByZXNvcnQuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmJvZHkgPz8gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBjb252ZXJ0KHJhdzogc3RyaW5nLCBraW5kOiBQcm9wS2luZCkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmF3ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChraW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJhdztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gTnVtYmVyKHJhdyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByYXcgPT09ICd0cnVlJyB8fCByYXcgPT09ICcxJyB8fCByYXcgPT09ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdjb2xvcic6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUQ29sb3IocmF3KTsgLy8gb3UgcGFyc2UgZW4gVENvbG9yIHNpIHZvdXMgYXZlelxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdoYW5kbGVyJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRIYW5kbGVyKHJhdyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByYXc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLSBQcm9wZXJ0aWVzIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpbmQgdGhlIG5lYXJlc3QgUHJvcFNwZWMgZm9yIGEgcHJvcCBuYW1lIGJ5IHdhbGtpbmcgbWV0YSBpbmhlcml0YW5jZTpcbiAgICAgICAgICogbWV0YSAtPiBtZXRhLnN1cGVyQ2xhc3MgLT4gLi4uXG4gICAgICAgICAqIFVzZXMgY2FjaGluZyBmb3Igc3BlZWQuXG4gICAgICAgICAqL1xuICAgICAgICBwcml2YXRlIHJlc29sdmVOZWFyZXN0UHJvcFNwZWMobWV0YTogVE1ldGFDb21wb25lbnQsIHByb3BOYW1lOiBzdHJpbmcpOiBQcm9wU3BlYzxhbnk+IHwgbnVsbCB7XG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICBsZXQgcGVyTWV0YSA9IHRoaXMuX3Byb3BTcGVjQ2FjaGUuZ2V0KG1ldGEpO1xuICAgICAgICAgICAgICAgIGlmICghcGVyTWV0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGVyTWV0YSA9IG5ldyBNYXA8c3RyaW5nLCBQcm9wU3BlYzxhbnk+IHwgbnVsbD4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Byb3BTcGVjQ2FjaGUuc2V0KG1ldGEsIHBlck1ldGEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChwZXJNZXRhLmhhcyhwcm9wTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwZXJNZXRhLmdldChwcm9wTmFtZSkhO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgICAgICAvLyBXYWxrIHVwIG1ldGFjbGFzcyBpbmhlcml0YW5jZTogY2hpbGQgZmlyc3QgKG5lYXJlc3Qgd2lucylcbiAgICAgICAgICAgICAgICBsZXQgbWM6IFRNZXRhQ29tcG9uZW50IHwgbnVsbCA9IG1ldGE7XG5cbiAgICAgICAgICAgICAgICB3aGlsZSAobWMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbWMuZGVmUHJvcHMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVmcyA9IG1jLmRlZlByb3BzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3BlYyBvZiBkZWZzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNwZWMubmFtZSA9PT0gcHJvcE5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vcGVyTWV0YS5zZXQocHJvcE5hbWUsIHNwZWMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNwZWM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBtYyA9IChtYy5zdXBlckNsYXNzIGFzIFRNZXRhQ29tcG9uZW50KSA/PyBudWxsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vcGVyTWV0YS5zZXQocHJvcE5hbWUsIG51bGwpO1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBhcHBseVByb3BzRnJvbVNvdXJjZShjb21wOiBUQ29tcG9uZW50LCBzcmM6IFVua25vd25SZWNvcmQsIG1ldGE6IFRNZXRhQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBbbmFtZSwgcmF3VmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHNyYykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNwZWMgPSB0aGlzLnJlc29sdmVOZWFyZXN0UHJvcFNwZWMobWV0YSwgbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXNwZWMpIGNvbnRpbnVlOyAvLyBOb3QgYSBkZWNsYXJlZCBwcm9wIC0+IGlnbm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgdjogc3RyaW5nID0gcmF3VmFsdWUgYXMgc3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm90ZTogZGF0YS14eHggZ2l2ZXMgc3RyaW5nczsgZGF0YS1wcm9wcyBjYW4gZ2l2ZSBhbnkgSlNPTiB0eXBlLlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLmNvbnZlcnQodiwgc3BlYy5raW5kKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy9vdXRbbmFtZV0gPSB2YWx1ZTsgLy8gPDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NvbXAuc2V0SHRtbFByb3AobmFtZSwgdmFsdWUpOyAvLyBmb3IgY29udmVuaWVuY2UsIHNldEh0bWxQcm9wIGNhbiBiZSB1c2VkIGJ5IHRoZSBjb21wb25lbnQgaXRzZWxmIHRvIHJlYWN0IHRvIHByb3AgY2hhbmdlcy5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXAuc2V0UHJvcChuYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzcGVjLmFwcGx5KGNvbXAsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIGV4dHJhY3RKc29uUHJvcHMoZWw6IEVsZW1lbnQpOiBVbmtub3duUmVjb3JkIHtcbiAgICAgICAgICAgICAgICBjb25zdCByYXcgPSBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcHJvcHMnKTtcbiAgICAgICAgICAgICAgICBpZiAoIXJhdykgcmV0dXJuIHt9O1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UocmF3KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9ubHkgYWNjZXB0IHBsYWluIG9iamVjdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZWQgJiYgdHlwZW9mIHBhcnNlZCA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkocGFyc2VkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VkIGFzIFVua25vd25SZWNvcmQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignSW52YWxpZCBKU09OIGluIGRhdGEtcHJvcHMnLCByYXcsIGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgZXh0cmFjdERhdGFBdHRyaWJ1dGVzKGVsOiBFbGVtZW50KTogVW5rbm93blJlY29yZCB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb3V0OiBVbmtub3duUmVjb3JkID0ge307XG5cbiAgICAgICAgICAgICAgICAvLyBJdGVyYXRlIGFsbCBhdHRyaWJ1dGVzLCBrZWVwIG9ubHkgZGF0YS14eHggKGV4Y2VwdCByZXNlcnZlZClcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGF0dHIgb2YgQXJyYXkuZnJvbShlbC5hdHRyaWJ1dGVzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXR0ck5hbWUgPSBhdHRyLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWF0dHJOYW1lLnN0YXJ0c1dpdGgoJ2RhdGEtJykpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFJFU0VSVkVEX0RBVEFfQVRUUlMuaGFzKGF0dHJOYW1lKSkgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb3BOYW1lID0gYXR0ck5hbWUuc2xpY2UoJ2RhdGEtJy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2tpcCBlbXB0eSBuYW1lc1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFwcm9wTmFtZSkgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG91dFtwcm9wTmFtZV0gPSBhdHRyLnZhbHVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBvdXQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgICAgIC8vIEVuZ2xpc2ggY29tbWVudHMgYXMgcmVxdWVzdGVkLlxuXG4gICAgICAgIC8vIENhY2hlOiBwZXIgbWV0YWNsYXNzIC0+IChwcm9wTmFtZSAtPiBuZWFyZXN0IFByb3BTcGVjIG9yIG51bGwgaWYgbm90IGZvdW5kKVxuICAgICAgICAvL3ByaXZhdGUgcmVhZG9ubHkgX3Byb3BTcGVjQ2FjaGUgPSBuZXcgV2Vha01hcDxUTWV0YUNvbXBvbmVudCwgTWFwPHN0cmluZywgUHJvcFNwZWM8YW55PiB8IG51bGw+PigpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQYXJzZSBIVE1MIGF0dHJpYnV0ZXMgKyBKU09OIGJ1bGsgaW50byBhIHBsYWluIG9iamVjdCBvZiB0eXBlZCBwcm9wcy5cbiAgICAgICAgICogLSBSZWFkcyBKU09OIGZyb20gZGF0YS1wcm9wc1xuICAgICAgICAgKiAtIFJlYWRzIGRhdGEteHh4IGF0dHJpYnV0ZXMgKGV4Y2x1ZGluZyByZXNlcnZlZCBvbmVzKVxuICAgICAgICAgKiAtIEZvciBlYWNoIGNhbmRpZGF0ZSBwcm9wIG5hbWUsIHJlc29sdmVzIHRoZSBuZWFyZXN0IFByb3BTcGVjIGJ5IHdhbGtpbmcgbWV0YWNsYXNzIGluaGVyaXRhbmNlLlxuICAgICAgICAgKiAtIEFwcGxpZXMgY29udmVyc2lvbiBiYXNlZCBvbiBzcGVjLmtpbmRcbiAgICAgICAgICogLSBkYXRhLXh4eCBvdmVycmlkZXMgZGF0YS1wcm9wc1xuICAgICAgICAgKi9cbiAgICAgICAgcGFyc2VQcm9wc0Zyb21FbGVtZW50KGNvbXA6IFRDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlbDogRWxlbWVudCB8IG51bGwgPSBjb21wLmVsZW07XG5cbiAgICAgICAgICAgICAgICBpZiAoIWVsKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAvLyAxKSBFeHRyYWN0IEpTT04gYnVsayBwcm9wcyBmcm9tIGRhdGEtcHJvcHNcbiAgICAgICAgICAgICAgICBjb25zdCBqc29uUHJvcHMgPSB0aGlzLmV4dHJhY3RKc29uUHJvcHMoZWwpO1xuXG4gICAgICAgICAgICAgICAgLy8gMikgRXh0cmFjdCBkYXRhLXh4eCBhdHRyaWJ1dGVzIChleGNsdWRpbmcgcmVzZXJ2ZWQpXG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YUF0dHJzID0gdGhpcy5leHRyYWN0RGF0YUF0dHJpYnV0ZXMoZWwpO1xuXG4gICAgICAgICAgICAgICAgLy8gMykgQXBwbHkgSlNPTiBmaXJzdCwgdGhlbiBkYXRhLXh4eCBvdmVycmlkZXNcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGx5UHJvcHNGcm9tU291cmNlKGNvbXAsIGpzb25Qcm9wcywgY29tcC5nZXRNZXRhY2xhc3MoKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBseVByb3BzRnJvbVNvdXJjZShjb21wLCBkYXRhQXR0cnMsIGNvbXAuZ2V0TWV0YWNsYXNzKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBwcm9jZXNzRWxlbShlbDogRWxlbWVudCwgZm9ybTogVEZvcm0sIHBhcmVudDogVENvbXBvbmVudCk6IFRDb21wb25lbnQgfCBudWxsIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLW5hbWUnKTtcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWNvbXBvbmVudCcpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgY2xzID0gVEFwcGxpY2F0aW9uLlRoZUFwcGxpY2F0aW9uLnR5cGVzLmdldCh0eXBlISk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWNscykgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSBwYXJlbnQ7XG4gICAgICAgICAgICAgICAgaWYgKGNscyAhPSBUTWV0YUZvcm0ubWV0YWNsYXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgVEZvcm0gYXJlIGFscmVhZHkgY3JlYXRlZCBieSB0aGUgdXNlci5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkID0gY2xzLmNyZWF0ZShuYW1lISwgZm9ybSwgcGFyZW50KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLnJlZ2lzdGVySW5zdGFuY2UobmFtZSEsIGNoaWxkKTtcbiAgICAgICAgICAgICAgICAvLyBuYW1lOiBzdHJpbmcsIGZvcm06IFRGb3JtLCBwYXJlbnQ6IFRDb21wb25lbnQsIGVsZW06IEhUTUxFbGVtZW50XG4gICAgICAgICAgICAgICAgaWYgKCFjaGlsZCkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgICAgICAgICAvL2NoaWxkLnBhcmVudCA9IGNvbXBvbmVudDtcblxuICAgICAgICAgICAgICAgIGNoaWxkLmVsZW0gPSBlbDtcbiAgICAgICAgICAgICAgICAvL2NoaWxkLmZvcm0gPSBmb3JtO1xuICAgICAgICAgICAgICAgIC8vY2hpbGQubmFtZSA9IG5hbWUhO1xuICAgICAgICAgICAgICAgIC8vY2hpbGQucHJvcHMgPSB7fTtcblxuICAgICAgICAgICAgICAgIC8vIFdlIGNvbGxlY3RcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnNlUHJvcHNGcm9tRWxlbWVudChjaGlsZCk7XG4gICAgICAgICAgICAgICAgY2hpbGQuc3luY0RvbUZyb21Qcm9wcygpO1xuICAgICAgICAgICAgICAgIChjaGlsZCBhcyBhbnkpLm9uQXR0YWNoZWRUb0RvbT8uKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBEb25lIGluIHRoZSBjb25zdHJ1Y3RvciAvL3BhcmVudC5jaGlsZHJlbi5wdXNoKGNoaWxkKTtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXliZUhvc3QgPSBjaGlsZCBhcyB1bmtub3duIGFzIFBhcnRpYWw8SVBsdWdpbkhvc3Q+O1xuICAgICAgICAgICAgICAgIGlmIChtYXliZUhvc3QgJiYgdHlwZW9mIG1heWJlSG9zdC5zZXRQbHVnaW5TcGVjID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGx1Z2luID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLXBsdWdpbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmF3ID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLXByb3BzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9wcyA9IHJhdyA/IEpTT04ucGFyc2UocmF3KSA6IHt9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXliZUhvc3Quc2V0UGx1Z2luU3BlYyh7IHBsdWdpbiwgcHJvcHMgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXliZUhvc3QubW91bnRQbHVnaW5JZlJlYWR5ISh0aGlzLl90b3RvLnNlcnZpY2VzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vbWF5YmVIb3N0Lm1vdW50RnJvbVJlZ2lzdHJ5KHNlcnZpY2VzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwbHVnaW4gPSBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGx1Z2luJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmF3ID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLXByb3BzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvcHMgPSByYXcgPyBKU09OLnBhcnNlKHJhdykgOiB7fTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heWJlSG9zdC5zZXRQbHVnaW5TcGVjKHsgcGx1Z2luLCBwcm9wcyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXliZUhvc3QubW91bnRQbHVnaW5JZlJlYWR5ISgpO1xuIFxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChjaGlsZC5hbGxvd3NDaGlsZHJlbigpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5xdWVyeVNlbGVjdG9yQWxsKCc6c2NvcGUgPiBbZGF0YS1jb21wb25lbnRdJykuZm9yRWFjaCgoZWwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzRWxlbShlbCwgZm9ybSwgY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2lmIChlbCA9PT0gcm9vdCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBjaGlsZDtcbiAgICAgICAgICAgICAgICAvL2lmIChlbCA9PT0gcm9vdCkgcmV0dXJuOyAvLyBObyBuZWVkIHRvIGdvIGhpZ2hlciBpbiB0aGUgaGllcmFjaHlcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGp1c3RlIG9uY2UsIHdoZW4gdGhlIGZvcm0gaXMgY3JlYXRlZFxuICAgICAgICBidWlsZENvbXBvbmVudFRyZWUoZm9ybTogVEZvcm0sIHJvb3Q6IFRDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgICAgICAgICAgLy8gLS0tIEZPUk0gLS0tXG4gICAgICAgICAgICAgICAgLy8gcHJvdmlzb2lyZW1lbnQgaWYgKHJvb3QuZ2V0QXR0cmlidXRlKCdkYXRhLWNvbXBvbmVudCcpID09PSAnVEZvcm0nKSB7XG4gICAgICAgICAgICAgICAgLy9jb25zdCBlbCA9IHJvb3QuZWxlbSE7XG5cbiAgICAgICAgICAgICAgICAvL3RoaXMucmVnaXN0ZXJJbnN0YW5jZShyb290Lm5hbWUsIGZvcm0pO1xuICAgICAgICAgICAgICAgIC8vfVxuICAgICAgICAgICAgICAgIGNvbnN0IHJvb3RFbGVtID0gcm9vdC5lbGVtITtcbiAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NFbGVtKHJvb3RFbGVtLCBmb3JtLCByb290KTtcblxuICAgICAgICAgICAgICAgIC8vIC0tLSBDSElMRCBDT01QT05FTlRTIC0tLVxuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgcm9vdEVsZW0ucXVlcnlTZWxlY3RvckFsbCgnOnNjb3BlID4gW2RhdGEtY29tcG9uZW50XScpLmZvckVhY2goKGVsKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZDogVENvbXBvbmVudCB8IG51bGwgPSB0aGlzLnByb2Nlc3NFbGVtKGVsLCBmb3JtLCByb290KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaWYgKGVsID09PSByb290KSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQgJiYgY2hpbGQuYWxsb3dzQ2hpbGRyZW4oKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbC5xdWVyeVNlbGVjdG9yQWxsKCc6c2NvcGUgPiBbZGF0YS1jb21wb25lbnRdJykuZm9yRWFjaCgoZWwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NFbGVtKGVsLCBmb3JtLCBjaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9pZiAoZWwgPT09IHJvb3QpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgfVxufVxuXG4vKlxuZXhwb3J0IHR5cGUgQ29tcG9uZW50UHJvcHMgPSB7XG4gICAgICAgIG9uY2xpY2s/OiBUSGFuZGxlcjtcbiAgICAgICAgb25jcmVhdGU/OiBUSGFuZGxlcjtcbiAgICAgICAgLy9jb2xvcj86IFRDb2xvcjsgLy8gb3UgVENvbG9yLCBldGMuXG4gICAgICAgIG5hbWU/OiBzdHJpbmc7XG4gICAgICAgIGNvbXBvbmVudD86IHN0cmluZztcbn07XG4qL1xuXG4vL3R5cGUgUmF3UHJvcCA9IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG5cbmV4cG9ydCBjbGFzcyBURG9jdW1lbnQgZXh0ZW5kcyBUT2JqZWN0IHtcbiAgICAgICAgc3RhdGljIGRvY3VtZW50OiBURG9jdW1lbnQgPSBuZXcgVERvY3VtZW50KGRvY3VtZW50KTtcbiAgICAgICAgc3RhdGljIGJvZHkgPSBkb2N1bWVudC5ib2R5O1xuICAgICAgICBodG1sRG9jOiBEb2N1bWVudDtcbiAgICAgICAgY29uc3RydWN0b3IoaHRtbERvYzogRG9jdW1lbnQpIHtcbiAgICAgICAgICAgICAgICBzdXBlcigpO1xuICAgICAgICAgICAgICAgIHRoaXMuaHRtbERvYyA9IGh0bWxEb2M7XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRNZXRhRG9jdW1lbnQgZXh0ZW5kcyBUTWV0YU9iamVjdCB7XG4gICAgICAgIHN0YXRpYyByZWFkb25seSBtZXRhY2xhc3M6IFRNZXRhRG9jdW1lbnQgPSBuZXcgVE1ldGFEb2N1bWVudChUTWV0YU9iamVjdC5tZXRhY2xhc3MsICdURG9jdW1lbnQnKTtcblxuICAgICAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3Ioc3VwZXJDbGFzczogVE1ldGFPYmplY3QsIG5hbWU6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHN1cGVyKHN1cGVyQ2xhc3MsIG5hbWUpO1xuICAgICAgICAgICAgICAgIC8vIGV0IHZvdXMgY2hhbmdleiBqdXN0ZSBsZSBub20gOlxuICAgICAgICB9XG4gICAgICAgIGdldE1ldGFjbGFzcygpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFEb2N1bWVudC5tZXRhY2xhc3M7XG4gICAgICAgIH1cbn1cblxuLypcbnR5cGUgQ29udGFpbmVyUHJvcHMgPSBDb21wb25lbnRQcm9wcyAmIHtcbiAgICAgICAgLy9jYXB0aW9uPzogc3RyaW5nO1xuICAgICAgICAvL2VuYWJsZWQ/OiBib29sZWFuO1xuICAgICAgICAvL2NvbG9yPzogVENvbG9yOyAvLyBvdSBUQ29sb3IsIGV0Yy5cbn07XG4qL1xuXG4vLyBUaGlzIGNsYXMgZG9lcyBub3QgZG8gYW55dGhpbmcgZXhjZXB0IG92ZXJyaWRlcyBhbGxvd3NDaGlsZHJlbigpXG5leHBvcnQgY2xhc3MgVENvbnRhaW5lciBleHRlbmRzIFRDb21wb25lbnQge1xuICAgICAgICBnZXRNZXRhY2xhc3MoKTogVE1ldGFDb250YWluZXIge1xuICAgICAgICAgICAgICAgIHJldHVybiBUTWV0YUNvbnRhaW5lci5tZXRhY2xhc3M7XG4gICAgICAgIH1cblxuICAgICAgICAvL3ByaXZhdGUgZ2V0IGNwcm9wcygpOiBDb250YWluZXJQcm9wcyB7XG4gICAgICAgIC8vcmV0dXJuIHRoaXMucHJvcHMgYXMgQ29udGFpbmVyUHJvcHM7XG4gICAgICAgIC8vfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgZm9ybTogVEZvcm0gfCBudWxsLCBwYXJlbnQ6IFRDb21wb25lbnQgfCBudWxsKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIobmFtZSwgZm9ybSwgcGFyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN5bmNEb21Gcm9tUHJvcHMoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZWwgPSB0aGlzLmh0bWxFbGVtZW50O1xuICAgICAgICAgICAgICAgIGlmICghZWwpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIHN1cGVyLnN5bmNEb21Gcm9tUHJvcHMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFsbG93c0NoaWxkcmVuKCk6IGJvb2xlYW4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vdGl0aT0xMjtcbn1cblxuZXhwb3J0IGNsYXNzIFRNZXRhQ29udGFpbmVyIGV4dGVuZHMgVE1ldGFDb21wb25lbnQge1xuICAgICAgICBzdGF0aWMgcmVhZG9ubHkgbWV0YWNsYXNzOiBUTWV0YUNvbnRhaW5lciA9IG5ldyBUTWV0YUNvbnRhaW5lcihUTWV0YUNvbXBvbmVudC5tZXRhY2xhc3MsICdUQ29udGFpbmVyJyk7XG5cbiAgICAgICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHN1cGVyQ2xhc3M6IFRNZXRhQ29tcG9uZW50LCBuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICBzdXBlcihzdXBlckNsYXNzLCBuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBnZXRNZXRhY2xhc3MoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhQ29udGFpbmVyLm1ldGFjbGFzcztcbiAgICAgICAgfVxuXG4gICAgICAgIGNyZWF0ZShuYW1lOiBzdHJpbmcsIGZvcm06IFRGb3JtLCBwYXJlbnQ6IFRDb21wb25lbnQpOiBUQ29udGFpbmVyIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRDb250YWluZXIobmFtZSwgZm9ybSwgcGFyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlZlByb3BzKCk6IFByb3BTcGVjPGFueT5bXSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8veyBuYW1lOiAnY2FwdGlvbicsIGtpbmQ6ICdzdHJpbmcnLCBhcHBseTogKG8sIHYpID0+IChvLmNhcHRpb24gPSBTdHJpbmcodikpIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3sgbmFtZTogJ2VuYWJsZWQnLCBraW5kOiAnYm9vbGVhbicsIGFwcGx5OiAobywgdikgPT4gKG8uZW5hYmxlZCA9IEJvb2xlYW4odikpIH1cbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICB9XG59XG5cbi8qXG50eXBlIFBhbmVsUHJvcHMgPSBDb250YWluZXJQcm9wcyAmIHtcbiAgICAgICAgLy9jYXB0aW9uPzogc3RyaW5nO1xuICAgICAgICAvL2VuYWJsZWQ/OiBib29sZWFuO1xuICAgICAgICAvL2NvbG9yPzogVENvbG9yOyAvLyBvdSBUQ29sb3IsIGV0Yy5cbn07XG4qL1xuXG4vLyBUaGlzIGNsYXNzIGRvZXMgbm90IGRvIGFueXRoaW5nIHVzZWZ1bFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZXhwb3J0IGNsYXNzIFRQYW5lbCBleHRlbmRzIFRDb250YWluZXIge1xuICAgICAgICBnZXRNZXRhY2xhc3MoKTogVE1ldGFQYW5lbCB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhUGFuZWwubWV0YWNsYXNzO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9wcm90ZWN0ZWQgZ2V0IHBwcm9wcygpOiBQYW5lbFByb3BzIHtcbiAgICAgICAgLy9yZXR1cm4gdGhpcy5wcm9wcyBhcyBQYW5lbFByb3BzO1xuICAgICAgICAvL31cblxuICAgICAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIGZvcm06IFRGb3JtIHwgbnVsbCwgcGFyZW50OiBUQ29tcG9uZW50IHwgbnVsbCkge1xuICAgICAgICAgICAgICAgIHN1cGVyKG5hbWUsIGZvcm0sIHBhcmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgc3luY0RvbUZyb21Qcm9wcygpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlbCA9IHRoaXMuaHRtbEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgaWYgKCFlbCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgc3VwZXIuc3luY0RvbUZyb21Qcm9wcygpO1xuICAgICAgICB9XG4gICAgICAgIC8vdG90byA9IDEyO1xufVxuXG5leHBvcnQgY2xhc3MgVE1ldGFQYW5lbCBleHRlbmRzIFRNZXRhQ29udGFpbmVyIHtcbiAgICAgICAgc3RhdGljIHJlYWRvbmx5IG1ldGFjbGFzczogVE1ldGFQYW5lbCA9IG5ldyBUTWV0YVBhbmVsKFRNZXRhQ29udGFpbmVyLm1ldGFjbGFzcywgJ1RQYW5lbCcpO1xuXG4gICAgICAgIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihzdXBlckNsYXNzOiBUTWV0YUNvbnRhaW5lciwgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoc3VwZXJDbGFzcywgbmFtZSk7XG4gICAgICAgICAgICAgICAgLy8gZXQgdm91cyBjaGFuZ2V6IGp1c3RlIGxlIG5vbSA6XG4gICAgICAgIH1cbiAgICAgICAgZ2V0TWV0YWNsYXNzKCk6IFRNZXRhUGFuZWwge1xuICAgICAgICAgICAgICAgIHJldHVybiBUTWV0YVBhbmVsLm1ldGFjbGFzcztcbiAgICAgICAgfVxuXG4gICAgICAgIGNyZWF0ZShuYW1lOiBzdHJpbmcsIGZvcm06IFRGb3JtLCBwYXJlbnQ6IFRDb21wb25lbnQpOiBUUGFuZWwge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVFBhbmVsKG5hbWUsIGZvcm0sIHBhcmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBkZWZQcm9wcygpOiBQcm9wU3BlYzxhbnk+W10ge1xuICAgICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3sgbmFtZTogJ2NhcHRpb24nLCBraW5kOiAnc3RyaW5nJywgYXBwbHk6IChvLCB2KSA9PiAoby5jYXB0aW9uID0gU3RyaW5nKHYpKSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgLy97IG5hbWU6ICdlbmFibGVkJywga2luZDogJ2Jvb2xlYW4nLCBhcHBseTogKG8sIHYpID0+IChvLmVuYWJsZWQgPSBCb29sZWFuKHYpKSB9XG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgfVxufVxuXG4vKlxudHlwZSBGb3JtUHJvcHMgPSBDb250YWluZXJQcm9wcyAmIHtcbiAgICAgICAgLy9jYXB0aW9uPzogc3RyaW5nO1xuICAgICAgICAvL2VuYWJsZWQ/OiBib29sZWFuO1xuICAgICAgICAvL2NvbG9yPzogVENvbG9yOyAvLyBvdSBUQ29sb3IsIGV0Yy5cbn07XG4qL1xuXG5leHBvcnQgY2xhc3MgVE1ldGFGb3JtIGV4dGVuZHMgVE1ldGFDb250YWluZXIge1xuICAgICAgICBzdGF0aWMgcmVhZG9ubHkgbWV0YWNsYXNzOiBUTWV0YUZvcm0gPSBuZXcgVE1ldGFGb3JtKFRNZXRhQ29udGFpbmVyLm1ldGFjbGFzcywgJ1RGb3JtJyk7XG4gICAgICAgIGdldE1ldGFDbGFzcygpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFGb3JtLm1ldGFjbGFzcztcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihzdXBlckNsYXNzOiBUTWV0YUNvbnRhaW5lciwgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoc3VwZXJDbGFzcywgbmFtZSk7XG4gICAgICAgICAgICAgICAgLy8gZXQgdm91cyBjaGFuZ2V6IGp1c3RlIGxlIG5vbSA6XG4gICAgICAgIH1cblxuICAgICAgICBjcmVhdGUobmFtZTogc3RyaW5nLCBmb3JtOiBURm9ybSwgcGFyZW50OiBUQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBURm9ybShuYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlZlByb3BzKCk6IFByb3BTcGVjPGFueT5bXSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8veyBuYW1lOiAnY2FwdGlvbicsIGtpbmQ6ICdzdHJpbmcnLCBhcHBseTogKG8sIHYpID0+IChvLmNhcHRpb24gPSBTdHJpbmcodikpIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3sgbmFtZTogJ2VuYWJsZWQnLCBraW5kOiAnYm9vbGVhbicsIGFwcGx5OiAobywgdikgPT4gKG8uZW5hYmxlZCA9IEJvb2xlYW4odikpIH1cbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBURm9ybSBleHRlbmRzIFRDb250YWluZXIge1xuICAgICAgICBnZXRNZXRhY2xhc3MoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhRm9ybS5tZXRhY2xhc3M7XG4gICAgICAgIH1cbiAgICAgICAgc3RhdGljIGZvcm1zID0gbmV3IE1hcDxzdHJpbmcsIFRGb3JtPigpO1xuICAgICAgICBwcml2YXRlIF9tb3VudGVkID0gZmFsc2U7XG4gICAgICAgIC8vIEVhY2ggRm9ybSBoYXMgaXRzIG93biBjb21wb25lbnRSZWdpc3RyeVxuICAgICAgICBjb21wb25lbnRSZWdpc3RyeTogVENvbXBvbmVudFJlZ2lzdHJ5ID0gbmV3IFRDb21wb25lbnRSZWdpc3RyeSgpO1xuICAgICAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICBzdXBlcihuYW1lLCBudWxsLCBudWxsKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZvcm0gPSB0aGlzO1xuICAgICAgICAgICAgICAgIFRGb3JtLmZvcm1zLnNldChuYW1lLCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdldCBhcHBsaWNhdGlvbigpOiBUQXBwbGljYXRpb24ge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZvcm0/LmFwcGxpY2F0aW9uID8/IFRBcHBsaWNhdGlvbi5UaGVBcHBsaWNhdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEVuZ2xpc2ggY29tbWVudHMgYXMgcmVxdWVzdGVkLlxuXG4gICAgICAgIGZpbmRGb3JtRnJvbUV2ZW50VGFyZ2V0KHRhcmdldDogRWxlbWVudCk6IFRGb3JtIHwgbnVsbCB7XG4gICAgICAgICAgICAgICAgLy8gMSkgRmluZCB0aGUgbmVhcmVzdCBlbGVtZW50IHRoYXQgbG9va3MgbGlrZSBhIGZvcm0gY29udGFpbmVyXG4gICAgICAgICAgICAgICAgY29uc3QgZm9ybUVsZW0gPSB0YXJnZXQuY2xvc2VzdCgnW2RhdGEtY29tcG9uZW50PVwiVEZvcm1cIl1bZGF0YS1uYW1lXScpIGFzIEVsZW1lbnQgfCBudWxsO1xuICAgICAgICAgICAgICAgIGlmICghZm9ybUVsZW0pIHJldHVybiBudWxsO1xuXG4gICAgICAgICAgICAgICAgLy8gMikgUmVzb2x2ZSB0aGUgVEZvcm0gaW5zdGFuY2VcbiAgICAgICAgICAgICAgICBjb25zdCBmb3JtTmFtZSA9IGZvcm1FbGVtLmdldEF0dHJpYnV0ZSgnZGF0YS1uYW1lJyk7XG4gICAgICAgICAgICAgICAgaWYgKCFmb3JtTmFtZSkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gVEZvcm0uZm9ybXMuZ2V0KGZvcm1OYW1lKSA/PyBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBfYWM6IEFib3J0Q29udHJvbGxlciB8IG51bGwgPSBudWxsO1xuXG4gICAgICAgIGluc3RhbGxFdmVudFJvdXRlcigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hYz8uYWJvcnQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hYyA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgICAgICAgICBjb25zdCB7IHNpZ25hbCB9ID0gdGhpcy5fYWM7XG5cbiAgICAgICAgICAgICAgICBjb25zdCByb290ID0gdGhpcy5lbGVtIGFzIEVsZW1lbnQgfCBudWxsO1xuICAgICAgICAgICAgICAgIGlmICghcm9vdCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgLy8gc2FtZSBoYW5kbGVyIGZvciBldmVyeWJvZHlcbiAgICAgICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gKGV2OiBFdmVudCkgPT4gdGhpcy5kaXNwYXRjaERvbUV2ZW50KGV2KTtcblxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdHlwZSBvZiBbJ2NsaWNrJywgJ2lucHV0JywgJ2NoYW5nZScsICdrZXlkb3duJ10pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb3QuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBoYW5kbGVyLCB7IGNhcHR1cmU6IHRydWUsIHNpZ25hbCB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHR5cGUgaW4gdGhpcy5nZXRNZXRhY2xhc3MoKS5kb21FdmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb3QuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBoYW5kbGVyLCB7IGNhcHR1cmU6IHRydWUsIHNpZ25hbCB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBkaXNwb3NlRXZlbnRSb3V0ZXIoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWM/LmFib3J0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWMgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2UgcmVjZWl2ZWQgYW4gRE9NIEV2ZW50LiBEaXNwYXRjaCBpdFxuICAgICAgICBwcml2YXRlIGRpc3BhdGNoRG9tRXZlbnQoZXY6IEV2ZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0RWxlbSA9IGV2LnRhcmdldCBhcyBFbGVtZW50IHwgbnVsbDtcbiAgICAgICAgICAgICAgICBpZiAoIXRhcmdldEVsZW0pIHJldHVybjtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHByb3BOYW1lID0gYG9uJHtldi50eXBlfWA7XG5cbiAgICAgICAgICAgICAgICBsZXQgZWw6IEVsZW1lbnQgfCBudWxsID0gdGFyZ2V0RWxlbS5jbG9zZXN0KCdbZGF0YS1jb21wb25lbnRdJyk7XG4gICAgICAgICAgICAgICAgaWYgKCFlbCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbmFtZScpO1xuICAgICAgICAgICAgICAgIGxldCBjb21wID0gbmFtZSA/IHRoaXMuY29tcG9uZW50UmVnaXN0cnkuZ2V0KG5hbWUpIDogbnVsbDtcbiAgICAgICAgICAgICAgICB3aGlsZSAoY29tcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IGNvbXAuZ2V0UHJvcDxUSGFuZGxlcj4ocHJvcE5hbWUpOyAvLyA8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDxcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy9jb25zdCBoYW5kbGVyID0gY29tcC5nZXRQcm9wZXJ0eShwcm9wTmFtZSk7IC8vY29tcD8ucHJvcHNbcHJvcE5hbWUgYXMga2V5b2YgdHlwZW9mIGNvbXAucHJvcHNdIGFzIFRIYW5kbGVyIHwgbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChoYW5kbGVyICYmIGhhbmRsZXIucyAmJiBoYW5kbGVyLnMgIT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlci5maXJlKHRoaXMsIHByb3BOYW1lLCBldiwgY29tcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZWwgPSBuZXh0ID8/IGVsLnBhcmVudEVsZW1lbnQ/LmNsb3Nlc3QoJ1tkYXRhLWNvbXBvbmVudF0nKSA/PyBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcCA9IGNvbXAucGFyZW50O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIE5vIGhhbmRsZXIgaGVyZTogdHJ5IGdvaW5nIFwidXBcIiB1c2luZyB5b3VyIGNvbXBvbmVudCB0cmVlIGlmIHBvc3NpYmxlXG4gICAgICAgIH1cblxuICAgICAgICBzaG93KCkge1xuICAgICAgICAgICAgICAgIC8vIE11c3QgYmUgZG9uZSBiZWZvcmUgYnVpbGRDb21wb25lbnRUcmVlKCkgYmVjYXVzZSBgYnVpbGRDb21wb25lbnRUcmVlKClgIGRvZXMgbm90IGRvIGByZXNvbHZlUm9vdCgpYCBpdHNlbGYuXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmVsZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZWxlbSA9IHRoaXMuY29tcG9uZW50UmVnaXN0cnkucmVzb2x2ZVJvb3QoKTsgLy8gb3UgdGhpcy5yZXNvbHZlUm9vdCgpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5fbW91bnRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21wb25lbnRSZWdpc3RyeS5idWlsZENvbXBvbmVudFRyZWUodGhpcywgdGhpcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uQ3JlYXRlKCk7IC8vIE1heWJlIGNvdWxkIGJlIGRvbmUgYWZ0ZXIgaW5zdGFsbEV2ZW50Um91dGVyKClcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFsbEV2ZW50Um91dGVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9tb3VudGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5vblNob3duKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBUT0RPXG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25DcmVhdGUoKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb25TaG93bk5hbWUgPSB0aGlzLmVsZW0hLmdldEF0dHJpYnV0ZSgnZGF0YS1vbmNyZWF0ZScpO1xuICAgICAgICAgICAgICAgIGlmIChvblNob3duTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVNaWNyb3Rhc2soKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmbiA9ICh0aGlzIGFzIGFueSlbb25TaG93bk5hbWVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSBmbi5jYWxsKHRoaXMsIG51bGwsIHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uU2hvd24oKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb25TaG93bk5hbWUgPSB0aGlzLmVsZW0hLmdldEF0dHJpYnV0ZSgnZGF0YS1vbnNob3duJyk7XG4gICAgICAgICAgICAgICAgaWYgKG9uU2hvd25OYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZU1pY3JvdGFzaygoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZuID0gKHRoaXMgYXMgYW55KVtvblNob3duTmFtZV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicpIGZuLmNhbGwodGhpcywgbnVsbCwgdGhpcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cbn1cblxuLypcbnR5cGUgQnV0dG9uUHJvcHMgPSBDb21wb25lbnRQcm9wcyAmIHtcbiAgICAgICAgY2FwdGlvbj86IHN0cmluZztcbiAgICAgICAgZW5hYmxlZD86IGJvb2xlYW47XG4gICAgICAgIC8vY29sb3I/OiBUQ29sb3I7IC8vIG91IFRDb2xvciwgZXRjLlxufTtcbiovXG5cbmV4cG9ydCBjbGFzcyBUQnV0dG9uIGV4dGVuZHMgVENvbXBvbmVudCB7XG4gICAgICAgIGdldE1ldGFjbGFzcygpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFCdXR0b24ubWV0YWNsYXNzO1xuICAgICAgICB9XG5cbiAgICAgICAgaHRtbEJ1dHRvbigpOiBIVE1MQnV0dG9uRWxlbWVudCB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaHRtbEVsZW1lbnQhIGFzIEhUTUxCdXR0b25FbGVtZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgX2NhcHRpb246IHN0cmluZyA9ICcnO1xuICAgICAgICBfZW5hYmxlZDogYm9vbGVhbiA9IHRydWU7XG4gICAgICAgIC8qXG4gICAgICAgIHByb3RlY3RlZCBnZXQgYnByb3BzKCk6IEJ1dHRvblByb3BzIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9wcyBhcyBCdXR0b25Qcm9wcztcbiAgICAgICAgfVxuICAgICAgICAgICAgICAgICovXG5cbiAgICAgICAgZ2V0IGNhcHRpb24oKTogc3RyaW5nIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fY2FwdGlvbjtcbiAgICAgICAgfVxuICAgICAgICBzZXQgY2FwdGlvbihjYXB0aW9uOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jYXB0aW9uID0gY2FwdGlvbjtcbiAgICAgICAgICAgICAgICBjb25zdCBlbCA9IHRoaXMuaHRtbEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgaWYgKCFlbCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGVsLnRleHRDb250ZW50ID0gdGhpcy5jYXB0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0IGVuYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2VuYWJsZWQgPz8gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBzZXQgZW5hYmxlZChlbmFibGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZW5hYmxlZCA9IGVuYWJsZWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5odG1sQnV0dG9uKCkuZGlzYWJsZWQgPSAhZW5hYmxlZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgZm9ybTogVEZvcm0sIHBhcmVudDogVENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHN1cGVyKG5hbWUsIGZvcm0sIHBhcmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgc3luY0RvbUZyb21Qcm9wcygpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlbCA9IHRoaXMuaHRtbEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgaWYgKCFlbCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgZWwudGV4dENvbnRlbnQgPSB0aGlzLmNhcHRpb247XG4gICAgICAgICAgICAgICAgdGhpcy5odG1sQnV0dG9uKCkuZGlzYWJsZWQgPSAhdGhpcy5lbmFibGVkO1xuICAgICAgICAgICAgICAgIHN1cGVyLnN5bmNEb21Gcm9tUHJvcHMoKTtcbiAgICAgICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVE1ldGFCdXR0b248VCBleHRlbmRzIFRCdXR0b24+IGV4dGVuZHMgVE1ldGFDb21wb25lbnQge1xuICAgICAgICBzdGF0aWMgcmVhZG9ubHkgbWV0YWNsYXNzID0gbmV3IFRNZXRhQnV0dG9uKFRNZXRhQ29tcG9uZW50Lm1ldGFjbGFzcywgJ1RCdXR0b24nKTtcblxuICAgICAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3Ioc3VwZXJDbGFzczogVE1ldGFDb21wb25lbnQsIG5hbWU6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHN1cGVyKHN1cGVyQ2xhc3MsIG5hbWUpO1xuICAgICAgICAgICAgICAgIC8vIGV0IHZvdXMgY2hhbmdleiBqdXN0ZSBsZSBub20gOlxuICAgICAgICB9XG4gICAgICAgIGdldE1ldGFjbGFzcygpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFCdXR0b24ubWV0YWNsYXNzO1xuICAgICAgICB9XG5cbiAgICAgICAgY3JlYXRlKG5hbWU6IHN0cmluZywgZm9ybTogVEZvcm0sIHBhcmVudDogVENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVEJ1dHRvbihuYW1lLCBmb3JtLCBwYXJlbnQpIGFzIFQ7XG4gICAgICAgIH1cblxuICAgICAgICBkZWZQcm9wcygpOiBQcm9wU3BlYzxhbnk+W10ge1xuICAgICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdjYXB0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2luZDogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHJpZXZlOiAobykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvLmNhcHRpb247XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGx5OiAobywgdikgPT4gKG8uY2FwdGlvbiA9IFN0cmluZyh2KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdlbmFibGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2luZDogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXRyaWV2ZTogKG8pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gby5lbmFibGVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBseTogKG8sIHYpID0+IChvLmVuYWJsZWQgPSBCb29sZWFuKHYpKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRNZXRhQXBwbGljYXRpb24gZXh0ZW5kcyBUTWV0YWNsYXNzIHtcbiAgICAgICAgc3RhdGljIHJlYWRvbmx5IG1ldGFjbGFzczogVE1ldGFBcHBsaWNhdGlvbiA9IG5ldyBUTWV0YUFwcGxpY2F0aW9uKFRNZXRhY2xhc3MubWV0YWNsYXNzLCAnVEFwcGxpY2F0aW9uJyk7XG5cbiAgICAgICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHN1cGVyQ2xhc3M6IFRNZXRhY2xhc3MsIG5hbWU6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHN1cGVyKHN1cGVyQ2xhc3MsIG5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGdldE1ldGFjbGFzcygpOiBUTWV0YUFwcGxpY2F0aW9uIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFBcHBsaWNhdGlvbi5tZXRhY2xhc3M7XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRBcHBsaWNhdGlvbiB7XG4gICAgICAgIGdldE1ldGFjbGFzcygpOiBUTWV0YUFwcGxpY2F0aW9uIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFBcHBsaWNhdGlvbi5tZXRhY2xhc3M7XG4gICAgICAgIH1cbiAgICAgICAgc3RhdGljIFRoZUFwcGxpY2F0aW9uOiBUQXBwbGljYXRpb247XG4gICAgICAgIC8vc3RhdGljIHBsdWdpblJlZ2lzdHJ5ID0gbmV3IFBsdWdpblJlZ2lzdHJ5KCk7XG4gICAgICAgIC8vcGx1Z2luczogSVBsdWdpblJlZ2lzdHJ5O1xuICAgICAgICBwcml2YXRlIGZvcm1zOiBURm9ybVtdID0gW107XG4gICAgICAgIHJlYWRvbmx5IHR5cGVzID0gbmV3IFRDb21wb25lbnRUeXBlUmVnaXN0cnkoKTtcbiAgICAgICAgbWFpbkZvcm06IFRGb3JtIHwgbnVsbCA9IG51bGw7XG5cbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICAgICAgVEFwcGxpY2F0aW9uLlRoZUFwcGxpY2F0aW9uID0gdGhpcztcbiAgICAgICAgICAgICAgICByZWdpc3RlckJ1aWx0aW5zKHRoaXMudHlwZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgY3JlYXRlRm9ybTxUIGV4dGVuZHMgVEZvcm0+KGN0b3I6IG5ldyAoLi4uYXJnczogYW55W10pID0+IFQsIG5hbWU6IHN0cmluZyk6IFQge1xuICAgICAgICAgICAgICAgIGNvbnN0IGYgPSBuZXcgY3RvcihuYW1lKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZvcm1zLnB1c2goZik7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm1haW5Gb3JtKSB0aGlzLm1haW5Gb3JtID0gZjtcbiAgICAgICAgICAgICAgICByZXR1cm4gZjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJ1bigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJ1bldoZW5Eb21SZWFkeSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5tYWluRm9ybSkgdGhpcy5tYWluRm9ybS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHRoaXMuYXV0b1N0YXJ0KCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgYXV0b1N0YXJ0KCkge1xuICAgICAgICAgICAgICAgIC8vIGZhbGxiYWNrOiBjaG9pc2lyIHVuZSBmb3JtIGVucmVnaXN0clx1MDBFOWUsIG91IGNyXHUwMEU5ZXIgdW5lIGZvcm0gaW1wbGljaXRlXG4gICAgICAgIH1cblxuICAgICAgICBydW5XaGVuRG9tUmVhZHkoZm46ICgpID0+IHZvaWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2xvYWRpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZuLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gRENDID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLy8gRENDID0gRGVscGhpbmUgQ3VzdG9tIENvbXBvbmVudFxuXG4vKlxudHlwZSBTaW1wbGVEQ0NQcm9wcyA9IENvbXBvbmVudFByb3BzICYge1xuICAgICAgICAvL2NhcHRpb24/OiBzdHJpbmc7XG4gICAgICAgIC8vZW5hYmxlZD86IGJvb2xlYW47XG4gICAgICAgIC8vY29sb3I/OiBUQ29sb3I7IC8vIG91IFRDb2xvciwgZXRjLlxufTtcbiovXG5cbi8vIE5vdGU6IHRoaXMgY2xhc3MgZG9lcyBub3QgZG8gYW55dGhpbmcuIFBlcmhhcHMgdGhhdCBEQ0MgY2FuIGhlcml0IGRpcmVjdGx5IGZyb20gVENvbXBvbmVudFxuXG5leHBvcnQgY2xhc3MgVFNpbXBsZURDQyBleHRlbmRzIFRDb21wb25lbnQge1xuICAgICAgICBnZXRNZXRhY2xhc3MoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhU2ltcGxlRENDLm1ldGFjbGFzcztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgZm9ybTogVEZvcm0sIHBhcmVudDogVENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHN1cGVyKG5hbWUsIGZvcm0sIHBhcmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKlxuICAgICAgICBwcm90ZWN0ZWQgZ2V0IGRjY3Byb3BzKCk6IFNpbXBsZURDQ1Byb3BzIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9wcyBhcyBTaW1wbGVEQ0NQcm9wcztcbiAgICAgICAgfVxuICAgICAgICAgICAgICAgICovXG59XG5cbmV4cG9ydCBjbGFzcyBUTWV0YVNpbXBsZURDQyBleHRlbmRzIFRNZXRhQ29tcG9uZW50IHtcbiAgICAgICAgc3RhdGljIHJlYWRvbmx5IG1ldGFjbGFzczogVE1ldGFTaW1wbGVEQ0MgPSBuZXcgVE1ldGFTaW1wbGVEQ0MoVE1ldGFDb21wb25lbnQubWV0YWNsYXNzLCAnVFNpbXBsZURDQycpO1xuXG4gICAgICAgIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihzdXBlckNsYXNzOiBUTWV0YUNvbXBvbmVudCwgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoc3VwZXJDbGFzcywgbmFtZSk7XG4gICAgICAgICAgICAgICAgLy8gZXQgdm91cyBjaGFuZ2V6IGp1c3RlIGxlIG5vbSA6XG4gICAgICAgIH1cbiAgICAgICAgZ2V0TWV0YWNsYXNzKCk6IFRNZXRhU2ltcGxlRENDIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFTaW1wbGVEQ0MubWV0YWNsYXNzO1xuICAgICAgICB9XG5cbiAgICAgICAgY3JlYXRlKG5hbWU6IHN0cmluZywgZm9ybTogVEZvcm0sIHBhcmVudDogVENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVFNpbXBsZURDQyhuYW1lLCBmb3JtLCBwYXJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVmUHJvcHMoKTogUHJvcFNwZWM8YW55PltdIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICAgICAgLy97IG5hbWU6ICdjYXB0aW9uJywga2luZDogJ3N0cmluZycsIGFwcGx5OiAobywgdikgPT4gKG8uY2FwdGlvbiA9IFN0cmluZyh2KSkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8veyBuYW1lOiAnZW5hYmxlZCcsIGtpbmQ6ICdib29sZWFuJywgYXBwbHk6IChvLCB2KSA9PiAoby5lbmFibGVkID0gQm9vbGVhbih2KSkgfVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgIH1cbn1cblxuLypcbmV4cG9ydCB0eXBlIENvbXBvc2l0ZURDQ1Byb3BzID0gQ29tcG9uZW50UHJvcHMgJiB7XG4gICAgICAgIC8vY2FwdGlvbj86IHN0cmluZztcbiAgICAgICAgLy9lbmFibGVkPzogYm9vbGVhbjtcbiAgICAgICAgLy9jb2xvcj86IFRDb2xvcjsgLy8gb3UgVENvbG9yLCBldGMuXG59O1xuKi9cblxuLy8gTm90ZTogdGhpcyBjbGFzcyBkb2VzIG5vdCBkbyBhbnl0aGluZy4gUGVyaGFwcyB0aGF0IERDQyBjYW4gaGVyaXQgZGlyZWN0bHkgZnJvbSBUQ29udGFpbmVyIG9yIFRQYW5lbFxuLy8gVENvbnRhaW5lciBvciBUUGFuZWwgPyBBY3R1YWxseSB0aGlzIGlzIG5vdCBjbGVhci4gVGhvc2UgdHdvIGNsYXNzIGRvIG5vdCBkbyBhbnl0aGluZyB1c2VmdWwgYWJvZiBUQ29tcG9uZW50XG5leHBvcnQgY2xhc3MgVENvbXBvc2l0ZURDQyBleHRlbmRzIFRDb250YWluZXIge1xuICAgICAgICBnZXRNZXRhY2xhc3MoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhQ29tcG9zaXRlRENDLm1ldGFjbGFzcztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgZm9ybTogVEZvcm0sIHBhcmVudDogVENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHN1cGVyKG5hbWUsIGZvcm0sIHBhcmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgLypcbiAgICAgICAgcHJvdGVjdGVkIGdldCBkY2Nwcm9wcygpOiBDb21wb3NpdGVEQ0NQcm9wcyB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMgYXMgQ29tcG9zaXRlRENDUHJvcHM7XG4gICAgICAgIH1cbiAgICAgICAgICAgICAgICAqL1xufVxuXG5leHBvcnQgY2xhc3MgVE1ldGFDb21wb3NpdGVEQ0MgZXh0ZW5kcyBUTWV0YUNvbnRhaW5lciB7XG4gICAgICAgIHN0YXRpYyByZWFkb25seSBtZXRhY2xhc3M6IFRNZXRhQ29tcG9zaXRlRENDID0gbmV3IFRNZXRhQ29tcG9zaXRlRENDKFRNZXRhQ29udGFpbmVyLm1ldGFjbGFzcywgJ1RDb21wb3NpdERDQycpO1xuXG4gICAgICAgIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihzdXBlckNsYXNzOiBUTWV0YUNvbnRhaW5lciwgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoc3VwZXJDbGFzcywgbmFtZSk7XG4gICAgICAgICAgICAgICAgLy8gZXQgdm91cyBjaGFuZ2V6IGp1c3RlIGxlIG5vbSA6XG4gICAgICAgIH1cbiAgICAgICAgZ2V0TWV0YWNsYXNzKCk6IFRNZXRhQ29tcG9zaXRlRENDIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFDb21wb3NpdGVEQ0MubWV0YWNsYXNzO1xuICAgICAgICB9XG5cbiAgICAgICAgY3JlYXRlKG5hbWU6IHN0cmluZywgZm9ybTogVEZvcm0sIHBhcmVudDogVENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVENvbXBvc2l0ZURDQyhuYW1lLCBmb3JtLCBwYXJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVmUHJvcHMoKTogUHJvcFNwZWM8YW55PltdIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICAgICAgLy97IG5hbWU6ICdjYXB0aW9uJywga2luZDogJ3N0cmluZycsIGFwcGx5OiAobywgdikgPT4gKG8uY2FwdGlvbiA9IFN0cmluZyh2KSkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8veyBuYW1lOiAnZW5hYmxlZCcsIGtpbmQ6ICdib29sZWFuJywgYXBwbHk6IChvLCB2KSA9PiAoby5lbmFibGVkID0gQm9vbGVhbih2KSkgfVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIiwgImltcG9ydCB7IFRGb3JtLCBUQ29tcG9uZW50LCBUTWV0YUNvbXBvbmVudCwgVEFwcGxpY2F0aW9uIH0gZnJvbSAnLi9TdGRDdHJscyc7XG5pbXBvcnQgdHlwZSB7IFByb3BTcGVjIH0gZnJvbSAnLi9TdGRDdHJscyc7XG5pbXBvcnQgdHlwZSB7IERlbHBoaW5lU2VydmljZXMgfSBmcm9tICcuL0lQbHVnaW4nO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gUExVR0lOSE9TVCA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCB0eXBlIEpzb24gPSBudWxsIHwgYm9vbGVhbiB8IG51bWJlciB8IHN0cmluZyB8IEpzb25bXSB8IHsgW2tleTogc3RyaW5nXTogSnNvbiB9O1xuXG5leHBvcnQgaW50ZXJmYWNlIERlbHBoaW5lTG9nZ2VyIHtcbiAgICAgICAgZGVidWcobXNnOiBzdHJpbmcsIGRhdGE/OiBKc29uKTogdm9pZDtcbiAgICAgICAgaW5mbyhtc2c6IHN0cmluZywgZGF0YT86IEpzb24pOiB2b2lkO1xuICAgICAgICB3YXJuKG1zZzogc3RyaW5nLCBkYXRhPzogSnNvbik6IHZvaWQ7XG4gICAgICAgIGVycm9yKG1zZzogc3RyaW5nLCBkYXRhPzogSnNvbik6IHZvaWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGVscGhpbmVFdmVudEJ1cyB7XG4gICAgICAgIC8vIFN1YnNjcmliZSB0byBhbiBhcHAgZXZlbnQuXG4gICAgICAgIG9uKGV2ZW50TmFtZTogc3RyaW5nLCBoYW5kbGVyOiAocGF5bG9hZDogSnNvbikgPT4gdm9pZCk6ICgpID0+IHZvaWQ7XG5cbiAgICAgICAgLy8gUHVibGlzaCBhbiBhcHAgZXZlbnQuXG4gICAgICAgIGVtaXQoZXZlbnROYW1lOiBzdHJpbmcsIHBheWxvYWQ6IEpzb24pOiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERlbHBoaW5lU3RvcmFnZSB7XG4gICAgICAgIGdldChrZXk6IHN0cmluZyk6IFByb21pc2U8SnNvbiB8IHVuZGVmaW5lZD47XG4gICAgICAgIHNldChrZXk6IHN0cmluZywgdmFsdWU6IEpzb24pOiBQcm9taXNlPHZvaWQ+O1xuICAgICAgICByZW1vdmUoa2V5OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+O1xufVxuXG5leHBvcnQgY2xhc3MgVG90byB7XG4gICAgICAgIGxvZ2dlciA9IHtcbiAgICAgICAgICAgICAgICBkZWJ1Zyhtc2c6IHN0cmluZywgZGF0YT86IEpzb24pOiB2b2lkIHt9LFxuICAgICAgICAgICAgICAgIGluZm8obXNnOiBzdHJpbmcsIGRhdGE/OiBKc29uKTogdm9pZCB7fSxcbiAgICAgICAgICAgICAgICB3YXJuKG1zZzogc3RyaW5nLCBkYXRhPzogSnNvbik6IHZvaWQge30sXG4gICAgICAgICAgICAgICAgZXJyb3IobXNnOiBzdHJpbmcsIGRhdGE/OiBKc29uKTogdm9pZCB7fVxuICAgICAgICB9O1xuXG4gICAgICAgIGV2ZW50QnVzID0ge1xuICAgICAgICAgICAgICAgIG9uKGV2ZW50OiBzdHJpbmcsIGhhbmRsZXI6IChwYXlsb2FkOiBhbnkpID0+IHZvaWQpOiAoKSA9PiB2b2lkIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoKSA9PiB2b2lkIHt9O1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZW1pdChldmVudDogc3RyaW5nLCBwYXlsb2FkOiBhbnkpOiB2b2lkIHt9XG4gICAgICAgIH07XG5cbiAgICAgICAgc3RvcmFnZSA9IHtcbiAgICAgICAgICAgICAgICBnZXQoa2V5OiBzdHJpbmcpOiBQcm9taXNlPGFueT4gfCBudWxsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogYW55KTogUHJvbWlzZTx2b2lkPiB8IG51bGwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByZW1vdmUoa2V5OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHwgbnVsbCB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgc2VydmljZXM6IERlbHBoaW5lU2VydmljZXMgPSB7XG4gICAgICAgICAgICAgICAgbG9nOiB0aGlzLmxvZ2dlcixcbiAgICAgICAgICAgICAgICBidXM6IHRoaXMuZXZlbnRCdXMsXG4gICAgICAgICAgICAgICAgc3RvcmFnZTogdGhpcy5zdG9yYWdlXG4gICAgICAgIH07XG59XG5jb25zdCB0b3RvOiBUb3RvID0gbmV3IFRvdG8oKTtcblxuZXhwb3J0IGludGVyZmFjZSBVSVBsdWdpbkluc3RhbmNlPFByb3BzIGV4dGVuZHMgSnNvbiA9IEpzb24+IHtcbiAgICAgICAgcmVhZG9ubHkgaWQ6IHN0cmluZztcblxuICAgICAgICAvLyBDYWxsZWQgZXhhY3RseSBvbmNlIGFmdGVyIGNyZWF0aW9uIChmb3IgYSBnaXZlbiBpbnN0YW5jZSkuXG4gICAgICAgIG1vdW50KGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIHByb3BzOiBQcm9wcywgc2VydmljZXM6IERlbHBoaW5lU2VydmljZXMpOiB2b2lkO1xuXG4gICAgICAgIC8vIENhbGxlZCBhbnkgdGltZSBwcm9wcyBjaGFuZ2UgKG1heSBiZSBmcmVxdWVudCkuXG4gICAgICAgIHVwZGF0ZShwcm9wczogUHJvcHMpOiB2b2lkO1xuXG4gICAgICAgIC8vIENhbGxlZCBleGFjdGx5IG9uY2UgYmVmb3JlIGRpc3Bvc2FsLlxuICAgICAgICB1bm1vdW50KCk6IHZvaWQ7XG5cbiAgICAgICAgLy8gRmluaXNoZWQgd2l0aCB0aGlzIHBsdWdpblxuICAgICAgICBkaXNwb3NlPygpOiB2b2lkO1xuXG4gICAgICAgIC8vIE9wdGlvbmFsIGVyZ29ub21pY3MuXG4gICAgICAgIGdldFNpemVIaW50cz8oKTogbnVtYmVyO1xuICAgICAgICBmb2N1cz8oKTogdm9pZDtcblxuICAgICAgICAvLyBPcHRpb25hbCBwZXJzaXN0ZW5jZSBob29rIChEZWxwaGluZSBtYXkgc3RvcmUgJiByZXN0b3JlIHRoaXMpLlxuICAgICAgICBzZXJpYWxpemVTdGF0ZT8oKTogSnNvbjtcbn1cblxuZXhwb3J0IGNsYXNzIFRNZXRhUGx1Z2luSG9zdCBleHRlbmRzIFRNZXRhQ29tcG9uZW50IHtcbiAgICAgICAgc3RhdGljIG1ldGFjbGFzcyA9IG5ldyBUTWV0YVBsdWdpbkhvc3QoVE1ldGFDb21wb25lbnQubWV0YWNsYXNzLCAnVFBsdWdpbkhvc3QnKTtcbiAgICAgICAgZ2V0TWV0YWNsYXNzKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBUTWV0YVBsdWdpbkhvc3QubWV0YWNsYXNzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHN1cGVyQ2xhc3M6IFRNZXRhQ29tcG9uZW50LCBuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICBzdXBlcihzdXBlckNsYXNzLCBuYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNyZWF0ZShuYW1lOiBzdHJpbmcsIGZvcm06IFRGb3JtLCBwYXJlbnQ6IFRDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRQbHVnaW5Ib3N0KG5hbWUsIGZvcm0sIHBhcmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBkZWZQcm9wcygpOiBQcm9wU3BlYzxUUGx1Z2luSG9zdD5bXSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG59XG5cbmZ1bmN0aW9uIHNhZmVQYXJzZUpzb24oczogc3RyaW5nIHwgbnVsbCk6IGFueSB7XG4gICAgICAgIGlmICghcykgcmV0dXJuIHt9O1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKHMpO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH1cbn1cblxuZnVuY3Rpb24gc3RhYmxlU3RyaW5naWZ5KHY6IGFueSk6IHN0cmluZyB7XG4gICAgICAgIC8vIEdvb2QgZW5vdWdoIGZvciBjaGVhcCBjaGFuZ2UgZGV0ZWN0aW9uXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHYpO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRQbHVnaW5Ib3N0IGV4dGVuZHMgVENvbXBvbmVudCB7XG4gICAgICAgIHByaXZhdGUgaW5zdGFuY2U6IFVJUGx1Z2luSW5zdGFuY2UgfCBudWxsID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZSBzZXJ2aWNlczogRGVscGhpbmVTZXJ2aWNlcyB8IG51bGwgPSBudWxsO1xuXG4gICAgICAgIHByaXZhdGUgcGx1Z2luTmFtZTogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgcGx1Z2luUHJvcHM6IGFueSA9IHt9O1xuICAgICAgICBwcml2YXRlIHBsdWdpblByb3BzS2V5OiBzdHJpbmcgPSAnJztcbiAgICAgICAgcHJpdmF0ZSBmYWN0b3J5OiBVSVBsdWdpbkZhY3RvcnkgfCBudWxsID0gbnVsbDtcblxuICAgICAgICBwcml2YXRlIG1vdW50UG9pbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgb2JzZXJ2ZXI6IE11dGF0aW9uT2JzZXJ2ZXIgfCBudWxsID0gbnVsbDtcblxuICAgICAgICBtb3VudFBsdWdpbihwcm9wczogSnNvbiwgc2VydmljZXM6IERlbHBoaW5lU2VydmljZXMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLmh0bWxFbGVtZW50O1xuICAgICAgICAgICAgICAgIGlmICghY29udGFpbmVyKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZmFjdG9yeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VydmljZXMubG9nLndhcm4oJ1RQbHVnaW5Ib3N0OiBubyBwbHVnaW4gZmFjdG9yeSBzZXQnLCB7IGhvc3Q6IHRoaXMubmFtZSBhcyBhbnkgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gRGlzcG9zZSBvbGQgaW5zdGFuY2UgaWYgYW55XG4gICAgICAgICAgICAgICAgdGhpcy51bm1vdW50KCk7XG5cbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgcGx1Z2luIGluc3RhbmNlIHRoZW4gbW91bnRcbiAgICAgICAgICAgICAgICB0aGlzLmluc3RhbmNlID0gdGhpcy5mYWN0b3J5KHsgaG9zdDogdGhpcywgZm9ybTogdGhpcy5mb3JtISB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLmluc3RhbmNlIS5tb3VudChjb250YWluZXIsIHByb3BzLCBzZXJ2aWNlcyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYWxsZWQgYnkgYnVpbGRDb21wb25lbnRUcmVlKClcbiAgICAgICAgc2V0UGx1Z2luU3BlYyhzcGVjOiB7IHBsdWdpbjogc3RyaW5nIHwgbnVsbDsgcHJvcHM6IGFueSB9KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW5OYW1lID0gc3BlYy5wbHVnaW47XG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW5Qcm9wcyA9IHNwZWMucHJvcHMgPz8ge307XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYWxsZWQgYnkgdGhlIG1ldGFjbGFzcyAob3IgYnkgeW91ciByZWdpc3RyeSkgcmlnaHQgYWZ0ZXIgY3JlYXRpb25cbiAgICAgICAgc2V0UGx1Z2luRmFjdG9yeShmYWN0b3J5OiBVSVBsdWdpbkZhY3RvcnkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZhY3RvcnkgPSBmYWN0b3J5O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FsbGVkIGJ5IGJ1aWxkQ29tcG9uZW50VHJlZSgpIHdoZW4gRE9NIGVsZW1lbnQgaXMgYXNzaWduZWRcbiAgICAgICAgbW91bnRQbHVnaW5JZlJlYWR5KCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGhvc3RFbCA9IHRoaXMuaHRtbEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgaWYgKCFob3N0RWwgfHwgIXRoaXMuZm9ybSkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zZXJ2aWNlcyA9IHRvdG8uc2VydmljZXM7IC8vIFRPRE8gZ2V0IHJlYWwgc2VydmljZXMgZnJvbSBhcmdzXG5cbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgYSBzdGFibGUgbW91bnQgcG9pbnQgSU5TSURFIHRoZSBob3N0XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm1vdW50UG9pbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubW91bnRQb2ludCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3VudFBvaW50LnNldEF0dHJpYnV0ZSgnZGF0YS1kZWxwaGluZS1tb3VudCcsICcxJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBob3N0RWwucmVwbGFjZUNoaWxkcmVuKHRoaXMubW91bnRQb2ludCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gSW5pdGlhbCBtb3VudCBmcm9tIERPTSBhdHRyaWJ1dGVzXG4gICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoRnJvbURvbSgpO1xuXG4gICAgICAgICAgICAgICAgLy8gT2JzZXJ2ZSBhdHRyaWJ1dGUgY2hhbmdlcyB0byBrZWVwIHBsdWdpbiBpbiBzeW5jXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm9ic2VydmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9ucykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG0gb2YgbXV0YXRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG0udHlwZSA9PT0gJ2F0dHJpYnV0ZXMnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhID0gbS5hdHRyaWJ1dGVOYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGEgPT09ICdkYXRhLXBsdWdpbicgfHwgYSA9PT0gJ2RhdGEtcHJvcHMnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaEZyb21Eb20oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXIub2JzZXJ2ZShob3N0RWwsIHsgYXR0cmlidXRlczogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFbmdsaXNoIGNvbW1lbnRzIGFzIHJlcXVlc3RlZC5cblxuICAgICAgICBwcml2YXRlIHJlZnJlc2hGcm9tRG9tKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlcnZpY2VzID0gdGhpcy5zZXJ2aWNlcztcbiAgICAgICAgICAgICAgICBjb25zdCBob3N0RWwgPSB0aGlzLmh0bWxFbGVtZW50O1xuICAgICAgICAgICAgICAgIGlmICghc2VydmljZXMgfHwgIWhvc3RFbCB8fCAhdGhpcy5mb3JtIHx8ICF0aGlzLm1vdW50UG9pbnQpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1BsdWdpbiA9IGhvc3RFbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGx1Z2luJyk7IC8vIHN0cmluZyB8IG51bGxcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdQcm9wcyA9IHNhZmVQYXJzZUpzb24oaG9zdEVsLmdldEF0dHJpYnV0ZSgnZGF0YS1wcm9wcycpKTtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdLZXkgPSBzdGFibGVTdHJpbmdpZnkobmV3UHJvcHMpO1xuXG4gICAgICAgICAgICAgICAgLy8gTm90aGluZyB0byBtb3VudCA9PiB1bm1vdW50IGFuZCBleGl0XG4gICAgICAgICAgICAgICAgaWYgKCFuZXdQbHVnaW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luTmFtZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpblByb3BzID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpblByb3BzS2V5ID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVubW91bnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBuZWVkUmVtb3VudCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAhdGhpcy5pbnN0YW5jZSB8fCAvLyA8LS0gZmlyc3QgdGltZTogbm8gaW5zdGFuY2UgeWV0XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdQbHVnaW4gIT09IHRoaXMucGx1Z2luTmFtZTsgLy8gPC0tIHBsdWdpbiBjaGFuZ2VkXG5cbiAgICAgICAgICAgICAgICBpZiAobmVlZFJlbW91bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luTmFtZSA9IG5ld1BsdWdpbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luUHJvcHMgPSBuZXdQcm9wcztcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luUHJvcHNLZXkgPSBuZXdLZXk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW91bnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBTYW1lIHBsdWdpbiA9PiB1cGRhdGUgb25seSBpZiBwcm9wcyBjaGFuZ2VkXG4gICAgICAgICAgICAgICAgaWYgKG5ld0tleSAhPT0gdGhpcy5wbHVnaW5Qcm9wc0tleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW5Qcm9wcyA9IG5ld1Byb3BzO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW5Qcm9wc0tleSA9IG5ld0tleTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFuY2U/LnVwZGF0ZShuZXdQcm9wcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgcmVtb3VudCgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzZXJ2aWNlcyA9IHRoaXMuc2VydmljZXM7XG4gICAgICAgICAgICAgICAgaWYgKCFzZXJ2aWNlcyB8fCAhdGhpcy5mb3JtIHx8ICF0aGlzLm1vdW50UG9pbnQpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIC8vIFJlc29sdmUgcGx1Z2luXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLnBsdWdpbk5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudW5tb3VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IGRlZiA9IFBsdWdpblJlZ2lzdHJ5LnBsdWdpblJlZ2lzdHJ5LmdldCh0aGlzLnBsdWdpbk5hbWUpO1xuICAgICAgICAgICAgICAgIGlmICghZGVmKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlcy5sb2cud2FybignVW5rbm93biBwbHVnaW4nLCB7IHBsdWdpbjogdGhpcy5wbHVnaW5OYW1lIGFzIGFueSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudW5tb3VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIEhhcmQgcmVtb3VudFxuICAgICAgICAgICAgICAgIHRoaXMudW5tb3VudCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFuY2UgPSBkZWYuZmFjdG9yeSh7IGhvc3Q6IHRoaXMsIGZvcm06IHRoaXMuZm9ybSB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLmluc3RhbmNlLm1vdW50KHRoaXMubW91bnRQb2ludCwgdGhpcy5wbHVnaW5Qcm9wcywgc2VydmljZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdW5tb3VudCgpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZT8udW5tb3VudCgpO1xuICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluc3RhbmNlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBkaXNwb3NlKCkge1xuICAgICAgICAgICAgICAgIC8vIENhbGwgdGhpcyB3aGVuIHRoZSBjb21wb25lbnQgaXMgZGVzdHJveWVkIChpZiB5b3UgaGF2ZSBzdWNoIGEgaG9vaylcbiAgICAgICAgICAgICAgICB0aGlzLnVubW91bnQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9ic2VydmVyPy5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5vYnNlcnZlciA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5tb3VudFBvaW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnNlcnZpY2VzID0gbnVsbDtcbiAgICAgICAgfVxufVxuXG5leHBvcnQgdHlwZSBVSVBsdWdpbkZhY3Rvcnk8UHJvcHMgZXh0ZW5kcyBKc29uID0gSnNvbj4gPSAoYXJnczogeyBob3N0OiBUUGx1Z2luSG9zdDsgZm9ybTogVEZvcm0gfSkgPT4gVUlQbHVnaW5JbnN0YW5jZTxQcm9wcz47XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2l6ZUhpbnRzIHtcbiAgICAgICAgbWluV2lkdGg/OiBudW1iZXI7XG4gICAgICAgIG1pbkhlaWdodD86IG51bWJlcjtcbiAgICAgICAgcHJlZmVycmVkV2lkdGg/OiBudW1iZXI7XG4gICAgICAgIHByZWZlcnJlZEhlaWdodD86IG51bWJlcjtcbn1cblxuZXhwb3J0IHR5cGUgVUlQbHVnaW5EZWYgPSB7XG4gICAgICAgIGZhY3Rvcnk6IFVJUGx1Z2luRmFjdG9yeTtcbiAgICAgICAgLy8gb3B0aW9ubmVsIDogdW4gc2NoXHUwMEU5bWEgZGUgcHJvcHMsIGFpZGUgYXUgZGVzaWduZXJcbiAgICAgICAgLy8gcHJvcHM/OiBQcm9wU2NoZW1hO1xufTtcblxuZXhwb3J0IGNsYXNzIFBsdWdpblJlZ2lzdHJ5IHtcbiAgICAgICAgc3RhdGljIHBsdWdpblJlZ2lzdHJ5ID0gbmV3IFBsdWdpblJlZ2lzdHJ5KCk7XG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgcGx1Z2lucyA9IG5ldyBNYXA8c3RyaW5nLCBVSVBsdWdpbkRlZj4oKTtcblxuICAgICAgICByZWdpc3RlcihuYW1lOiBzdHJpbmcsIGRlZjogVUlQbHVnaW5EZWYpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wbHVnaW5zLmhhcyhuYW1lKSkgdGhyb3cgbmV3IEVycm9yKGBQbHVnaW4gYWxyZWFkeSByZWdpc3RlcmVkOiAke25hbWV9YCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW5zLnNldChuYW1lLCBkZWYpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0KG5hbWU6IHN0cmluZyk6IFVJUGx1Z2luRGVmIHwgdW5kZWZpbmVkIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wbHVnaW5zLmdldChuYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGhhcyhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wbHVnaW5zLmhhcyhuYW1lKTtcbiAgICAgICAgfVxufVxuIiwgImV4cG9ydCBjbGFzcyBNZXRhUm9vdCB7XG4gICAgICAgIHN0YXRpYyByZWFkb25seSBtZXRhY2xhc3M6IE1ldGFSb290ID0gbmV3IE1ldGFSb290KG51bGwpO1xuXG4gICAgICAgIHJlYWRvbmx5IHN1cGVyQ2xhc3M6IE1ldGFSb290IHwgbnVsbDtcbiAgICAgICAgcmVhZG9ubHkgdHlwZU5hbWU6IHN0cmluZztcblxuICAgICAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3Ioc3VwZXJDbGFzczogTWV0YVJvb3QgfCBudWxsLCB0eXBlTmFtZSA9ICdUTWV0YVJvb3QnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdXBlckNsYXNzID0gc3VwZXJDbGFzcztcbiAgICAgICAgICAgICAgICB0aGlzLnR5cGVOYW1lID0gdHlwZU5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0TWV0YWNsYXNzKCk6IE1ldGFSb290IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWV0YVJvb3QubWV0YWNsYXNzO1xuICAgICAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBNZXRhVGVzdEEgZXh0ZW5kcyBNZXRhUm9vdCB7XG4gICAgICAgIHN0YXRpYyByZWFkb25seSBtZXRhY2xhc3M6IE1ldGFUZXN0QSA9IG5ldyBNZXRhVGVzdEEoTWV0YVJvb3QubWV0YWNsYXNzKTtcblxuICAgICAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3Ioc3VwZXJDbGFzczogTWV0YVJvb3QpIHtcbiAgICAgICAgICAgICAgICBzdXBlcihzdXBlckNsYXNzLCAnVGVzdEEnKTtcbiAgICAgICAgfVxuICAgICAgICBnZXRNZXRhY2xhc3MoKTogTWV0YVRlc3RBIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWV0YVRlc3RBLm1ldGFjbGFzcztcbiAgICAgICAgfVxufVxuXG5leHBvcnQgY2xhc3MgTWV0YVRlc3RCIGV4dGVuZHMgTWV0YVRlc3RBIHtcbiAgICAgICAgc3RhdGljIHJlYWRvbmx5IG1ldGFjbGFzczogTWV0YVRlc3RCID0gbmV3IE1ldGFUZXN0QihNZXRhVGVzdEEubWV0YWNsYXNzKTtcblxuICAgICAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3Ioc3VwZXJDbGFzczogTWV0YVRlc3RBKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoc3VwZXJDbGFzcyk7XG4gICAgICAgICAgICAgICAgLy8gZXQgdm91cyBjaGFuZ2V6IGp1c3RlIGxlIG5vbSA6XG4gICAgICAgICAgICAgICAgKHRoaXMgYXMgYW55KS50eXBlTmFtZSA9ICdUZXN0Qic7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0TWV0YWNsYXNzKCk6IE1ldGFUZXN0QiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1ldGFUZXN0Qi5tZXRhY2xhc3M7XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1ldGFUZXN0QyBleHRlbmRzIE1ldGFUZXN0QiB7XG4gICAgICAgIHN0YXRpYyByZWFkb25seSBtZXRhY2xhc3M6IE1ldGFUZXN0QyA9IG5ldyBNZXRhVGVzdEMoTWV0YVRlc3RCLm1ldGFjbGFzcyk7XG5cbiAgICAgICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHN1cGVyQ2xhc3M6IE1ldGFUZXN0Qikge1xuICAgICAgICAgICAgICAgIHN1cGVyKHN1cGVyQ2xhc3MpO1xuICAgICAgICAgICAgICAgICh0aGlzIGFzIGFueSkudHlwZU5hbWUgPSAnVGVzdEMnO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0TWV0YWNsYXNzKCk6IE1ldGFUZXN0QyB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1ldGFUZXN0Qy5tZXRhY2xhc3M7XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRlc3QoKSB7XG4gICAgICAgIGxldCBjOiBNZXRhUm9vdCB8IG51bGwgPSBNZXRhVGVzdEMubWV0YWNsYXNzO1xuICAgICAgICB3aGlsZSAoYykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2MuZ2V0TWV0YWNsYXNzKCkudHlwZU5hbWV9IC0gJHtjLnR5cGVOYW1lfSAtPiAke2Muc3VwZXJDbGFzcz8udHlwZU5hbWV9YCk7XG4gICAgICAgICAgICAgICAgYyA9IGMuc3VwZXJDbGFzcztcbiAgICAgICAgfVxufVxuIiwgIi8vLyA8cmVmZXJlbmNlIGxpYj1cImRvbVwiIC8+XG5jb25zb2xlLmxvZygnSSBBTSBaQVpBJyk7XG4vL2ltcG9ydCB7IGluc3RhbGxEZWxwaGluZVJ1bnRpbWUgfSBmcm9tIFwiLi9zcmMvZHJ0XCI7IC8vIDwtLSBUUywgcGFzIC5qc1xuaW1wb3J0IHsgVEZvcm0sIFRDb2xvciwgVEFwcGxpY2F0aW9uLCBUQ29tcG9uZW50LCBUQnV0dG9uIH0gZnJvbSAnQHZjbCc7XG5pbXBvcnQgeyB0ZXN0IH0gZnJvbSAnLi90ZXN0JztcblxuLy9pbXBvcnQgeyBDb21wb25lbnRUeXBlUmVnaXN0cnkgfSBmcm9tICdAdmNsL1N0ZEN0cmxzJztcbi8vaW1wb3J0IHsgQ29tcG9uZW50UmVnaXN0cnkgfSBmcm9tICdAZHJ0L0NvbXBvbmVudFJlZ2lzdHJ5Jztcbi8vaW1wb3J0IHsgVFBsdWdpbkhvc3QgfSBmcm9tICdAZHJ0L1VJUGx1Z2luJztcbi8qXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJQbHVnaW5UeXBlcyhyZWc6IENvbXBvbmVudFR5cGVSZWdpc3RyeSk6IHZvaWQge1xuICAgICAgICAvICpcbiAgICAgICAgLy8gRXhhbXBsZTogYW55IHR5cGUgbmFtZSBjYW4gYmUgcHJvdmlkZWQgYnkgYSBwbHVnaW4uXG4gICAgICAgIHJlZy5yZWdpc3Rlci5yZWdpc3RlclR5cGUoJ2NoYXJ0anMtcGllJywgKG5hbWU6IHN0cmluZywgZm9ybTogVEZvcm0sIHBhcmVudDogVENvbXBvbmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUGx1Z2luSG9zdChuYW1lLCBmb3JtLCBwYXJlbnQpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZWcucmVnaXN0ZXJUeXBlKCd2dWUtaGVsbG8nLCAobmFtZTogc3RyaW5nLCBmb3JtOiBURm9ybSwgcGFyZW50OiBUQ29tcG9uZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQbHVnaW5Ib3N0KG5hbWUsIGZvcm0sIHBhcmVudCk7XG4gICAgICAgIH0pO1xuICAgICAgICAqIC9cbn1cbiovXG5jb25zb2xlLmxvZygnSSBBTSBaQVpBJyk7XG5cbmNsYXNzIFphemEgZXh0ZW5kcyBURm9ybSB7XG4gICAgICAgIC8vIEZvcm0gY29tcG9uZW50cyAtIFRoaXMgbGlzdCBpcyBhdXRvIGdlbmVyYXRlZCBieSBEZWxwaGluZVxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgLy9idXR0b24xIDogVEJ1dHRvbiA9IG5ldyBUQnV0dG9uKFwiYnV0dG9uMVwiLCB0aGlzLCB0aGlzKTtcbiAgICAgICAgLy9idXR0b24yIDogVEJ1dHRvbiA9IG5ldyBUQnV0dG9uKFwiYnV0dG9uMlwiLCB0aGlzLCB0aGlzKTtcbiAgICAgICAgLy9idXR0b24zIDogVEJ1dHRvbiA9IG5ldyBUQnV0dG9uKFwiYnV0dG9uM1wiLCB0aGlzLCB0aGlzKTtcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAgICAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIobmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgLy9pbXBvcnQgeyBpbnN0YWxsRGVscGhpbmVSdW50aW1lIH0gZnJvbSBcIi4vZHJ0XCI7XG5cbiAgICAgICAgLypcbmNvbnN0IHJ1bnRpbWUgPSB7ICAgXG4gIGhhbmRsZUNsaWNrKHsgZWxlbWVudCB9OiB7IGVsZW1lbnQ6IEVsZW1lbnQgfSkge1xuICAgIGNvbnNvbGUubG9nKFwiY2xpY2tlZCFcIiwgZWxlbWVudCk7XG4gICAgLy8oZWxlbWVudCBhcyBIVE1MRWxlbWVudCkuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJyZWRcIjtcbiAgfSxcbn07IFxuKi9cblxuICAgICAgICBwcm90ZWN0ZWQgb25NeUNyZWF0ZShfZXY6IEV2ZW50IHwgbnVsbCwgX3NlbmRlcjogVENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ0biA9IHRoaXMuY29tcG9uZW50UmVnaXN0cnkuZ2V0KCdidXR0b24yJyk7XG4gICAgICAgICAgICAgICAgaWYgKGJ0bikgYnRuLmNvbG9yID0gVENvbG9yLnJnYigwLCAwLCAyNTUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uTXlTaG93bihfZXY6IEV2ZW50IHwgbnVsbCwgX3NlbmRlcjogVENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ0biA9IHRoaXMuY29tcG9uZW50UmVnaXN0cnkuZ2V0KCdidXR0b24zJyk7XG4gICAgICAgICAgICAgICAgaWYgKGJ0bikgYnRuLmNvbG9yID0gVENvbG9yLnJnYigwLCAyNTUsIDI1NSk7XG4gICAgICAgIH1cblxuICAgICAgICBidXR0b24xX29uY2xpY2soX2V2OiBFdmVudCB8IG51bGwsIF9zZW5kZXI6IFRDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBidG4gPSB0aGlzLmNvbXBvbmVudFJlZ2lzdHJ5LmdldDxUQnV0dG9uPignYnV0dG9uMScpO1xuICAgICAgICAgICAgICAgIGlmICghYnRuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ2J1dHRvbjEgbm90IGZvdW5kIGluIHJlZ2lzdHJ5Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vYnRuLmNvbG9yID0gVENvbG9yLnJnYigwLCAwLCAyNTUpO1xuICAgICAgICAgICAgICAgIGJ0biEuY29sb3IgPSBUQ29sb3IucmdiKDI1NSwgMCwgMCk7XG4gICAgICAgICAgICAgICAgYnRuIS5jYXB0aW9uID0gJ01JTUknO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCdXR0b24xIGNsaWNrZWQhISEhJyk7XG4gICAgICAgIH1cblxuICAgICAgICB6YXphX29uY2xpY2soX2V2OiBFdmVudCB8IG51bGwsIF9zZW5kZXI6IFRDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBidG4gPSB0aGlzLmNvbXBvbmVudFJlZ2lzdHJ5LmdldDxUQnV0dG9uPignYnV0dG9ueCcpO1xuICAgICAgICAgICAgICAgIGJ0biEuY29sb3IgPSBUQ29sb3IucmdiKDAsIDI1NSwgMCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3phemEgY2xpY2tlZCEhISEnKTtcbiAgICAgICAgICAgICAgICAvL2J0biEuZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9pbnN0YWxsRGVscGhpbmVSdW50aW1lKHJ1bnRpbWUpO1xufSAvLyBjbGFzcyB6YXphXG5cbmNsYXNzIE15QXBwbGljYXRpb24gZXh0ZW5kcyBUQXBwbGljYXRpb24ge1xuICAgICAgICB6YXphOiBaYXphO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy56YXphID0gbmV3IFphemEoJ3phemEnKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1haW5Gb3JtID0gdGhpcy56YXphO1xuICAgICAgICB9XG5cbiAgICAgICAgcnVuKCkge1xuICAgICAgICAgICAgICAgIC8vdGhpcy56YXphLmNvbXBvbmVudFJlZ2lzdHJ5LmJ1aWxkQ29tcG9uZW50VHJlZSh0aGlzLnphemEpO1xuICAgICAgICAgICAgICAgIC8vdGhpcy56YXphLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyk7XG5cbiAgICAgICAgICAgICAgICAvLyBhdSBsYW5jZW1lbnRcbiAgICAgICAgICAgICAgICB0aGlzLnJ1bldoZW5Eb21SZWFkeSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnphemEuc2hvdygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG59IC8vIGNsYXNzIE15QXBwbGljYXRpb25cblxuY29uc3QgbXlBcHBsaWNhdGlvbjogTXlBcHBsaWNhdGlvbiA9IG5ldyBNeUFwcGxpY2F0aW9uKCk7XG50ZXN0KCk7XG5teUFwcGxpY2F0aW9uLnJ1bigpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7QUFFTyxTQUFTLGlCQUFpQixPQUErQjtBQUN4RCxRQUFNLFNBQVMsWUFBWSxTQUFTO0FBQ3BDLFFBQU0sU0FBUyxnQkFBZ0IsU0FBUztBQUN4QyxRQUFNLFNBQVMsVUFBVSxTQUFTO0FBQ2xDLFFBQU0sU0FBUyxXQUFXLFNBQVM7QUFHM0M7OztBQ0VPLElBQU0sU0FBTixNQUFNLFFBQU87QUFBQSxFQUdaLFlBQVksR0FBVztBQUZ2QjtBQUdRLFNBQUssSUFBSTtBQUFBLEVBQ2pCO0FBQUE7QUFBQSxFQUNjLE9BQU8sSUFBSSxHQUFXLEdBQVcsR0FBbUI7QUFDMUQsV0FBTyxJQUFJLFFBQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRztBQUFBLEVBQ2pEO0FBQUE7QUFBQSxFQUNjLE9BQU8sS0FBSyxHQUFXLEdBQVcsR0FBVyxHQUFtQjtBQUN0RSxXQUFPLElBQUksUUFBTyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRztBQUFBLEVBQ3hEO0FBQ1I7QUFFTyxJQUFNLFdBQU4sTUFBZTtBQUFBLEVBR2QsWUFBWSxHQUFXO0FBRnZCO0FBR1EsU0FBSyxJQUFJO0FBQUEsRUFDakI7QUFBQSxFQUNBLEtBQUssTUFBYSxhQUFxQixJQUFXLFFBQWE7QUFDdkQsVUFBTSxjQUFlLEtBQWEsS0FBSyxDQUFDO0FBQ3hDLFFBQUksT0FBTyxnQkFBZ0IsWUFBWTtBQUMvQixjQUFRLElBQUksZ0JBQWdCLFdBQVc7QUFDdkMsYUFBTztBQUFBLElBQ2Y7QUFHQSxJQUFDLFlBQW1ELEtBQUssTUFBTSxJQUFJLFVBQVUsSUFBSTtBQUFBLEVBQ3pGO0FB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QUFBQSxFQUNkO0FBQ1I7OztBQ3pEQSxRQUFRLElBQUksV0FBVztBQXNCdkIsUUFBUSxJQUFJLFdBQVc7QUFFdkIsSUFBTSxPQUFOLGNBQW1CLE1BQU07QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQVFqQixZQUFZLE1BQWM7QUFDbEIsVUFBTSxJQUFJO0FBQUEsRUFDbEI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQVlVLFdBQVcsS0FBbUIsU0FBcUI7QUFDckQsVUFBTSxNQUFNLEtBQUssa0JBQWtCLElBQUksU0FBUztBQUNoRCxRQUFJLElBQUssS0FBSSxRQUFRLE9BQU8sSUFBSSxHQUFHLEdBQUcsR0FBRztBQUFBLEVBQ2pEO0FBQUEsRUFFVSxVQUFVLEtBQW1CLFNBQXFCO0FBQ3BELFVBQU0sTUFBTSxLQUFLLGtCQUFrQixJQUFJLFNBQVM7QUFDaEQsUUFBSSxJQUFLLEtBQUksUUFBUSxPQUFPLElBQUksR0FBRyxLQUFLLEdBQUc7QUFBQSxFQUNuRDtBQUFBLEVBRUEsZ0JBQWdCLEtBQW1CLFNBQXFCO0FBQ2hELFVBQU0sTUFBTSxLQUFLLGtCQUFrQixJQUFhLFNBQVM7QUFDekQsUUFBSSxDQUFDLEtBQUs7QUFDRixjQUFRLEtBQUssK0JBQStCO0FBQzVDO0FBQUEsSUFDUjtBQUVBLFFBQUssUUFBUSxPQUFPLElBQUksS0FBSyxHQUFHLENBQUM7QUFDakMsUUFBSyxVQUFVO0FBQ2YsWUFBUSxJQUFJLHFCQUFxQjtBQUFBLEVBQ3pDO0FBQUEsRUFFQSxhQUFhLEtBQW1CLFNBQXFCO0FBQzdDLFVBQU0sTUFBTSxLQUFLLGtCQUFrQixJQUFhLFNBQVM7QUFDekQsUUFBSyxRQUFRLE9BQU8sSUFBSSxHQUFHLEtBQUssQ0FBQztBQUNqQyxZQUFRLElBQUksa0JBQWtCO0FBQUEsRUFFdEM7QUFBQTtBQUdSO0FBRUEsSUFBTSxnQkFBTixjQUE0QixhQUFhO0FBQUEsRUFHakMsY0FBYztBQUNOLFVBQU07QUFIZDtBQUlRLFNBQUssT0FBTyxJQUFJLEtBQUssTUFBTTtBQUMzQixTQUFLLFdBQVcsS0FBSztBQUFBLEVBQzdCO0FBQUEsRUFFQSxNQUFNO0FBS0UsU0FBSyxnQkFBZ0IsTUFBTTtBQUNuQixXQUFLLEtBQUssS0FBSztBQUFBLElBQ3ZCLENBQUM7QUFBQSxFQUNUO0FBQ1I7QUFFQSxJQUFNLGdCQUErQixJQUFJLGNBQWM7QUFDdkQsS0FBSztBQUNMLGNBQWMsSUFBSTsiLAogICJuYW1lcyI6IFsiVENvbXBvbmVudFR5cGVSZWdpc3RyeSIsICJlbCJdCn0K
