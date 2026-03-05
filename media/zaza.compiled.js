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
  // NOTE: This is runtime data, so it must be initialized (no "declare").
  //props: ComponentProps;
  /** May contain child components */
  //_onclick: THandler = new THandler('');
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
    const handler = this.props.onclick;
    return handler ?? new THandler("");
  }
  set onclick(handler) {
    this.props.onclick = handler;
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
        //apply: (o, v) => (o.onclick = new THandler(String(v)))
        apply: (o, v) => o.onclick = v
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
  getMetaclass() {
    return TMetaButton.metaclass;
  }
  htmlButton() {
    return this.htmlElement;
  }
  //_caption: string = '';
  //_enabled: boolean = true;
  /*
  protected get bprops(): ButtonProps {
          return this.props as ButtonProps;
  }
          */
  get caption() {
    return this.props.caption ?? "Caption";
  }
  set caption(caption) {
    this.props.caption = caption;
    const el = this.htmlElement;
    if (!el) return;
    el.textContent = this.caption;
  }
  get enabled() {
    return this.props.enabled ?? true;
  }
  set enabled(enabled) {
    this.props.enabled = enabled;
    this.htmlButton().disabled = !enabled;
  }
  constructor(name, form, parent) {
    super(name, form, parent);
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
    //private factory: UIPluginFactory | null = null;
    __publicField(this, "mountPoint", null);
    __publicField(this, "observer", null);
    __publicField(this, "updateScheduled", false);
  }
  /** Replace ALL plugin props (rare). */
  setPluginProps(next) {
    this.pluginProps = next ?? {};
    this.scheduleUpdate();
  }
  /** Patch one prop (common). */
  setPluginProp(name, value) {
    this.pluginProps[name] = value;
    this.scheduleUpdate();
  }
  /** Patch many props at once (preferred). */
  patchPluginProps(patch) {
    Object.assign(this.pluginProps, patch);
    this.scheduleUpdate();
  }
  getPluginProp(name) {
    return this.pluginProps[name];
  }
  scheduleUpdate() {
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
  setPluginSpec(spec) {
    this.pluginName = spec.plugin;
    this.pluginProps = spec.props ?? {};
  }
  /*
  // Called by the metaclass (or by your registry) right after creation
  setPluginFactory(factory: UIPluginFactory) {
          this.factory = factory;
  }
          */
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL3ZjbC9yZWdpc3RlclZjbC50cyIsICIuLi9zcmMvdmNsL1N0ZEN0cmxzLnRzIiwgIi4uL3NyYy92Y2wvcGx1Z2luLnRzIiwgIi4uL2V4YW1wbGVzL3phemEvdGVzdC50cyIsICIuLi9leGFtcGxlcy96YXphL3phemEudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IFRDb21wb25lbnRUeXBlUmVnaXN0cnksIFRNZXRhQnV0dG9uLCBUTWV0YVBsdWdpbkhvc3QsIFRNZXRhRm9ybSwgVE1ldGFQYW5lbCB9IGZyb20gJ0B2Y2wnO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJCdWlsdGlucyh0eXBlczogVENvbXBvbmVudFR5cGVSZWdpc3RyeSkge1xuICAgICAgICB0eXBlcy5yZWdpc3RlcihUTWV0YUJ1dHRvbi5tZXRhY2xhc3MpO1xuICAgICAgICB0eXBlcy5yZWdpc3RlcihUTWV0YVBsdWdpbkhvc3QubWV0YWNsYXNzKTtcbiAgICAgICAgdHlwZXMucmVnaXN0ZXIoVE1ldGFGb3JtLm1ldGFjbGFzcyk7XG4gICAgICAgIHR5cGVzLnJlZ2lzdGVyKFRNZXRhUGFuZWwubWV0YWNsYXNzKTtcbiAgICAgICAgLy8gdHlwZXMucmVnaXN0ZXIoVEVkaXRDbGFzcyk7XG4gICAgICAgIC8vIHR5cGVzLnJlZ2lzdGVyKFRMYWJlbENsYXNzKTtcbn1cbiIsICJpbXBvcnQgeyByZWdpc3RlckJ1aWx0aW5zIH0gZnJvbSAnLi9yZWdpc3RlclZjbCc7XG4vL2ltcG9ydCB7IFRvdG8gfSBmcm9tICcuL3BsdWdpbic7XG5pbXBvcnQgdHlwZSB7IElQbHVnaW5Ib3N0IH0gZnJvbSAnLi9JUGx1Z2luJztcblxuLypcbiAgIFRvIGNyZWF0ZSBhIG5ldyBjb21wb25lbnQgdHlwZTpcblxuICAgVG8gY3JlYXRlIGEgbmV3IGNvbXBvbmVudCBhdHRyaWJ1dFxuXG4qL1xuXG5leHBvcnQgY2xhc3MgVENvbG9yIHtcbiAgICAgICAgczogc3RyaW5nO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHM6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHRoaXMucyA9IHM7XG4gICAgICAgIH1cbiAgICAgICAgLyogZmFjdG9yeSAqLyBzdGF0aWMgcmdiKHI6IG51bWJlciwgZzogbnVtYmVyLCBiOiBudW1iZXIpOiBUQ29sb3Ige1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVENvbG9yKGByZ2IoJHtyfSwgJHtnfSwgJHtifSlgKTtcbiAgICAgICAgfVxuICAgICAgICAvKiBmYWN0b3J5ICovIHN0YXRpYyByZ2JhKHI6IG51bWJlciwgZzogbnVtYmVyLCBiOiBudW1iZXIsIGE6IG51bWJlcik6IFRDb2xvciB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUQ29sb3IoYHJnYmEoJHtyfSwgJHtnfSwgJHtifSwgJHthfSlgKTtcbiAgICAgICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVEhhbmRsZXIge1xuICAgICAgICBzOiBzdHJpbmc7XG5cbiAgICAgICAgY29uc3RydWN0b3Ioczogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zID0gcztcbiAgICAgICAgfVxuICAgICAgICBmaXJlKGZvcm06IFRGb3JtLCBoYW5kbGVyTmFtZTogc3RyaW5nLCBldjogRXZlbnQsIHNlbmRlcjogYW55KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF5YmVNZXRob2QgPSAoZm9ybSBhcyBhbnkpW3RoaXMuc107XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBtYXliZU1ldGhvZCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ05PVCBBIE1FVEhPRCcsIGhhbmRsZXJOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBJZiBzZW5kZXIgaXMgbWlzc2luZywgZmFsbGJhY2sgdG8gdGhlIGZvcm0gaXRzZWxmIChzYWZlKVxuICAgICAgICAgICAgICAgIChtYXliZU1ldGhvZCBhcyAoZXZlbnQ6IEV2ZW50LCBzZW5kZXI6IGFueSkgPT4gYW55KS5jYWxsKGZvcm0sIGV2LCBzZW5kZXIgPz8gdGhpcyk7XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IHR5cGUgQ29tcG9uZW50RmFjdG9yeSA9IChuYW1lOiBzdHJpbmcsIGZvcm06IFRGb3JtLCBvd25lcjogVENvbXBvbmVudCkgPT4gVENvbXBvbmVudDtcblxudHlwZSBQcm9wS2luZCA9ICdzdHJpbmcnIHwgJ251bWJlcicgfCAnYm9vbGVhbicgfCAnY29sb3InIHwgJ2hhbmRsZXInO1xuXG5leHBvcnQgdHlwZSBQcm9wU3BlYzxULCBWID0gdW5rbm93bj4gPSB7XG4gICAgICAgIG5hbWU6IHN0cmluZztcbiAgICAgICAga2luZDogUHJvcEtpbmQ7XG4gICAgICAgIHJldHJpZXZlOiAob2JqOiBUKSA9PiBWO1xuICAgICAgICBhcHBseTogKG9iajogVCwgdmFsdWU6IFYpID0+IHZvaWQ7XG59O1xuXG50eXBlIFVua25vd25SZWNvcmQgPSBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbmV4cG9ydCB0eXBlIENvbXBvbmVudFByb3BzID0gUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbmNvbnN0IFJFU0VSVkVEX0RBVEFfQVRUUlMgPSBuZXcgU2V0PHN0cmluZz4oW1xuICAgICAgICAnZGF0YS1jb21wb25lbnQnLFxuICAgICAgICAnZGF0YS1uYW1lJyxcbiAgICAgICAgJ2RhdGEtcHJvcHMnLFxuICAgICAgICAnZGF0YS1wbHVnaW4nLFxuICAgICAgICAnZGF0YS1tZXNzYWdlJyAvLyBhZGQgYW55IG1ldGEvZnJhbWV3b3JrIGF0dHJzIHlvdSBkb24ndCB3YW50IHRyZWF0ZWQgYXMgcHJvcHNcbl0pO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVE1ldGFjbGFzcyB7XG4gICAgICAgIHJlYWRvbmx5IHR5cGVOYW1lOiBzdHJpbmcgPSAnVE1ldGFjbGFzcyc7XG4gICAgICAgIHN0YXRpYyBtZXRhY2xhc3M6IFRNZXRhY2xhc3M7XG4gICAgICAgIHJlYWRvbmx5IHN1cGVyQ2xhc3M6IFRNZXRhY2xhc3MgfCBudWxsID0gbnVsbDtcblxuICAgICAgICBhYnN0cmFjdCBnZXRNZXRhY2xhc3MoKTogVE1ldGFjbGFzcztcbiAgICAgICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHN1cGVyQ2xhc3M6IFRNZXRhY2xhc3MgfCBudWxsLCB0eXBlTmFtZSA9ICdUTWV0YWNsYXNzJykge1xuICAgICAgICAgICAgICAgIHRoaXMuc3VwZXJDbGFzcyA9IHN1cGVyQ2xhc3M7XG4gICAgICAgICAgICAgICAgdGhpcy50eXBlTmFtZSA9IHR5cGVOYW1lO1xuICAgICAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUT2JqZWN0IHtcbiAgICAgICAgZ2V0TWV0YUNsYXNzKCk6IFRNZXRhT2JqZWN0IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFPYmplY3QubWV0YUNsYXNzO1xuICAgICAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUTWV0YU9iamVjdCBleHRlbmRzIFRNZXRhY2xhc3Mge1xuICAgICAgICBzdGF0aWMgcmVhZG9ubHkgbWV0YUNsYXNzOiBUTWV0YU9iamVjdCA9IG5ldyBUTWV0YU9iamVjdChUTWV0YWNsYXNzLm1ldGFjbGFzcywgJ1RPYmplY3QnKTtcblxuICAgICAgICBnZXRNZXRhY2xhc3MoKTogVE1ldGFPYmplY3Qge1xuICAgICAgICAgICAgICAgIHJldHVybiBUTWV0YU9iamVjdC5tZXRhQ2xhc3M7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3RydWN0b3Ioc3VwZXJDbGFzczogVE1ldGFjbGFzcywgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoc3VwZXJDbGFzcywgbmFtZSk7XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRDb21wb25lbnQge1xuICAgICAgICBnZXRNZXRhY2xhc3MoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhQ29tcG9uZW50Lm1ldGFjbGFzcztcbiAgICAgICAgfVxuXG4gICAgICAgIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcbiAgICAgICAgcmVhZG9ubHkgcGFyZW50OiBUQ29tcG9uZW50IHwgbnVsbCA9IG51bGw7XG5cbiAgICAgICAgcHJvcHM6IENvbXBvbmVudFByb3BzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICAgICAgICBnZXRQcm9wPFQgPSB1bmtub3duPihuYW1lOiBzdHJpbmcpOiBUIHwgdW5kZWZpbmVkIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9wc1tuYW1lXSBhcyBUIHwgdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgc2V0UHJvcChuYW1lOiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKTogdm9pZCB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gb3B0aW9uYWxcbiAgICAgICAgaGFzUHJvcChuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMucHJvcHMsIG5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIC8vcHJvdGVjdGVkIHByb3BzOiBDb21wb25lbnRQcm9wcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgIGZvcm06IFRGb3JtIHwgbnVsbCA9IG51bGw7XG4gICAgICAgIGNoaWxkcmVuOiBUQ29tcG9uZW50W10gPSBbXTtcblxuICAgICAgICBlbGVtOiBFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgICAgIGdldCBodG1sRWxlbWVudCgpOiBIVE1MRWxlbWVudCB8IG51bGwge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmVsZW0gYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgZm9ybTogVEZvcm0gfCBudWxsLCBwYXJlbnQ6IFRDb21wb25lbnQgfCBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICAgICAgICAgICAgICBwYXJlbnQ/LmNoaWxkcmVuLnB1c2godGhpcyk7IC8vIENvdWxkIGJlIGRvbmUgaW4gYnVpbGRDb21wb25lbnRUcmVlKClcbiAgICAgICAgICAgICAgICB0aGlzLmZvcm0gPSBmb3JtO1xuXG4gICAgICAgICAgICAgICAgLy8gSU1QT1JUQU5UOiBJbml0aWFsaXplIHByb3BzIGF0IHJ1bnRpbWUgKGRlY2xhcmUgd291bGQgbm90IGRvIGl0KS5cbiAgICAgICAgICAgICAgICAvL3RoaXMucHJvcHMgPSB7fTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5PVEU6IFRoaXMgaXMgcnVudGltZSBkYXRhLCBzbyBpdCBtdXN0IGJlIGluaXRpYWxpemVkIChubyBcImRlY2xhcmVcIikuXG4gICAgICAgIC8vcHJvcHM6IENvbXBvbmVudFByb3BzO1xuXG4gICAgICAgIC8qKiBNYXkgY29udGFpbiBjaGlsZCBjb21wb25lbnRzICovXG4gICAgICAgIC8vX29uY2xpY2s6IFRIYW5kbGVyID0gbmV3IFRIYW5kbGVyKCcnKTtcbiAgICAgICAgYWxsb3dzQ2hpbGRyZW4oKTogYm9vbGVhbiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0IGNvbG9yKCk6IFRDb2xvciB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUQ29sb3IodGhpcy5nZXRIdG1sU3R5bGVQcm9wKCdjb2xvcicpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNldCBjb2xvcihjb2xvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0SHRtbFN0eWxlUHJvcCgnY29sb3InLCBjb2xvci5zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdldCBvbmNsaWNrKCk6IFRIYW5kbGVyIHtcbiAgICAgICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5wcm9wcy5vbmNsaWNrIGFzIFRIYW5kbGVyO1xuICAgICAgICAgICAgICAgIHJldHVybiBoYW5kbGVyID8/IG5ldyBUSGFuZGxlcignJyk7XG4gICAgICAgIH1cblxuICAgICAgICBzZXQgb25jbGljayhoYW5kbGVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbmNsaWNrID0gaGFuZGxlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHN5bmNEb21Gcm9tUHJvcHMoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZWwgPSB0aGlzLmh0bWxFbGVtZW50O1xuICAgICAgICAgICAgICAgIGlmICghZWwpIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGdldCBiYWNrZ3JvdW5kQ29sb3IoKTogVENvbG9yIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRDb2xvcih0aGlzLmdldEh0bWxTdHlsZVByb3AoJ2JhY2tncm91bmQtY29sb3InKSk7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IGJhY2tncm91bmRDb2xvcih2OiBUQ29sb3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEh0bWxTdHlsZVByb3AoJ2JhY2tncm91bmQtY29sb3InLCB2LnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0IHdpZHRoKCk6IHN0cmluZyB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SHRtbFByb3AoJ3dpZHRoJykgPz8gJyc7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IHdpZHRoKHY6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0SHRtbFByb3AoJ3dpZHRoJywgdik7XG4gICAgICAgIH1cblxuICAgICAgICBnZXQgaGVpZ2h0KCk6IHN0cmluZyB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SHRtbFByb3AoJ2hlaWdodCcpID8/ICcnO1xuICAgICAgICB9XG4gICAgICAgIHNldCBoZWlnaHQodjogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRIdG1sUHJvcCgnaGVpZ2h0Jywgdik7XG4gICAgICAgIH1cblxuICAgICAgICBnZXQgb2Zmc2V0V2lkdGgoKTogbnVtYmVyIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5odG1sRWxlbWVudCEub2Zmc2V0V2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IG9mZnNldEhlaWdodCgpOiBudW1iZXIge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmh0bWxFbGVtZW50IS5vZmZzZXRIZWlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICBzZXRIdG1sU3R5bGVQcm9wKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHRoaXMuaHRtbEVsZW1lbnQhLnN0eWxlLnNldFByb3BlcnR5KG5hbWUsIHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdldEh0bWxTdHlsZVByb3AobmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaHRtbEVsZW1lbnQhLnN0eWxlLmdldFByb3BlcnR5VmFsdWUobmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICBzZXRIdG1sUHJvcChuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmh0bWxFbGVtZW50IS5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0SHRtbFByb3AobmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMhLmh0bWxFbGVtZW50IS5nZXRBdHRyaWJ1dGUobmFtZSk7XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRNZXRhQ29tcG9uZW50IGV4dGVuZHMgVE1ldGFjbGFzcyB7XG4gICAgICAgIHN0YXRpYyByZWFkb25seSBtZXRhY2xhc3MgPSBuZXcgVE1ldGFDb21wb25lbnQoVE1ldGFjbGFzcy5tZXRhY2xhc3MsICdUQ29tcG9uZW50Jyk7XG4gICAgICAgIC8vIFRoZSBzeW1ib2xpYyBuYW1lIHVzZWQgaW4gSFRNTDogZGF0YS1jb21wb25lbnQ9XCJUQnV0dG9uXCIgb3IgXCJteS1idXR0b25cIlxuICAgICAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3Ioc3VwZXJDbGFzczogVE1ldGFjbGFzcywgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoc3VwZXJDbGFzcywgbmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICBnZXRNZXRhY2xhc3MoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhQ29tcG9uZW50Lm1ldGFjbGFzcztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgcnVudGltZSBpbnN0YW5jZSBhbmQgYXR0YWNoIGl0IHRvIHRoZSBET00gZWxlbWVudC5cbiAgICAgICAgY3JlYXRlKG5hbWU6IHN0cmluZywgZm9ybTogVEZvcm0sIHBhcmVudDogVENvbXBvbmVudCk6IFRDb21wb25lbnQge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVENvbXBvbmVudChuYW1lLCBmb3JtLCBwYXJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVmUHJvcHMoKTogUHJvcFNwZWM8YW55PltdIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICAgICAgLy97IG5hbWU6ICdjb2xvcicsIGtpbmQ6ICdjb2xvcicsIGFwcGx5OiAobywgdikgPT4gKG8uY29sb3IgPSBuZXcgVENvbG9yKFN0cmluZyh2KSkpIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdvbmNsaWNrJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2luZDogJ2hhbmRsZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXRyaWV2ZTogKG8pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gby5vbmNsaWNrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2FwcGx5OiAobywgdikgPT4gKG8ub25jbGljayA9IG5ldyBUSGFuZGxlcihTdHJpbmcodikpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBseTogKG8sIHYpID0+IChvLm9uY2xpY2sgPSB2IGFzIFRIYW5kbGVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy97IG5hbWU6ICdvbmNyZWF0ZScsIGtpbmQ6ICdoYW5kbGVyJywgYXBwbHk6IChvLCB2KSA9PiAoby5vbmNyZWF0ZSA9IG5ldyBUSGFuZGxlcihTdHJpbmcodikpKSB9XG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvbUV2ZW50cz8oKTogc3RyaW5nW107IC8vIGRlZmF1bHQgW107XG59XG5cbmV4cG9ydCBjbGFzcyBUTWV0YUNvbXBvbmVudFR5cGVSZWdpc3RyeSBleHRlbmRzIFRNZXRhT2JqZWN0IHtcbiAgICAgICAgc3RhdGljIHJlYWRvbmx5IG1ldGFjbGFzczogVE1ldGFDb21wb25lbnRUeXBlUmVnaXN0cnkgPSBuZXcgVE1ldGFDb21wb25lbnRUeXBlUmVnaXN0cnkoVE1ldGFPYmplY3QubWV0YUNsYXNzLCAnVENvbXBvbmVudFR5cGVSZWdpc3RyeScpO1xuICAgICAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3Ioc3VwZXJDbGFzczogVE1ldGFPYmplY3QsIG5hbWU6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHN1cGVyKHN1cGVyQ2xhc3MsIG5hbWUpO1xuICAgICAgICAgICAgICAgIC8vIGV0IHZvdXMgY2hhbmdleiBqdXN0ZSBsZSBub20gOlxuICAgICAgICB9XG4gICAgICAgIGdldE1ldGFjbGFzcygpOiBUTWV0YUNvbXBvbmVudFR5cGVSZWdpc3RyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhQ29tcG9uZW50VHlwZVJlZ2lzdHJ5Lm1ldGFjbGFzcztcbiAgICAgICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVENvbXBvbmVudFR5cGVSZWdpc3RyeSBleHRlbmRzIFRPYmplY3Qge1xuICAgICAgICAvLyBXZSBzdG9yZSBoZXRlcm9nZW5lb3VzIG1ldGFzLCBzbyB3ZSBrZWVwIHRoZW0gYXMgVE1ldGFDb21wb25lbnQ8YW55Pi5cbiAgICAgICAgZ2V0TWV0YWNsYXNzKCk6IFRNZXRhQ29tcG9uZW50VHlwZVJlZ2lzdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFDb21wb25lbnRUeXBlUmVnaXN0cnkubWV0YUNsYXNzO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgY2xhc3NlcyA9IG5ldyBNYXA8c3RyaW5nLCBUTWV0YUNvbXBvbmVudD4oKTtcblxuICAgICAgICByZWdpc3RlcihtZXRhOiBUTWV0YUNvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNsYXNzZXMuaGFzKG1ldGEudHlwZU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENvbXBvbmVudCB0eXBlIGFscmVhZHkgcmVnaXN0ZXJlZDogJHttZXRhLnR5cGVOYW1lfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmNsYXNzZXMuc2V0KG1ldGEudHlwZU5hbWUsIG1ldGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgeW91IGp1c3QgbmVlZCBcInNvbWV0aGluZyBtZXRhXCIsIHJldHVybiBhbnktbWV0YS5cbiAgICAgICAgZ2V0KHR5cGVOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jbGFzc2VzLmdldCh0eXBlTmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICBoYXModHlwZU5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNsYXNzZXMuaGFzKHR5cGVOYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxpc3QoKTogc3RyaW5nW10ge1xuICAgICAgICAgICAgICAgIHJldHVybiBbLi4udGhpcy5jbGFzc2VzLmtleXMoKV0uc29ydCgpO1xuICAgICAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUTWV0YUNvbXBvbmVudFJlZ2lzdHJ5IGV4dGVuZHMgVE1ldGFjbGFzcyB7XG4gICAgICAgIHN0YXRpYyByZWFkb25seSBtZXRhY2xhc3M6IFRNZXRhQ29tcG9uZW50UmVnaXN0cnkgPSBuZXcgVE1ldGFDb21wb25lbnRSZWdpc3RyeShUTWV0YWNsYXNzLm1ldGFjbGFzcywgJ1RDb21wb25lbnRUeXBlUmVnaXN0cnknKTtcblxuICAgICAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3Ioc3VwZXJDbGFzczogVE1ldGFjbGFzcywgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoc3VwZXJDbGFzcywgbmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0TWV0YWNsYXNzKCk6IFRNZXRhQ29tcG9uZW50UmVnaXN0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiBUTWV0YUNvbXBvbmVudFJlZ2lzdHJ5Lm1ldGFjbGFzcztcbiAgICAgICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVENvbXBvbmVudFJlZ2lzdHJ5IGV4dGVuZHMgVE9iamVjdCB7XG4gICAgICAgIC8vX3RvdG86IFRvdG8gPSBuZXcgVG90bygpO1xuICAgICAgICBnZXRNZXRhY2xhc3MoKTogVE1ldGFDb21wb25lbnRSZWdpc3RyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhQ29tcG9uZW50UmVnaXN0cnkubWV0YWNsYXNzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBpbnN0YW5jZXMgPSBuZXcgTWFwPHN0cmluZywgVENvbXBvbmVudD4oKTtcblxuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgICAgICBzdXBlcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVnaXN0ZXJJbnN0YW5jZShuYW1lOiBzdHJpbmcsIGM6IFRDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluc3RhbmNlcy5zZXQobmFtZSwgYyk7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0PFQgZXh0ZW5kcyBUQ29tcG9uZW50ID0gVENvbXBvbmVudD4obmFtZTogc3RyaW5nKTogVCB8IHVuZGVmaW5lZCB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW5zdGFuY2VzLmdldChuYW1lKSBhcyBUIHwgdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgY2xlYXIoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZXMuY2xlYXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc29sdmVSb290KCk6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgICAgICAgICAvLyBQcmVmZXIgYm9keSBhcyB0aGUgY2Fub25pY2FsIHJvb3QuXG4gICAgICAgICAgICAgICAgaWYgKGRvY3VtZW50LmJvZHk/LmRhdGFzZXQ/LmNvbXBvbmVudCkgcmV0dXJuIGRvY3VtZW50LmJvZHk7XG5cbiAgICAgICAgICAgICAgICAvLyBCYWNrd2FyZCBjb21wYXRpYmlsaXR5OiBvbGQgd3JhcHBlciBkaXYuXG4gICAgICAgICAgICAgICAgY29uc3QgbGVnYWN5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RlbHBoaW5lLXJvb3QnKTtcbiAgICAgICAgICAgICAgICBpZiAobGVnYWN5KSByZXR1cm4gbGVnYWN5O1xuXG4gICAgICAgICAgICAgICAgLy8gTGFzdCByZXNvcnQuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmJvZHkgPz8gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBjb252ZXJ0KHJhdzogc3RyaW5nLCBraW5kOiBQcm9wS2luZCkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmF3ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChraW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJhdztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gTnVtYmVyKHJhdyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByYXcgPT09ICd0cnVlJyB8fCByYXcgPT09ICcxJyB8fCByYXcgPT09ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdjb2xvcic6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUQ29sb3IocmF3KTsgLy8gb3UgcGFyc2UgZW4gVENvbG9yIHNpIHZvdXMgYXZlelxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdoYW5kbGVyJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRIYW5kbGVyKHJhdyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByYXc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLSBQcm9wZXJ0aWVzIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpbmQgdGhlIG5lYXJlc3QgUHJvcFNwZWMgZm9yIGEgcHJvcCBuYW1lIGJ5IHdhbGtpbmcgbWV0YSBpbmhlcml0YW5jZTpcbiAgICAgICAgICogbWV0YSAtPiBtZXRhLnN1cGVyQ2xhc3MgLT4gLi4uXG4gICAgICAgICAqIFVzZXMgY2FjaGluZyBmb3Igc3BlZWQuXG4gICAgICAgICAqL1xuICAgICAgICBwcml2YXRlIHJlc29sdmVOZWFyZXN0UHJvcFNwZWMobWV0YTogVE1ldGFDb21wb25lbnQsIHByb3BOYW1lOiBzdHJpbmcpOiBQcm9wU3BlYzxhbnk+IHwgbnVsbCB7XG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICBsZXQgcGVyTWV0YSA9IHRoaXMuX3Byb3BTcGVjQ2FjaGUuZ2V0KG1ldGEpO1xuICAgICAgICAgICAgICAgIGlmICghcGVyTWV0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGVyTWV0YSA9IG5ldyBNYXA8c3RyaW5nLCBQcm9wU3BlYzxhbnk+IHwgbnVsbD4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Byb3BTcGVjQ2FjaGUuc2V0KG1ldGEsIHBlck1ldGEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChwZXJNZXRhLmhhcyhwcm9wTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwZXJNZXRhLmdldChwcm9wTmFtZSkhO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgICAgICAvLyBXYWxrIHVwIG1ldGFjbGFzcyBpbmhlcml0YW5jZTogY2hpbGQgZmlyc3QgKG5lYXJlc3Qgd2lucylcbiAgICAgICAgICAgICAgICBsZXQgbWM6IFRNZXRhQ29tcG9uZW50IHwgbnVsbCA9IG1ldGE7XG5cbiAgICAgICAgICAgICAgICB3aGlsZSAobWMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbWMuZGVmUHJvcHMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVmcyA9IG1jLmRlZlByb3BzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3BlYyBvZiBkZWZzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNwZWMubmFtZSA9PT0gcHJvcE5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vcGVyTWV0YS5zZXQocHJvcE5hbWUsIHNwZWMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNwZWM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBtYyA9IChtYy5zdXBlckNsYXNzIGFzIFRNZXRhQ29tcG9uZW50KSA/PyBudWxsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vcGVyTWV0YS5zZXQocHJvcE5hbWUsIG51bGwpO1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBhcHBseVByb3BzRnJvbVNvdXJjZShjb21wOiBUQ29tcG9uZW50LCBzcmM6IFVua25vd25SZWNvcmQsIG1ldGE6IFRNZXRhQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBbbmFtZSwgcmF3VmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHNyYykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNwZWMgPSB0aGlzLnJlc29sdmVOZWFyZXN0UHJvcFNwZWMobWV0YSwgbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXNwZWMpIGNvbnRpbnVlOyAvLyBOb3QgYSBkZWNsYXJlZCBwcm9wIC0+IGlnbm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgdjogc3RyaW5nID0gcmF3VmFsdWUgYXMgc3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm90ZTogZGF0YS14eHggZ2l2ZXMgc3RyaW5nczsgZGF0YS1wcm9wcyBjYW4gZ2l2ZSBhbnkgSlNPTiB0eXBlLlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLmNvbnZlcnQodiwgc3BlYy5raW5kKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy9vdXRbbmFtZV0gPSB2YWx1ZTsgLy8gPDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NvbXAuc2V0SHRtbFByb3AobmFtZSwgdmFsdWUpOyAvLyBmb3IgY29udmVuaWVuY2UsIHNldEh0bWxQcm9wIGNhbiBiZSB1c2VkIGJ5IHRoZSBjb21wb25lbnQgaXRzZWxmIHRvIHJlYWN0IHRvIHByb3AgY2hhbmdlcy5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXAuc2V0UHJvcChuYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzcGVjLmFwcGx5KGNvbXAsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIGV4dHJhY3RKc29uUHJvcHMoZWw6IEVsZW1lbnQpOiBVbmtub3duUmVjb3JkIHtcbiAgICAgICAgICAgICAgICBjb25zdCByYXcgPSBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcHJvcHMnKTtcbiAgICAgICAgICAgICAgICBpZiAoIXJhdykgcmV0dXJuIHt9O1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UocmF3KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9ubHkgYWNjZXB0IHBsYWluIG9iamVjdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZWQgJiYgdHlwZW9mIHBhcnNlZCA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkocGFyc2VkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VkIGFzIFVua25vd25SZWNvcmQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignSW52YWxpZCBKU09OIGluIGRhdGEtcHJvcHMnLCByYXcsIGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgZXh0cmFjdERhdGFBdHRyaWJ1dGVzKGVsOiBFbGVtZW50KTogVW5rbm93blJlY29yZCB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb3V0OiBVbmtub3duUmVjb3JkID0ge307XG5cbiAgICAgICAgICAgICAgICAvLyBJdGVyYXRlIGFsbCBhdHRyaWJ1dGVzLCBrZWVwIG9ubHkgZGF0YS14eHggKGV4Y2VwdCByZXNlcnZlZClcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGF0dHIgb2YgQXJyYXkuZnJvbShlbC5hdHRyaWJ1dGVzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXR0ck5hbWUgPSBhdHRyLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWF0dHJOYW1lLnN0YXJ0c1dpdGgoJ2RhdGEtJykpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFJFU0VSVkVEX0RBVEFfQVRUUlMuaGFzKGF0dHJOYW1lKSkgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb3BOYW1lID0gYXR0ck5hbWUuc2xpY2UoJ2RhdGEtJy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2tpcCBlbXB0eSBuYW1lc1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFwcm9wTmFtZSkgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG91dFtwcm9wTmFtZV0gPSBhdHRyLnZhbHVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBvdXQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgICAgIC8vIEVuZ2xpc2ggY29tbWVudHMgYXMgcmVxdWVzdGVkLlxuXG4gICAgICAgIC8vIENhY2hlOiBwZXIgbWV0YWNsYXNzIC0+IChwcm9wTmFtZSAtPiBuZWFyZXN0IFByb3BTcGVjIG9yIG51bGwgaWYgbm90IGZvdW5kKVxuICAgICAgICAvL3ByaXZhdGUgcmVhZG9ubHkgX3Byb3BTcGVjQ2FjaGUgPSBuZXcgV2Vha01hcDxUTWV0YUNvbXBvbmVudCwgTWFwPHN0cmluZywgUHJvcFNwZWM8YW55PiB8IG51bGw+PigpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQYXJzZSBIVE1MIGF0dHJpYnV0ZXMgKyBKU09OIGJ1bGsgaW50byBhIHBsYWluIG9iamVjdCBvZiB0eXBlZCBwcm9wcy5cbiAgICAgICAgICogLSBSZWFkcyBKU09OIGZyb20gZGF0YS1wcm9wc1xuICAgICAgICAgKiAtIFJlYWRzIGRhdGEteHh4IGF0dHJpYnV0ZXMgKGV4Y2x1ZGluZyByZXNlcnZlZCBvbmVzKVxuICAgICAgICAgKiAtIEZvciBlYWNoIGNhbmRpZGF0ZSBwcm9wIG5hbWUsIHJlc29sdmVzIHRoZSBuZWFyZXN0IFByb3BTcGVjIGJ5IHdhbGtpbmcgbWV0YWNsYXNzIGluaGVyaXRhbmNlLlxuICAgICAgICAgKiAtIEFwcGxpZXMgY29udmVyc2lvbiBiYXNlZCBvbiBzcGVjLmtpbmRcbiAgICAgICAgICogLSBkYXRhLXh4eCBvdmVycmlkZXMgZGF0YS1wcm9wc1xuICAgICAgICAgKi9cbiAgICAgICAgcGFyc2VQcm9wc0Zyb21FbGVtZW50KGNvbXA6IFRDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlbDogRWxlbWVudCB8IG51bGwgPSBjb21wLmVsZW07XG5cbiAgICAgICAgICAgICAgICBpZiAoIWVsKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAvLyAxKSBFeHRyYWN0IEpTT04gYnVsayBwcm9wcyBmcm9tIGRhdGEtcHJvcHNcbiAgICAgICAgICAgICAgICBjb25zdCBqc29uUHJvcHMgPSB0aGlzLmV4dHJhY3RKc29uUHJvcHMoZWwpO1xuXG4gICAgICAgICAgICAgICAgLy8gMikgRXh0cmFjdCBkYXRhLXh4eCBhdHRyaWJ1dGVzIChleGNsdWRpbmcgcmVzZXJ2ZWQpXG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YUF0dHJzID0gdGhpcy5leHRyYWN0RGF0YUF0dHJpYnV0ZXMoZWwpO1xuXG4gICAgICAgICAgICAgICAgLy8gMykgQXBwbHkgSlNPTiBmaXJzdCwgdGhlbiBkYXRhLXh4eCBvdmVycmlkZXNcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGx5UHJvcHNGcm9tU291cmNlKGNvbXAsIGpzb25Qcm9wcywgY29tcC5nZXRNZXRhY2xhc3MoKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBseVByb3BzRnJvbVNvdXJjZShjb21wLCBkYXRhQXR0cnMsIGNvbXAuZ2V0TWV0YWNsYXNzKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBwcm9jZXNzRWxlbShlbDogRWxlbWVudCwgZm9ybTogVEZvcm0sIHBhcmVudDogVENvbXBvbmVudCk6IFRDb21wb25lbnQgfCBudWxsIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLW5hbWUnKTtcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWNvbXBvbmVudCcpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgY2xzID0gVEFwcGxpY2F0aW9uLlRoZUFwcGxpY2F0aW9uLnR5cGVzLmdldCh0eXBlISk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWNscykgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSBwYXJlbnQ7XG4gICAgICAgICAgICAgICAgaWYgKGNscyAhPSBUTWV0YUZvcm0ubWV0YWNsYXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgVEZvcm0gYXJlIGFscmVhZHkgY3JlYXRlZCBieSB0aGUgdXNlci5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkID0gY2xzLmNyZWF0ZShuYW1lISwgZm9ybSwgcGFyZW50KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLnJlZ2lzdGVySW5zdGFuY2UobmFtZSEsIGNoaWxkKTtcbiAgICAgICAgICAgICAgICAvLyBuYW1lOiBzdHJpbmcsIGZvcm06IFRGb3JtLCBwYXJlbnQ6IFRDb21wb25lbnQsIGVsZW06IEhUTUxFbGVtZW50XG4gICAgICAgICAgICAgICAgaWYgKCFjaGlsZCkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgICAgICAgICAvL2NoaWxkLnBhcmVudCA9IGNvbXBvbmVudDtcblxuICAgICAgICAgICAgICAgIGNoaWxkLmVsZW0gPSBlbDtcbiAgICAgICAgICAgICAgICAvL2NoaWxkLmZvcm0gPSBmb3JtO1xuICAgICAgICAgICAgICAgIC8vY2hpbGQubmFtZSA9IG5hbWUhO1xuICAgICAgICAgICAgICAgIC8vY2hpbGQucHJvcHMgPSB7fTtcblxuICAgICAgICAgICAgICAgIC8vIFdlIGNvbGxlY3RcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnNlUHJvcHNGcm9tRWxlbWVudChjaGlsZCk7XG4gICAgICAgICAgICAgICAgY2hpbGQuc3luY0RvbUZyb21Qcm9wcygpO1xuICAgICAgICAgICAgICAgIChjaGlsZCBhcyBhbnkpLm9uQXR0YWNoZWRUb0RvbT8uKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBEb25lIGluIHRoZSBjb25zdHJ1Y3RvciAvL3BhcmVudC5jaGlsZHJlbi5wdXNoKGNoaWxkKTtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXliZUhvc3QgPSBjaGlsZCBhcyB1bmtub3duIGFzIFBhcnRpYWw8SVBsdWdpbkhvc3Q+O1xuICAgICAgICAgICAgICAgIGlmIChtYXliZUhvc3QgJiYgdHlwZW9mIG1heWJlSG9zdC5zZXRQbHVnaW5TcGVjID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGx1Z2luID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLXBsdWdpbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmF3ID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLXByb3BzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9wcyA9IHJhdyA/IEpTT04ucGFyc2UocmF3KSA6IHt9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXliZUhvc3Quc2V0UGx1Z2luU3BlYyh7IHBsdWdpbiwgcHJvcHMgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXliZUhvc3QubW91bnRQbHVnaW5JZlJlYWR5ISh0aGlzLl90b3RvLnNlcnZpY2VzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vbWF5YmVIb3N0Lm1vdW50RnJvbVJlZ2lzdHJ5KHNlcnZpY2VzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBsdWdpbiA9IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1wbHVnaW4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhdyA9IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1wcm9wcycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvcHMgPSByYXcgPyBKU09OLnBhcnNlKHJhdykgOiB7fTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbWF5YmVIb3N0LnNldFBsdWdpblNwZWMoeyBwbHVnaW4sIHByb3BzIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF5YmVIb3N0Lm1vdW50UGx1Z2luSWZSZWFkeSEoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQuYWxsb3dzQ2hpbGRyZW4oKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWwucXVlcnlTZWxlY3RvckFsbCgnOnNjb3BlID4gW2RhdGEtY29tcG9uZW50XScpLmZvckVhY2goKGVsKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc0VsZW0oZWwsIGZvcm0sIGNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9pZiAoZWwgPT09IHJvb3QpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICAgICAgICAgICAgLy9pZiAoZWwgPT09IHJvb3QpIHJldHVybjsgLy8gTm8gbmVlZCB0byBnbyBoaWdoZXIgaW4gdGhlIGhpZXJhY2h5XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBqdXN0ZSBvbmNlLCB3aGVuIHRoZSBmb3JtIGlzIGNyZWF0ZWRcbiAgICAgICAgYnVpbGRDb21wb25lbnRUcmVlKGZvcm06IFRGb3JtLCByb290OiBUQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICAgICAgICAgIC8vIC0tLSBGT1JNIC0tLVxuICAgICAgICAgICAgICAgIC8vIHByb3Zpc29pcmVtZW50IGlmIChyb290LmdldEF0dHJpYnV0ZSgnZGF0YS1jb21wb25lbnQnKSA9PT0gJ1RGb3JtJykge1xuICAgICAgICAgICAgICAgIC8vY29uc3QgZWwgPSByb290LmVsZW0hO1xuXG4gICAgICAgICAgICAgICAgLy90aGlzLnJlZ2lzdGVySW5zdGFuY2Uocm9vdC5uYW1lLCBmb3JtKTtcbiAgICAgICAgICAgICAgICAvL31cbiAgICAgICAgICAgICAgICBjb25zdCByb290RWxlbSA9IHJvb3QuZWxlbSE7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzRWxlbShyb290RWxlbSwgZm9ybSwgcm9vdCk7XG5cbiAgICAgICAgICAgICAgICAvLyAtLS0gQ0hJTEQgQ09NUE9ORU5UUyAtLS1cbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgIHJvb3RFbGVtLnF1ZXJ5U2VsZWN0b3JBbGwoJzpzY29wZSA+IFtkYXRhLWNvbXBvbmVudF0nKS5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGQ6IFRDb21wb25lbnQgfCBudWxsID0gdGhpcy5wcm9jZXNzRWxlbShlbCwgZm9ybSwgcm9vdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2lmIChlbCA9PT0gcm9vdCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkICYmIGNoaWxkLmFsbG93c0NoaWxkcmVuKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWwucXVlcnlTZWxlY3RvckFsbCgnOnNjb3BlID4gW2RhdGEtY29tcG9uZW50XScpLmZvckVhY2goKGVsKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzRWxlbShlbCwgZm9ybSwgY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vaWYgKGVsID09PSByb290KSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICovXG4gICAgICAgIH1cbn1cblxuLypcbmV4cG9ydCB0eXBlIENvbXBvbmVudFByb3BzID0ge1xuICAgICAgICBvbmNsaWNrPzogVEhhbmRsZXI7XG4gICAgICAgIG9uY3JlYXRlPzogVEhhbmRsZXI7XG4gICAgICAgIC8vY29sb3I/OiBUQ29sb3I7IC8vIG91IFRDb2xvciwgZXRjLlxuICAgICAgICBuYW1lPzogc3RyaW5nO1xuICAgICAgICBjb21wb25lbnQ/OiBzdHJpbmc7XG59O1xuKi9cblxuLy90eXBlIFJhd1Byb3AgPSBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuXG5leHBvcnQgY2xhc3MgVERvY3VtZW50IGV4dGVuZHMgVE9iamVjdCB7XG4gICAgICAgIHN0YXRpYyBkb2N1bWVudDogVERvY3VtZW50ID0gbmV3IFREb2N1bWVudChkb2N1bWVudCk7XG4gICAgICAgIHN0YXRpYyBib2R5ID0gZG9jdW1lbnQuYm9keTtcbiAgICAgICAgaHRtbERvYzogRG9jdW1lbnQ7XG4gICAgICAgIGNvbnN0cnVjdG9yKGh0bWxEb2M6IERvY3VtZW50KSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmh0bWxEb2MgPSBodG1sRG9jO1xuICAgICAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUTWV0YURvY3VtZW50IGV4dGVuZHMgVE1ldGFPYmplY3Qge1xuICAgICAgICBzdGF0aWMgcmVhZG9ubHkgbWV0YWNsYXNzOiBUTWV0YURvY3VtZW50ID0gbmV3IFRNZXRhRG9jdW1lbnQoVE1ldGFPYmplY3QubWV0YWNsYXNzLCAnVERvY3VtZW50Jyk7XG5cbiAgICAgICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHN1cGVyQ2xhc3M6IFRNZXRhT2JqZWN0LCBuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICBzdXBlcihzdXBlckNsYXNzLCBuYW1lKTtcbiAgICAgICAgICAgICAgICAvLyBldCB2b3VzIGNoYW5nZXoganVzdGUgbGUgbm9tIDpcbiAgICAgICAgfVxuICAgICAgICBnZXRNZXRhY2xhc3MoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhRG9jdW1lbnQubWV0YWNsYXNzO1xuICAgICAgICB9XG59XG5cbi8qXG50eXBlIENvbnRhaW5lclByb3BzID0gQ29tcG9uZW50UHJvcHMgJiB7XG4gICAgICAgIC8vY2FwdGlvbj86IHN0cmluZztcbiAgICAgICAgLy9lbmFibGVkPzogYm9vbGVhbjtcbiAgICAgICAgLy9jb2xvcj86IFRDb2xvcjsgLy8gb3UgVENvbG9yLCBldGMuXG59O1xuKi9cblxuLy8gVGhpcyBjbGFzIGRvZXMgbm90IGRvIGFueXRoaW5nIGV4Y2VwdCBvdmVycmlkZXMgYWxsb3dzQ2hpbGRyZW4oKVxuZXhwb3J0IGNsYXNzIFRDb250YWluZXIgZXh0ZW5kcyBUQ29tcG9uZW50IHtcbiAgICAgICAgZ2V0TWV0YWNsYXNzKCk6IFRNZXRhQ29udGFpbmVyIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFDb250YWluZXIubWV0YWNsYXNzO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9wcml2YXRlIGdldCBjcHJvcHMoKTogQ29udGFpbmVyUHJvcHMge1xuICAgICAgICAvL3JldHVybiB0aGlzLnByb3BzIGFzIENvbnRhaW5lclByb3BzO1xuICAgICAgICAvL31cblxuICAgICAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIGZvcm06IFRGb3JtIHwgbnVsbCwgcGFyZW50OiBUQ29tcG9uZW50IHwgbnVsbCkge1xuICAgICAgICAgICAgICAgIHN1cGVyKG5hbWUsIGZvcm0sIHBhcmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBzeW5jRG9tRnJvbVByb3BzKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVsID0gdGhpcy5odG1sRWxlbWVudDtcbiAgICAgICAgICAgICAgICBpZiAoIWVsKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICBzdXBlci5zeW5jRG9tRnJvbVByb3BzKCk7XG4gICAgICAgIH1cblxuICAgICAgICBhbGxvd3NDaGlsZHJlbigpOiBib29sZWFuIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvL3RpdGk9MTI7XG59XG5cbmV4cG9ydCBjbGFzcyBUTWV0YUNvbnRhaW5lciBleHRlbmRzIFRNZXRhQ29tcG9uZW50IHtcbiAgICAgICAgc3RhdGljIHJlYWRvbmx5IG1ldGFjbGFzczogVE1ldGFDb250YWluZXIgPSBuZXcgVE1ldGFDb250YWluZXIoVE1ldGFDb21wb25lbnQubWV0YWNsYXNzLCAnVENvbnRhaW5lcicpO1xuXG4gICAgICAgIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihzdXBlckNsYXNzOiBUTWV0YUNvbXBvbmVudCwgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoc3VwZXJDbGFzcywgbmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0TWV0YWNsYXNzKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBUTWV0YUNvbnRhaW5lci5tZXRhY2xhc3M7XG4gICAgICAgIH1cblxuICAgICAgICBjcmVhdGUobmFtZTogc3RyaW5nLCBmb3JtOiBURm9ybSwgcGFyZW50OiBUQ29tcG9uZW50KTogVENvbnRhaW5lciB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUQ29udGFpbmVyKG5hbWUsIGZvcm0sIHBhcmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBkZWZQcm9wcygpOiBQcm9wU3BlYzxhbnk+W10ge1xuICAgICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3sgbmFtZTogJ2NhcHRpb24nLCBraW5kOiAnc3RyaW5nJywgYXBwbHk6IChvLCB2KSA9PiAoby5jYXB0aW9uID0gU3RyaW5nKHYpKSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgLy97IG5hbWU6ICdlbmFibGVkJywga2luZDogJ2Jvb2xlYW4nLCBhcHBseTogKG8sIHYpID0+IChvLmVuYWJsZWQgPSBCb29sZWFuKHYpKSB9XG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgfVxufVxuXG4vKlxudHlwZSBQYW5lbFByb3BzID0gQ29udGFpbmVyUHJvcHMgJiB7XG4gICAgICAgIC8vY2FwdGlvbj86IHN0cmluZztcbiAgICAgICAgLy9lbmFibGVkPzogYm9vbGVhbjtcbiAgICAgICAgLy9jb2xvcj86IFRDb2xvcjsgLy8gb3UgVENvbG9yLCBldGMuXG59O1xuKi9cblxuLy8gVGhpcyBjbGFzcyBkb2VzIG5vdCBkbyBhbnl0aGluZyB1c2VmdWxcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmV4cG9ydCBjbGFzcyBUUGFuZWwgZXh0ZW5kcyBUQ29udGFpbmVyIHtcbiAgICAgICAgZ2V0TWV0YWNsYXNzKCk6IFRNZXRhUGFuZWwge1xuICAgICAgICAgICAgICAgIHJldHVybiBUTWV0YVBhbmVsLm1ldGFjbGFzcztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vcHJvdGVjdGVkIGdldCBwcHJvcHMoKTogUGFuZWxQcm9wcyB7XG4gICAgICAgIC8vcmV0dXJuIHRoaXMucHJvcHMgYXMgUGFuZWxQcm9wcztcbiAgICAgICAgLy99XG5cbiAgICAgICAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nLCBmb3JtOiBURm9ybSB8IG51bGwsIHBhcmVudDogVENvbXBvbmVudCB8IG51bGwpIHtcbiAgICAgICAgICAgICAgICBzdXBlcihuYW1lLCBmb3JtLCBwYXJlbnQpO1xuICAgICAgICB9XG4gICAgICAgIHN5bmNEb21Gcm9tUHJvcHMoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZWwgPSB0aGlzLmh0bWxFbGVtZW50O1xuICAgICAgICAgICAgICAgIGlmICghZWwpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIHN1cGVyLnN5bmNEb21Gcm9tUHJvcHMoKTtcbiAgICAgICAgfVxuICAgICAgICAvL3RvdG8gPSAxMjtcbn1cblxuZXhwb3J0IGNsYXNzIFRNZXRhUGFuZWwgZXh0ZW5kcyBUTWV0YUNvbnRhaW5lciB7XG4gICAgICAgIHN0YXRpYyByZWFkb25seSBtZXRhY2xhc3M6IFRNZXRhUGFuZWwgPSBuZXcgVE1ldGFQYW5lbChUTWV0YUNvbnRhaW5lci5tZXRhY2xhc3MsICdUUGFuZWwnKTtcblxuICAgICAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3Ioc3VwZXJDbGFzczogVE1ldGFDb250YWluZXIsIG5hbWU6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHN1cGVyKHN1cGVyQ2xhc3MsIG5hbWUpO1xuICAgICAgICAgICAgICAgIC8vIGV0IHZvdXMgY2hhbmdleiBqdXN0ZSBsZSBub20gOlxuICAgICAgICB9XG4gICAgICAgIGdldE1ldGFjbGFzcygpOiBUTWV0YVBhbmVsIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFQYW5lbC5tZXRhY2xhc3M7XG4gICAgICAgIH1cblxuICAgICAgICBjcmVhdGUobmFtZTogc3RyaW5nLCBmb3JtOiBURm9ybSwgcGFyZW50OiBUQ29tcG9uZW50KTogVFBhbmVsIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRQYW5lbChuYW1lLCBmb3JtLCBwYXJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVmUHJvcHMoKTogUHJvcFNwZWM8YW55PltdIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICAgICAgLy97IG5hbWU6ICdjYXB0aW9uJywga2luZDogJ3N0cmluZycsIGFwcGx5OiAobywgdikgPT4gKG8uY2FwdGlvbiA9IFN0cmluZyh2KSkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8veyBuYW1lOiAnZW5hYmxlZCcsIGtpbmQ6ICdib29sZWFuJywgYXBwbHk6IChvLCB2KSA9PiAoby5lbmFibGVkID0gQm9vbGVhbih2KSkgfVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgIH1cbn1cblxuLypcbnR5cGUgRm9ybVByb3BzID0gQ29udGFpbmVyUHJvcHMgJiB7XG4gICAgICAgIC8vY2FwdGlvbj86IHN0cmluZztcbiAgICAgICAgLy9lbmFibGVkPzogYm9vbGVhbjtcbiAgICAgICAgLy9jb2xvcj86IFRDb2xvcjsgLy8gb3UgVENvbG9yLCBldGMuXG59O1xuKi9cblxuZXhwb3J0IGNsYXNzIFRNZXRhRm9ybSBleHRlbmRzIFRNZXRhQ29udGFpbmVyIHtcbiAgICAgICAgc3RhdGljIHJlYWRvbmx5IG1ldGFjbGFzczogVE1ldGFGb3JtID0gbmV3IFRNZXRhRm9ybShUTWV0YUNvbnRhaW5lci5tZXRhY2xhc3MsICdURm9ybScpO1xuICAgICAgICBnZXRNZXRhQ2xhc3MoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhRm9ybS5tZXRhY2xhc3M7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3Ioc3VwZXJDbGFzczogVE1ldGFDb250YWluZXIsIG5hbWU6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHN1cGVyKHN1cGVyQ2xhc3MsIG5hbWUpO1xuICAgICAgICAgICAgICAgIC8vIGV0IHZvdXMgY2hhbmdleiBqdXN0ZSBsZSBub20gOlxuICAgICAgICB9XG5cbiAgICAgICAgY3JlYXRlKG5hbWU6IHN0cmluZywgZm9ybTogVEZvcm0sIHBhcmVudDogVENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVEZvcm0obmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICBkZWZQcm9wcygpOiBQcm9wU3BlYzxhbnk+W10ge1xuICAgICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3sgbmFtZTogJ2NhcHRpb24nLCBraW5kOiAnc3RyaW5nJywgYXBwbHk6IChvLCB2KSA9PiAoby5jYXB0aW9uID0gU3RyaW5nKHYpKSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgLy97IG5hbWU6ICdlbmFibGVkJywga2luZDogJ2Jvb2xlYW4nLCBhcHBseTogKG8sIHYpID0+IChvLmVuYWJsZWQgPSBCb29sZWFuKHYpKSB9XG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVEZvcm0gZXh0ZW5kcyBUQ29udGFpbmVyIHtcbiAgICAgICAgZ2V0TWV0YWNsYXNzKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBUTWV0YUZvcm0ubWV0YWNsYXNzO1xuICAgICAgICB9XG4gICAgICAgIHN0YXRpYyBmb3JtcyA9IG5ldyBNYXA8c3RyaW5nLCBURm9ybT4oKTtcbiAgICAgICAgcHJpdmF0ZSBfbW91bnRlZCA9IGZhbHNlO1xuICAgICAgICAvLyBFYWNoIEZvcm0gaGFzIGl0cyBvd24gY29tcG9uZW50UmVnaXN0cnlcbiAgICAgICAgY29tcG9uZW50UmVnaXN0cnk6IFRDb21wb25lbnRSZWdpc3RyeSA9IG5ldyBUQ29tcG9uZW50UmVnaXN0cnkoKTtcbiAgICAgICAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIobmFtZSwgbnVsbCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgdGhpcy5mb3JtID0gdGhpcztcbiAgICAgICAgICAgICAgICBURm9ybS5mb3Jtcy5zZXQobmFtZSwgdGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBnZXQgYXBwbGljYXRpb24oKTogVEFwcGxpY2F0aW9uIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mb3JtPy5hcHBsaWNhdGlvbiA/PyBUQXBwbGljYXRpb24uVGhlQXBwbGljYXRpb247XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFbmdsaXNoIGNvbW1lbnRzIGFzIHJlcXVlc3RlZC5cblxuICAgICAgICBmaW5kRm9ybUZyb21FdmVudFRhcmdldCh0YXJnZXQ6IEVsZW1lbnQpOiBURm9ybSB8IG51bGwge1xuICAgICAgICAgICAgICAgIC8vIDEpIEZpbmQgdGhlIG5lYXJlc3QgZWxlbWVudCB0aGF0IGxvb2tzIGxpa2UgYSBmb3JtIGNvbnRhaW5lclxuICAgICAgICAgICAgICAgIGNvbnN0IGZvcm1FbGVtID0gdGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWNvbXBvbmVudD1cIlRGb3JtXCJdW2RhdGEtbmFtZV0nKSBhcyBFbGVtZW50IHwgbnVsbDtcbiAgICAgICAgICAgICAgICBpZiAoIWZvcm1FbGVtKSByZXR1cm4gbnVsbDtcblxuICAgICAgICAgICAgICAgIC8vIDIpIFJlc29sdmUgdGhlIFRGb3JtIGluc3RhbmNlXG4gICAgICAgICAgICAgICAgY29uc3QgZm9ybU5hbWUgPSBmb3JtRWxlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbmFtZScpO1xuICAgICAgICAgICAgICAgIGlmICghZm9ybU5hbWUpIHJldHVybiBudWxsO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIFRGb3JtLmZvcm1zLmdldChmb3JtTmFtZSkgPz8gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgX2FjOiBBYm9ydENvbnRyb2xsZXIgfCBudWxsID0gbnVsbDtcblxuICAgICAgICBpbnN0YWxsRXZlbnRSb3V0ZXIoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWM/LmFib3J0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWMgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgeyBzaWduYWwgfSA9IHRoaXMuX2FjO1xuXG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vdCA9IHRoaXMuZWxlbSBhcyBFbGVtZW50IHwgbnVsbDtcbiAgICAgICAgICAgICAgICBpZiAoIXJvb3QpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIC8vIHNhbWUgaGFuZGxlciBmb3IgZXZlcnlib2R5XG4gICAgICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IChldjogRXZlbnQpID0+IHRoaXMuZGlzcGF0Y2hEb21FdmVudChldik7XG5cbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHR5cGUgb2YgWydjbGljaycsICdpbnB1dCcsICdjaGFuZ2UnLCAna2V5ZG93biddKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb290LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgaGFuZGxlciwgeyBjYXB0dXJlOiB0cnVlLCBzaWduYWwgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB0eXBlIGluIHRoaXMuZ2V0TWV0YWNsYXNzKCkuZG9tRXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb290LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgaGFuZGxlciwgeyBjYXB0dXJlOiB0cnVlLCBzaWduYWwgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZGlzcG9zZUV2ZW50Um91dGVyKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FjPy5hYm9ydCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FjID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdlIHJlY2VpdmVkIGFuIERPTSBFdmVudC4gRGlzcGF0Y2ggaXRcbiAgICAgICAgcHJpdmF0ZSBkaXNwYXRjaERvbUV2ZW50KGV2OiBFdmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldEVsZW0gPSBldi50YXJnZXQgYXMgRWxlbWVudCB8IG51bGw7XG4gICAgICAgICAgICAgICAgaWYgKCF0YXJnZXRFbGVtKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICBjb25zdCBwcm9wTmFtZSA9IGBvbiR7ZXYudHlwZX1gO1xuXG4gICAgICAgICAgICAgICAgbGV0IGVsOiBFbGVtZW50IHwgbnVsbCA9IHRhcmdldEVsZW0uY2xvc2VzdCgnW2RhdGEtY29tcG9uZW50XScpO1xuICAgICAgICAgICAgICAgIGlmICghZWwpIHJldHVybjtcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLW5hbWUnKTtcbiAgICAgICAgICAgICAgICBsZXQgY29tcCA9IG5hbWUgPyB0aGlzLmNvbXBvbmVudFJlZ2lzdHJ5LmdldChuYW1lKSA6IG51bGw7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGNvbXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSBjb21wLmdldFByb3A8VEhhbmRsZXI+KHByb3BOYW1lKTsgLy8gPDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY29uc3QgaGFuZGxlciA9IGNvbXAuZ2V0UHJvcGVydHkocHJvcE5hbWUpOyAvL2NvbXA/LnByb3BzW3Byb3BOYW1lIGFzIGtleW9mIHR5cGVvZiBjb21wLnByb3BzXSBhcyBUSGFuZGxlciB8IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGFuZGxlciAmJiBoYW5kbGVyLnMgJiYgaGFuZGxlci5zICE9ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXIuZmlyZSh0aGlzLCBwcm9wTmFtZSwgZXYsIGNvbXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2VsID0gbmV4dCA/PyBlbC5wYXJlbnRFbGVtZW50Py5jbG9zZXN0KCdbZGF0YS1jb21wb25lbnRdJykgPz8gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXAgPSBjb21wLnBhcmVudDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBObyBoYW5kbGVyIGhlcmU6IHRyeSBnb2luZyBcInVwXCIgdXNpbmcgeW91ciBjb21wb25lbnQgdHJlZSBpZiBwb3NzaWJsZVxuICAgICAgICB9XG5cbiAgICAgICAgc2hvdygpIHtcbiAgICAgICAgICAgICAgICAvLyBNdXN0IGJlIGRvbmUgYmVmb3JlIGJ1aWxkQ29tcG9uZW50VHJlZSgpIGJlY2F1c2UgYGJ1aWxkQ29tcG9uZW50VHJlZSgpYCBkb2VzIG5vdCBkbyBgcmVzb2x2ZVJvb3QoKWAgaXRzZWxmLlxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5lbGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVsZW0gPSB0aGlzLmNvbXBvbmVudFJlZ2lzdHJ5LnJlc29sdmVSb290KCk7IC8vIG91IHRoaXMucmVzb2x2ZVJvb3QoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX21vdW50ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29tcG9uZW50UmVnaXN0cnkuYnVpbGRDb21wb25lbnRUcmVlKHRoaXMsIHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkNyZWF0ZSgpOyAvLyBNYXliZSBjb3VsZCBiZSBkb25lIGFmdGVyIGluc3RhbGxFdmVudFJvdXRlcigpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluc3RhbGxFdmVudFJvdXRlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fbW91bnRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMub25TaG93bigpO1xuXG4gICAgICAgICAgICAgICAgLy8gVE9ET1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIG9uQ3JlYXRlKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9uU2hvd25OYW1lID0gdGhpcy5lbGVtIS5nZXRBdHRyaWJ1dGUoJ2RhdGEtb25jcmVhdGUnKTtcbiAgICAgICAgICAgICAgICBpZiAob25TaG93bk5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTWljcm90YXNrKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZm4gPSAodGhpcyBhcyBhbnkpW29uU2hvd25OYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJykgZm4uY2FsbCh0aGlzLCBudWxsLCB0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBvblNob3duKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9uU2hvd25OYW1lID0gdGhpcy5lbGVtIS5nZXRBdHRyaWJ1dGUoJ2RhdGEtb25zaG93bicpO1xuICAgICAgICAgICAgICAgIGlmIChvblNob3duTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVNaWNyb3Rhc2soKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmbiA9ICh0aGlzIGFzIGFueSlbb25TaG93bk5hbWVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSBmbi5jYWxsKHRoaXMsIG51bGwsIHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG59XG5cbi8qXG50eXBlIEJ1dHRvblByb3BzID0gQ29tcG9uZW50UHJvcHMgJiB7XG4gICAgICAgIGNhcHRpb24/OiBzdHJpbmc7XG4gICAgICAgIGVuYWJsZWQ/OiBib29sZWFuO1xuICAgICAgICAvL2NvbG9yPzogVENvbG9yOyAvLyBvdSBUQ29sb3IsIGV0Yy5cbn07XG4qL1xuXG5leHBvcnQgY2xhc3MgVEJ1dHRvbiBleHRlbmRzIFRDb21wb25lbnQge1xuICAgICAgICBnZXRNZXRhY2xhc3MoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhQnV0dG9uLm1ldGFjbGFzcztcbiAgICAgICAgfVxuXG4gICAgICAgIGh0bWxCdXR0b24oKTogSFRNTEJ1dHRvbkVsZW1lbnQge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmh0bWxFbGVtZW50ISBhcyBIVE1MQnV0dG9uRWxlbWVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vX2NhcHRpb246IHN0cmluZyA9ICcnO1xuICAgICAgICAvL19lbmFibGVkOiBib29sZWFuID0gdHJ1ZTtcbiAgICAgICAgLypcbiAgICAgICAgcHJvdGVjdGVkIGdldCBicHJvcHMoKTogQnV0dG9uUHJvcHMge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnByb3BzIGFzIEJ1dHRvblByb3BzO1xuICAgICAgICB9XG4gICAgICAgICAgICAgICAgKi9cblxuICAgICAgICBnZXQgY2FwdGlvbigpOiBzdHJpbmcge1xuICAgICAgICAgICAgICAgIC8vcmV0dXJuIHRoaXMuX2NhcHRpb247XG4gICAgICAgICAgICAgICAgcmV0dXJuICh0aGlzLnByb3BzLmNhcHRpb24gYXMgc3RyaW5nKSA/PyAnQ2FwdGlvbic7XG4gICAgICAgIH1cbiAgICAgICAgc2V0IGNhcHRpb24oY2FwdGlvbjogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgLy90aGlzLl9jYXB0aW9uID0gY2FwdGlvbjtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmNhcHRpb24gPSBjYXB0aW9uO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVsID0gdGhpcy5odG1sRWxlbWVudDtcbiAgICAgICAgICAgICAgICBpZiAoIWVsKSByZXR1cm47XG4gICAgICAgICAgICAgICAgZWwudGV4dENvbnRlbnQgPSB0aGlzLmNhcHRpb247XG4gICAgICAgIH1cblxuICAgICAgICBnZXQgZW5hYmxlZCgpOiBib29sZWFuIHtcbiAgICAgICAgICAgICAgICAvL3JldHVybiB0aGlzLl9lbmFibGVkID8/IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuICh0aGlzLnByb3BzLmVuYWJsZWQgYXMgYm9vbGVhbikgPz8gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBzZXQgZW5hYmxlZChlbmFibGVkKSB7XG4gICAgICAgICAgICAgICAgLy90aGlzLl9lbmFibGVkID0gZW5hYmxlZDtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmVuYWJsZWQgPSBlbmFibGVkO1xuICAgICAgICAgICAgICAgIHRoaXMuaHRtbEJ1dHRvbigpLmRpc2FibGVkID0gIWVuYWJsZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIGZvcm06IFRGb3JtLCBwYXJlbnQ6IFRDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICBzdXBlcihuYW1lLCBmb3JtLCBwYXJlbnQpO1xuICAgICAgICB9XG4gICAgICAgIHN5bmNEb21Gcm9tUHJvcHMoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZWwgPSB0aGlzLmh0bWxFbGVtZW50O1xuICAgICAgICAgICAgICAgIGlmICghZWwpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIGVsLnRleHRDb250ZW50ID0gdGhpcy5jYXB0aW9uO1xuICAgICAgICAgICAgICAgIHRoaXMuaHRtbEJ1dHRvbigpLmRpc2FibGVkID0gIXRoaXMuZW5hYmxlZDtcbiAgICAgICAgICAgICAgICBzdXBlci5zeW5jRG9tRnJvbVByb3BzKCk7XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRNZXRhQnV0dG9uPFQgZXh0ZW5kcyBUQnV0dG9uPiBleHRlbmRzIFRNZXRhQ29tcG9uZW50IHtcbiAgICAgICAgc3RhdGljIHJlYWRvbmx5IG1ldGFjbGFzcyA9IG5ldyBUTWV0YUJ1dHRvbihUTWV0YUNvbXBvbmVudC5tZXRhY2xhc3MsICdUQnV0dG9uJyk7XG5cbiAgICAgICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHN1cGVyQ2xhc3M6IFRNZXRhQ29tcG9uZW50LCBuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICBzdXBlcihzdXBlckNsYXNzLCBuYW1lKTtcbiAgICAgICAgICAgICAgICAvLyBldCB2b3VzIGNoYW5nZXoganVzdGUgbGUgbm9tIDpcbiAgICAgICAgfVxuICAgICAgICBnZXRNZXRhY2xhc3MoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhQnV0dG9uLm1ldGFjbGFzcztcbiAgICAgICAgfVxuXG4gICAgICAgIGNyZWF0ZShuYW1lOiBzdHJpbmcsIGZvcm06IFRGb3JtLCBwYXJlbnQ6IFRDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRCdXR0b24obmFtZSwgZm9ybSwgcGFyZW50KSBhcyBUO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVmUHJvcHMoKTogUHJvcFNwZWM8YW55PltdIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnY2FwdGlvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXRyaWV2ZTogKG8pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gby5jYXB0aW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBseTogKG8sIHYpID0+IChvLmNhcHRpb24gPSBTdHJpbmcodikpXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnZW5hYmxlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ6ICdib29sZWFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0cmlldmU6IChvKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG8uZW5hYmxlZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwbHk6IChvLCB2KSA9PiAoby5lbmFibGVkID0gQm9vbGVhbih2KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUTWV0YUFwcGxpY2F0aW9uIGV4dGVuZHMgVE1ldGFjbGFzcyB7XG4gICAgICAgIHN0YXRpYyByZWFkb25seSBtZXRhY2xhc3M6IFRNZXRhQXBwbGljYXRpb24gPSBuZXcgVE1ldGFBcHBsaWNhdGlvbihUTWV0YWNsYXNzLm1ldGFjbGFzcywgJ1RBcHBsaWNhdGlvbicpO1xuXG4gICAgICAgIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihzdXBlckNsYXNzOiBUTWV0YWNsYXNzLCBuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICBzdXBlcihzdXBlckNsYXNzLCBuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBnZXRNZXRhY2xhc3MoKTogVE1ldGFBcHBsaWNhdGlvbiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhQXBwbGljYXRpb24ubWV0YWNsYXNzO1xuICAgICAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUQXBwbGljYXRpb24ge1xuICAgICAgICBnZXRNZXRhY2xhc3MoKTogVE1ldGFBcHBsaWNhdGlvbiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhQXBwbGljYXRpb24ubWV0YWNsYXNzO1xuICAgICAgICB9XG4gICAgICAgIHN0YXRpYyBUaGVBcHBsaWNhdGlvbjogVEFwcGxpY2F0aW9uO1xuICAgICAgICAvL3N0YXRpYyBwbHVnaW5SZWdpc3RyeSA9IG5ldyBQbHVnaW5SZWdpc3RyeSgpO1xuICAgICAgICAvL3BsdWdpbnM6IElQbHVnaW5SZWdpc3RyeTtcbiAgICAgICAgcHJpdmF0ZSBmb3JtczogVEZvcm1bXSA9IFtdO1xuICAgICAgICByZWFkb25seSB0eXBlcyA9IG5ldyBUQ29tcG9uZW50VHlwZVJlZ2lzdHJ5KCk7XG4gICAgICAgIG1haW5Gb3JtOiBURm9ybSB8IG51bGwgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgICAgIFRBcHBsaWNhdGlvbi5UaGVBcHBsaWNhdGlvbiA9IHRoaXM7XG4gICAgICAgICAgICAgICAgcmVnaXN0ZXJCdWlsdGlucyh0aGlzLnR5cGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNyZWF0ZUZvcm08VCBleHRlbmRzIFRGb3JtPihjdG9yOiBuZXcgKC4uLmFyZ3M6IGFueVtdKSA9PiBULCBuYW1lOiBzdHJpbmcpOiBUIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmID0gbmV3IGN0b3IobmFtZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5mb3Jtcy5wdXNoKGYpO1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5tYWluRm9ybSkgdGhpcy5tYWluRm9ybSA9IGY7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGY7XG4gICAgICAgIH1cblxuICAgICAgICBydW4oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ydW5XaGVuRG9tUmVhZHkoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubWFpbkZvcm0pIHRoaXMubWFpbkZvcm0uc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB0aGlzLmF1dG9TdGFydCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIGF1dG9TdGFydCgpIHtcbiAgICAgICAgICAgICAgICAvLyBmYWxsYmFjazogY2hvaXNpciB1bmUgZm9ybSBlbnJlZ2lzdHJcdTAwRTllLCBvdSBjclx1MDBFOWVyIHVuZSBmb3JtIGltcGxpY2l0ZVxuICAgICAgICB9XG5cbiAgICAgICAgcnVuV2hlbkRvbVJlYWR5KGZuOiAoKSA9PiB2b2lkKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdsb2FkaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmbiwgeyBvbmNlOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IERDQyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8vIERDQyA9IERlbHBoaW5lIEN1c3RvbSBDb21wb25lbnRcblxuLypcbnR5cGUgU2ltcGxlRENDUHJvcHMgPSBDb21wb25lbnRQcm9wcyAmIHtcbiAgICAgICAgLy9jYXB0aW9uPzogc3RyaW5nO1xuICAgICAgICAvL2VuYWJsZWQ/OiBib29sZWFuO1xuICAgICAgICAvL2NvbG9yPzogVENvbG9yOyAvLyBvdSBUQ29sb3IsIGV0Yy5cbn07XG4qL1xuXG4vLyBOb3RlOiB0aGlzIGNsYXNzIGRvZXMgbm90IGRvIGFueXRoaW5nLiBQZXJoYXBzIHRoYXQgRENDIGNhbiBoZXJpdCBkaXJlY3RseSBmcm9tIFRDb21wb25lbnRcblxuZXhwb3J0IGNsYXNzIFRTaW1wbGVEQ0MgZXh0ZW5kcyBUQ29tcG9uZW50IHtcbiAgICAgICAgZ2V0TWV0YWNsYXNzKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBUTWV0YVNpbXBsZURDQy5tZXRhY2xhc3M7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIGZvcm06IFRGb3JtLCBwYXJlbnQ6IFRDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICBzdXBlcihuYW1lLCBmb3JtLCBwYXJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLypcbiAgICAgICAgcHJvdGVjdGVkIGdldCBkY2Nwcm9wcygpOiBTaW1wbGVEQ0NQcm9wcyB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMgYXMgU2ltcGxlRENDUHJvcHM7XG4gICAgICAgIH1cbiAgICAgICAgICAgICAgICAqL1xufVxuXG5leHBvcnQgY2xhc3MgVE1ldGFTaW1wbGVEQ0MgZXh0ZW5kcyBUTWV0YUNvbXBvbmVudCB7XG4gICAgICAgIHN0YXRpYyByZWFkb25seSBtZXRhY2xhc3M6IFRNZXRhU2ltcGxlRENDID0gbmV3IFRNZXRhU2ltcGxlRENDKFRNZXRhQ29tcG9uZW50Lm1ldGFjbGFzcywgJ1RTaW1wbGVEQ0MnKTtcblxuICAgICAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3Ioc3VwZXJDbGFzczogVE1ldGFDb21wb25lbnQsIG5hbWU6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHN1cGVyKHN1cGVyQ2xhc3MsIG5hbWUpO1xuICAgICAgICAgICAgICAgIC8vIGV0IHZvdXMgY2hhbmdleiBqdXN0ZSBsZSBub20gOlxuICAgICAgICB9XG4gICAgICAgIGdldE1ldGFjbGFzcygpOiBUTWV0YVNpbXBsZURDQyB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhU2ltcGxlRENDLm1ldGFjbGFzcztcbiAgICAgICAgfVxuXG4gICAgICAgIGNyZWF0ZShuYW1lOiBzdHJpbmcsIGZvcm06IFRGb3JtLCBwYXJlbnQ6IFRDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRTaW1wbGVEQ0MobmFtZSwgZm9ybSwgcGFyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlZlByb3BzKCk6IFByb3BTcGVjPGFueT5bXSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8veyBuYW1lOiAnY2FwdGlvbicsIGtpbmQ6ICdzdHJpbmcnLCBhcHBseTogKG8sIHYpID0+IChvLmNhcHRpb24gPSBTdHJpbmcodikpIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3sgbmFtZTogJ2VuYWJsZWQnLCBraW5kOiAnYm9vbGVhbicsIGFwcGx5OiAobywgdikgPT4gKG8uZW5hYmxlZCA9IEJvb2xlYW4odikpIH1cbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICB9XG59XG5cbi8qXG5leHBvcnQgdHlwZSBDb21wb3NpdGVEQ0NQcm9wcyA9IENvbXBvbmVudFByb3BzICYge1xuICAgICAgICAvL2NhcHRpb24/OiBzdHJpbmc7XG4gICAgICAgIC8vZW5hYmxlZD86IGJvb2xlYW47XG4gICAgICAgIC8vY29sb3I/OiBUQ29sb3I7IC8vIG91IFRDb2xvciwgZXRjLlxufTtcbiovXG5cbi8vIE5vdGU6IHRoaXMgY2xhc3MgZG9lcyBub3QgZG8gYW55dGhpbmcuIFBlcmhhcHMgdGhhdCBEQ0MgY2FuIGhlcml0IGRpcmVjdGx5IGZyb20gVENvbnRhaW5lciBvciBUUGFuZWxcbi8vIFRDb250YWluZXIgb3IgVFBhbmVsID8gQWN0dWFsbHkgdGhpcyBpcyBub3QgY2xlYXIuIFRob3NlIHR3byBjbGFzcyBkbyBub3QgZG8gYW55dGhpbmcgdXNlZnVsIGFib2YgVENvbXBvbmVudFxuZXhwb3J0IGNsYXNzIFRDb21wb3NpdGVEQ0MgZXh0ZW5kcyBUQ29udGFpbmVyIHtcbiAgICAgICAgZ2V0TWV0YWNsYXNzKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBUTWV0YUNvbXBvc2l0ZURDQy5tZXRhY2xhc3M7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIGZvcm06IFRGb3JtLCBwYXJlbnQ6IFRDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICBzdXBlcihuYW1lLCBmb3JtLCBwYXJlbnQpO1xuICAgICAgICB9XG4gICAgICAgIC8qXG4gICAgICAgIHByb3RlY3RlZCBnZXQgZGNjcHJvcHMoKTogQ29tcG9zaXRlRENDUHJvcHMge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnByb3BzIGFzIENvbXBvc2l0ZURDQ1Byb3BzO1xuICAgICAgICB9XG4gICAgICAgICAgICAgICAgKi9cbn1cblxuZXhwb3J0IGNsYXNzIFRNZXRhQ29tcG9zaXRlRENDIGV4dGVuZHMgVE1ldGFDb250YWluZXIge1xuICAgICAgICBzdGF0aWMgcmVhZG9ubHkgbWV0YWNsYXNzOiBUTWV0YUNvbXBvc2l0ZURDQyA9IG5ldyBUTWV0YUNvbXBvc2l0ZURDQyhUTWV0YUNvbnRhaW5lci5tZXRhY2xhc3MsICdUQ29tcG9zaXREQ0MnKTtcblxuICAgICAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3Ioc3VwZXJDbGFzczogVE1ldGFDb250YWluZXIsIG5hbWU6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHN1cGVyKHN1cGVyQ2xhc3MsIG5hbWUpO1xuICAgICAgICAgICAgICAgIC8vIGV0IHZvdXMgY2hhbmdleiBqdXN0ZSBsZSBub20gOlxuICAgICAgICB9XG4gICAgICAgIGdldE1ldGFjbGFzcygpOiBUTWV0YUNvbXBvc2l0ZURDQyB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRNZXRhQ29tcG9zaXRlRENDLm1ldGFjbGFzcztcbiAgICAgICAgfVxuXG4gICAgICAgIGNyZWF0ZShuYW1lOiBzdHJpbmcsIGZvcm06IFRGb3JtLCBwYXJlbnQ6IFRDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRDb21wb3NpdGVEQ0MobmFtZSwgZm9ybSwgcGFyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlZlByb3BzKCk6IFByb3BTcGVjPGFueT5bXSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8veyBuYW1lOiAnY2FwdGlvbicsIGtpbmQ6ICdzdHJpbmcnLCBhcHBseTogKG8sIHYpID0+IChvLmNhcHRpb24gPSBTdHJpbmcodikpIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3sgbmFtZTogJ2VuYWJsZWQnLCBraW5kOiAnYm9vbGVhbicsIGFwcGx5OiAobywgdikgPT4gKG8uZW5hYmxlZCA9IEJvb2xlYW4odikpIH1cbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICB9XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiIsICJpbXBvcnQgeyBURm9ybSwgVENvbXBvbmVudCwgVE1ldGFDb21wb25lbnQsIFRBcHBsaWNhdGlvbiB9IGZyb20gJy4vU3RkQ3RybHMnO1xuaW1wb3J0IHR5cGUgeyBQcm9wU3BlYyB9IGZyb20gJy4vU3RkQ3RybHMnO1xuaW1wb3J0IHR5cGUgeyBEZWxwaGluZVNlcnZpY2VzIH0gZnJvbSAnLi9JUGx1Z2luJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IFBMVUdJTkhPU1QgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgdHlwZSBKc29uID0gbnVsbCB8IGJvb2xlYW4gfCBudW1iZXIgfCBzdHJpbmcgfCBKc29uW10gfCB7IFtrZXk6IHN0cmluZ106IEpzb24gfTtcblxuZXhwb3J0IGludGVyZmFjZSBEZWxwaGluZUxvZ2dlciB7XG4gICAgICAgIGRlYnVnKG1zZzogc3RyaW5nLCBkYXRhPzogSnNvbik6IHZvaWQ7XG4gICAgICAgIGluZm8obXNnOiBzdHJpbmcsIGRhdGE/OiBKc29uKTogdm9pZDtcbiAgICAgICAgd2Fybihtc2c6IHN0cmluZywgZGF0YT86IEpzb24pOiB2b2lkO1xuICAgICAgICBlcnJvcihtc2c6IHN0cmluZywgZGF0YT86IEpzb24pOiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERlbHBoaW5lRXZlbnRCdXMge1xuICAgICAgICAvLyBTdWJzY3JpYmUgdG8gYW4gYXBwIGV2ZW50LlxuICAgICAgICBvbihldmVudE5hbWU6IHN0cmluZywgaGFuZGxlcjogKHBheWxvYWQ6IEpzb24pID0+IHZvaWQpOiAoKSA9PiB2b2lkO1xuXG4gICAgICAgIC8vIFB1Ymxpc2ggYW4gYXBwIGV2ZW50LlxuICAgICAgICBlbWl0KGV2ZW50TmFtZTogc3RyaW5nLCBwYXlsb2FkOiBKc29uKTogdm9pZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEZWxwaGluZVN0b3JhZ2Uge1xuICAgICAgICBnZXQoa2V5OiBzdHJpbmcpOiBQcm9taXNlPEpzb24gfCB1bmRlZmluZWQ+O1xuICAgICAgICBzZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBKc29uKTogUHJvbWlzZTx2b2lkPjtcbiAgICAgICAgcmVtb3ZlKGtleTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPjtcbn1cblxuZXhwb3J0IGNsYXNzIFRvdG8ge1xuICAgICAgICBsb2dnZXIgPSB7XG4gICAgICAgICAgICAgICAgZGVidWcobXNnOiBzdHJpbmcsIGRhdGE/OiBKc29uKTogdm9pZCB7fSxcbiAgICAgICAgICAgICAgICBpbmZvKG1zZzogc3RyaW5nLCBkYXRhPzogSnNvbik6IHZvaWQge30sXG4gICAgICAgICAgICAgICAgd2Fybihtc2c6IHN0cmluZywgZGF0YT86IEpzb24pOiB2b2lkIHt9LFxuICAgICAgICAgICAgICAgIGVycm9yKG1zZzogc3RyaW5nLCBkYXRhPzogSnNvbik6IHZvaWQge31cbiAgICAgICAgfTtcblxuICAgICAgICBldmVudEJ1cyA9IHtcbiAgICAgICAgICAgICAgICBvbihldmVudDogc3RyaW5nLCBoYW5kbGVyOiAocGF5bG9hZDogYW55KSA9PiB2b2lkKTogKCkgPT4gdm9pZCB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4gdm9pZCB7fTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVtaXQoZXZlbnQ6IHN0cmluZywgcGF5bG9hZDogYW55KTogdm9pZCB7fVxuICAgICAgICB9O1xuXG4gICAgICAgIHN0b3JhZ2UgPSB7XG4gICAgICAgICAgICAgICAgZ2V0KGtleTogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHwgbnVsbCB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNldChrZXk6IHN0cmluZywgdmFsdWU6IGFueSk6IFByb21pc2U8dm9pZD4gfCBudWxsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcmVtb3ZlKGtleTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB8IG51bGwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHNlcnZpY2VzOiBEZWxwaGluZVNlcnZpY2VzID0ge1xuICAgICAgICAgICAgICAgIGxvZzogdGhpcy5sb2dnZXIsXG4gICAgICAgICAgICAgICAgYnVzOiB0aGlzLmV2ZW50QnVzLFxuICAgICAgICAgICAgICAgIHN0b3JhZ2U6IHRoaXMuc3RvcmFnZVxuICAgICAgICB9O1xufVxuY29uc3QgdG90bzogVG90byA9IG5ldyBUb3RvKCk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVUlQbHVnaW5JbnN0YW5jZTxQcm9wcyBleHRlbmRzIEpzb24gPSBKc29uPiB7XG4gICAgICAgIHJlYWRvbmx5IGlkOiBzdHJpbmc7XG5cbiAgICAgICAgLy8gQ2FsbGVkIGV4YWN0bHkgb25jZSBhZnRlciBjcmVhdGlvbiAoZm9yIGEgZ2l2ZW4gaW5zdGFuY2UpLlxuICAgICAgICBtb3VudChjb250YWluZXI6IEhUTUxFbGVtZW50LCBwcm9wczogUHJvcHMsIHNlcnZpY2VzOiBEZWxwaGluZVNlcnZpY2VzKTogdm9pZDtcblxuICAgICAgICAvLyBDYWxsZWQgYW55IHRpbWUgcHJvcHMgY2hhbmdlIChtYXkgYmUgZnJlcXVlbnQpLlxuICAgICAgICB1cGRhdGUocHJvcHM6IFByb3BzKTogdm9pZDtcblxuICAgICAgICAvLyBDYWxsZWQgZXhhY3RseSBvbmNlIGJlZm9yZSBkaXNwb3NhbC5cbiAgICAgICAgdW5tb3VudCgpOiB2b2lkO1xuXG4gICAgICAgIC8vIEZpbmlzaGVkIHdpdGggdGhpcyBwbHVnaW5cbiAgICAgICAgZGlzcG9zZT8oKTogdm9pZDtcblxuICAgICAgICAvLyBPcHRpb25hbCBlcmdvbm9taWNzLlxuICAgICAgICBnZXRTaXplSGludHM/KCk6IG51bWJlcjtcbiAgICAgICAgZm9jdXM/KCk6IHZvaWQ7XG5cbiAgICAgICAgLy8gT3B0aW9uYWwgcGVyc2lzdGVuY2UgaG9vayAoRGVscGhpbmUgbWF5IHN0b3JlICYgcmVzdG9yZSB0aGlzKS5cbiAgICAgICAgc2VyaWFsaXplU3RhdGU/KCk6IEpzb247XG59XG5cbmV4cG9ydCBjbGFzcyBUTWV0YVBsdWdpbkhvc3QgZXh0ZW5kcyBUTWV0YUNvbXBvbmVudCB7XG4gICAgICAgIHN0YXRpYyBtZXRhY2xhc3MgPSBuZXcgVE1ldGFQbHVnaW5Ib3N0KFRNZXRhQ29tcG9uZW50Lm1ldGFjbGFzcywgJ1RQbHVnaW5Ib3N0Jyk7XG4gICAgICAgIGdldE1ldGFjbGFzcygpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVE1ldGFQbHVnaW5Ib3N0Lm1ldGFjbGFzcztcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihzdXBlckNsYXNzOiBUTWV0YUNvbXBvbmVudCwgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoc3VwZXJDbGFzcywgbmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICBjcmVhdGUobmFtZTogc3RyaW5nLCBmb3JtOiBURm9ybSwgcGFyZW50OiBUQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUUGx1Z2luSG9zdChuYW1lLCBmb3JtLCBwYXJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVmUHJvcHMoKTogUHJvcFNwZWM8VFBsdWdpbkhvc3Q+W10ge1xuICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxufVxuXG5mdW5jdGlvbiBzYWZlUGFyc2VKc29uKHM6IHN0cmluZyB8IG51bGwpOiBhbnkge1xuICAgICAgICBpZiAoIXMpIHJldHVybiB7fTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShzKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICB9XG59XG5cbmZ1bmN0aW9uIHN0YWJsZVN0cmluZ2lmeSh2OiBhbnkpOiBzdHJpbmcge1xuICAgICAgICAvLyBHb29kIGVub3VnaCBmb3IgY2hlYXAgY2hhbmdlIGRldGVjdGlvblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2KTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUUGx1Z2luSG9zdCBleHRlbmRzIFRDb21wb25lbnQge1xuICAgICAgICBwcml2YXRlIGluc3RhbmNlOiBVSVBsdWdpbkluc3RhbmNlIHwgbnVsbCA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgc2VydmljZXM6IERlbHBoaW5lU2VydmljZXMgfCBudWxsID0gbnVsbDtcblxuICAgICAgICBwcml2YXRlIHBsdWdpbk5hbWU6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICAgICAgICBwcml2YXRlIHBsdWdpblByb3BzOiBhbnkgPSB7fTtcbiAgICAgICAgcHJpdmF0ZSBwbHVnaW5Qcm9wc0tleTogc3RyaW5nID0gJyc7XG4gICAgICAgIC8vcHJpdmF0ZSBmYWN0b3J5OiBVSVBsdWdpbkZhY3RvcnkgfCBudWxsID0gbnVsbDtcblxuICAgICAgICBwcml2YXRlIG1vdW50UG9pbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgICAgIHByaXZhdGUgb2JzZXJ2ZXI6IE11dGF0aW9uT2JzZXJ2ZXIgfCBudWxsID0gbnVsbDtcblxuICAgICAgICBwcml2YXRlIHVwZGF0ZVNjaGVkdWxlZCA9IGZhbHNlO1xuXG4gICAgICAgIC8qKiBSZXBsYWNlIEFMTCBwbHVnaW4gcHJvcHMgKHJhcmUpLiAqL1xuICAgICAgICBzZXRQbHVnaW5Qcm9wcyhuZXh0OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW5Qcm9wcyA9IG5leHQgPz8ge307XG4gICAgICAgICAgICAgICAgdGhpcy5zY2hlZHVsZVVwZGF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqIFBhdGNoIG9uZSBwcm9wIChjb21tb24pLiAqL1xuICAgICAgICBzZXRQbHVnaW5Qcm9wKG5hbWU6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luUHJvcHNbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnNjaGVkdWxlVXBkYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiogUGF0Y2ggbWFueSBwcm9wcyBhdCBvbmNlIChwcmVmZXJyZWQpLiAqL1xuICAgICAgICBwYXRjaFBsdWdpblByb3BzKHBhdGNoOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSB7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLnBsdWdpblByb3BzLCBwYXRjaCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zY2hlZHVsZVVwZGF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0UGx1Z2luUHJvcDxUID0gYW55PihuYW1lOiBzdHJpbmcpOiBUIHwgdW5kZWZpbmVkIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wbHVnaW5Qcm9wc1tuYW1lXSBhcyBUIHwgdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBzY2hlZHVsZVVwZGF0ZSgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy51cGRhdGVTY2hlZHVsZWQpIHJldHVybjtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNjaGVkdWxlZCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICBxdWV1ZU1pY3JvdGFzaygoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNjaGVkdWxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZT8udXBkYXRlKHRoaXMucGx1Z2luUHJvcHMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLypcbiAgICAgICAgbW91bnRQbHVnaW4ocHJvcHM6IEpzb24sIHNlcnZpY2VzOiBEZWxwaGluZVNlcnZpY2VzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29udGFpbmVyID0gdGhpcy5odG1sRWxlbWVudDtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbnRhaW5lcikgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmZhY3RvcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZpY2VzLmxvZy53YXJuKCdUUGx1Z2luSG9zdDogbm8gcGx1Z2luIGZhY3Rvcnkgc2V0JywgeyBob3N0OiB0aGlzLm5hbWUgYXMgYW55IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIERpc3Bvc2Ugb2xkIGluc3RhbmNlIGlmIGFueVxuICAgICAgICAgICAgICAgIHRoaXMudW5tb3VudCgpO1xuXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIHBsdWdpbiBpbnN0YW5jZSB0aGVuIG1vdW50XG4gICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZSA9IHRoaXMuZmFjdG9yeSh7IGhvc3Q6IHRoaXMsIGZvcm06IHRoaXMuZm9ybSEgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZSEubW91bnQoY29udGFpbmVyLCBwcm9wcywgc2VydmljZXMpO1xuICAgICAgICB9XG4gICAgICAgICAgICAgICAgKi9cblxuICAgICAgICAvLyBDYWxsZWQgYnkgYnVpbGRDb21wb25lbnRUcmVlKClcbiAgICAgICAgc2V0UGx1Z2luU3BlYyhzcGVjOiB7IHBsdWdpbjogc3RyaW5nIHwgbnVsbDsgcHJvcHM6IGFueSB9KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW5OYW1lID0gc3BlYy5wbHVnaW47XG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW5Qcm9wcyA9IHNwZWMucHJvcHMgPz8ge307XG4gICAgICAgIH1cblxuICAgICAgICAvKlxuICAgICAgICAvLyBDYWxsZWQgYnkgdGhlIG1ldGFjbGFzcyAob3IgYnkgeW91ciByZWdpc3RyeSkgcmlnaHQgYWZ0ZXIgY3JlYXRpb25cbiAgICAgICAgc2V0UGx1Z2luRmFjdG9yeShmYWN0b3J5OiBVSVBsdWdpbkZhY3RvcnkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZhY3RvcnkgPSBmYWN0b3J5O1xuICAgICAgICB9XG4gICAgICAgICAgICAgICAgKi9cblxuICAgICAgICAvLyBDYWxsZWQgYnkgYnVpbGRDb21wb25lbnRUcmVlKCkgd2hlbiBET00gZWxlbWVudCBpcyBhc3NpZ25lZFxuICAgICAgICBtb3VudFBsdWdpbklmUmVhZHkoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaG9zdEVsID0gdGhpcy5odG1sRWxlbWVudDtcbiAgICAgICAgICAgICAgICBpZiAoIWhvc3RFbCB8fCAhdGhpcy5mb3JtKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNlcnZpY2VzID0gdG90by5zZXJ2aWNlczsgLy8gVE9ETyBnZXQgcmVhbCBzZXJ2aWNlcyBmcm9tIGFyZ3NcblxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhIHN0YWJsZSBtb3VudCBwb2ludCBJTlNJREUgdGhlIGhvc3RcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubW91bnRQb2ludCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3VudFBvaW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdW50UG9pbnQuc2V0QXR0cmlidXRlKCdkYXRhLWRlbHBoaW5lLW1vdW50JywgJzEnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvc3RFbC5yZXBsYWNlQ2hpbGRyZW4odGhpcy5tb3VudFBvaW50KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBJbml0aWFsIG1vdW50IGZyb20gRE9NIGF0dHJpYnV0ZXNcbiAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2hGcm9tRG9tKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBPYnNlcnZlIGF0dHJpYnV0ZSBjaGFuZ2VzIHRvIGtlZXAgcGx1Z2luIGluIHN5bmNcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMub2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigobXV0YXRpb25zKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbSBvZiBtdXRhdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobS50eXBlID09PSAnYXR0cmlidXRlcycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGEgPSBtLmF0dHJpYnV0ZU5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYSA9PT0gJ2RhdGEtcGx1Z2luJyB8fCBhID09PSAnZGF0YS1wcm9wcycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoRnJvbURvbSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vYnNlcnZlci5vYnNlcnZlKGhvc3RFbCwgeyBhdHRyaWJ1dGVzOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEVuZ2xpc2ggY29tbWVudHMgYXMgcmVxdWVzdGVkLlxuXG4gICAgICAgIHByaXZhdGUgcmVmcmVzaEZyb21Eb20oKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VydmljZXMgPSB0aGlzLnNlcnZpY2VzO1xuICAgICAgICAgICAgICAgIGNvbnN0IGhvc3RFbCA9IHRoaXMuaHRtbEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgaWYgKCFzZXJ2aWNlcyB8fCAhaG9zdEVsIHx8ICF0aGlzLmZvcm0gfHwgIXRoaXMubW91bnRQb2ludCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3UGx1Z2luID0gaG9zdEVsLmdldEF0dHJpYnV0ZSgnZGF0YS1wbHVnaW4nKTsgLy8gc3RyaW5nIHwgbnVsbFxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1Byb3BzID0gc2FmZVBhcnNlSnNvbihob3N0RWwuZ2V0QXR0cmlidXRlKCdkYXRhLXByb3BzJykpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0tleSA9IHN0YWJsZVN0cmluZ2lmeShuZXdQcm9wcyk7XG5cbiAgICAgICAgICAgICAgICAvLyBOb3RoaW5nIHRvIG1vdW50ID0+IHVubW91bnQgYW5kIGV4aXRcbiAgICAgICAgICAgICAgICBpZiAoIW5ld1BsdWdpbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW5OYW1lID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luUHJvcHMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luUHJvcHNLZXkgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudW5tb3VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IG5lZWRSZW1vdW50ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICF0aGlzLmluc3RhbmNlIHx8IC8vIDwtLSBmaXJzdCB0aW1lOiBubyBpbnN0YW5jZSB5ZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1BsdWdpbiAhPT0gdGhpcy5wbHVnaW5OYW1lOyAvLyA8LS0gcGx1Z2luIGNoYW5nZWRcblxuICAgICAgICAgICAgICAgIGlmIChuZWVkUmVtb3VudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW5OYW1lID0gbmV3UGx1Z2luO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW5Qcm9wcyA9IG5ld1Byb3BzO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW5Qcm9wc0tleSA9IG5ld0tleTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFNhbWUgcGx1Z2luID0+IHVwZGF0ZSBvbmx5IGlmIHByb3BzIGNoYW5nZWRcbiAgICAgICAgICAgICAgICBpZiAobmV3S2V5ICE9PSB0aGlzLnBsdWdpblByb3BzS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpblByb3BzID0gbmV3UHJvcHM7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpblByb3BzS2V5ID0gbmV3S2V5O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZT8udXBkYXRlKG5ld1Byb3BzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZSByZW1vdW50KCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlcnZpY2VzID0gdGhpcy5zZXJ2aWNlcztcbiAgICAgICAgICAgICAgICBpZiAoIXNlcnZpY2VzIHx8ICF0aGlzLmZvcm0gfHwgIXRoaXMubW91bnRQb2ludCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgLy8gUmVzb2x2ZSBwbHVnaW5cbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMucGx1Z2luTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51bm1vdW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgZGVmID0gUGx1Z2luUmVnaXN0cnkucGx1Z2luUmVnaXN0cnkuZ2V0KHRoaXMucGx1Z2luTmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKCFkZWYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZpY2VzLmxvZy53YXJuKCdVbmtub3duIHBsdWdpbicsIHsgcGx1Z2luOiB0aGlzLnBsdWdpbk5hbWUgYXMgYW55IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51bm1vdW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gSGFyZCByZW1vdW50XG4gICAgICAgICAgICAgICAgdGhpcy51bm1vdW50KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZSA9IGRlZi5mYWN0b3J5KHsgaG9zdDogdGhpcywgZm9ybTogdGhpcy5mb3JtIH0pOyAvLyBUaGUgaW5zdGFuY2UgaXMgY3JlYXRlZCBIZXJlICEtLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgICAgICB0aGlzLmluc3RhbmNlLm1vdW50KHRoaXMubW91bnRQb2ludCwgdGhpcy5wbHVnaW5Qcm9wcywgc2VydmljZXMpOyAvLyBQdWlzIGVzdCBtb250XHUwMEU5IGljaSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIH1cblxuICAgICAgICB1bm1vdW50KCkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluc3RhbmNlPy51bm1vdW50KCk7XG4gICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFuY2UgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGRpc3Bvc2UoKSB7XG4gICAgICAgICAgICAgICAgLy8gQ2FsbCB0aGlzIHdoZW4gdGhlIGNvbXBvbmVudCBpcyBkZXN0cm95ZWQgKGlmIHlvdSBoYXZlIHN1Y2ggYSBob29rKVxuICAgICAgICAgICAgICAgIHRoaXMudW5tb3VudCgpO1xuICAgICAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXI/LmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9ic2VydmVyID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLm1vdW50UG9pbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VydmljZXMgPSBudWxsO1xuICAgICAgICB9XG59XG5cbmV4cG9ydCB0eXBlIFVJUGx1Z2luRmFjdG9yeTxQcm9wcyBleHRlbmRzIEpzb24gPSBKc29uPiA9IChhcmdzOiB7IGhvc3Q6IFRQbHVnaW5Ib3N0OyBmb3JtOiBURm9ybSB9KSA9PiBVSVBsdWdpbkluc3RhbmNlPFByb3BzPjtcblxuZXhwb3J0IGludGVyZmFjZSBTaXplSGludHMge1xuICAgICAgICBtaW5XaWR0aD86IG51bWJlcjtcbiAgICAgICAgbWluSGVpZ2h0PzogbnVtYmVyO1xuICAgICAgICBwcmVmZXJyZWRXaWR0aD86IG51bWJlcjtcbiAgICAgICAgcHJlZmVycmVkSGVpZ2h0PzogbnVtYmVyO1xufVxuXG5leHBvcnQgdHlwZSBVSVBsdWdpbkRlZiA9IHtcbiAgICAgICAgZmFjdG9yeTogVUlQbHVnaW5GYWN0b3J5O1xuICAgICAgICAvLyBvcHRpb25uZWwgOiB1biBzY2hcdTAwRTltYSBkZSBwcm9wcywgYWlkZSBhdSBkZXNpZ25lclxuICAgICAgICAvLyBwcm9wcz86IFByb3BTY2hlbWE7XG59O1xuXG5leHBvcnQgY2xhc3MgUGx1Z2luUmVnaXN0cnkge1xuICAgICAgICBzdGF0aWMgcGx1Z2luUmVnaXN0cnkgPSBuZXcgUGx1Z2luUmVnaXN0cnkoKTtcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSBwbHVnaW5zID0gbmV3IE1hcDxzdHJpbmcsIFVJUGx1Z2luRGVmPigpO1xuXG4gICAgICAgIHJlZ2lzdGVyKG5hbWU6IHN0cmluZywgZGVmOiBVSVBsdWdpbkRlZikge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBsdWdpbnMuaGFzKG5hbWUpKSB0aHJvdyBuZXcgRXJyb3IoYFBsdWdpbiBhbHJlYWR5IHJlZ2lzdGVyZWQ6ICR7bmFtZX1gKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbnMuc2V0KG5hbWUsIGRlZik7XG4gICAgICAgIH1cblxuICAgICAgICBnZXQobmFtZTogc3RyaW5nKTogVUlQbHVnaW5EZWYgfCB1bmRlZmluZWQge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBsdWdpbnMuZ2V0KG5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaGFzKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBsdWdpbnMuaGFzKG5hbWUpO1xuICAgICAgICB9XG59XG4iLCAiZXhwb3J0IGNsYXNzIE1ldGFSb290IHtcbiAgICAgICAgc3RhdGljIHJlYWRvbmx5IG1ldGFjbGFzczogTWV0YVJvb3QgPSBuZXcgTWV0YVJvb3QobnVsbCk7XG5cbiAgICAgICAgcmVhZG9ubHkgc3VwZXJDbGFzczogTWV0YVJvb3QgfCBudWxsO1xuICAgICAgICByZWFkb25seSB0eXBlTmFtZTogc3RyaW5nO1xuXG4gICAgICAgIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihzdXBlckNsYXNzOiBNZXRhUm9vdCB8IG51bGwsIHR5cGVOYW1lID0gJ1RNZXRhUm9vdCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN1cGVyQ2xhc3MgPSBzdXBlckNsYXNzO1xuICAgICAgICAgICAgICAgIHRoaXMudHlwZU5hbWUgPSB0eXBlTmFtZTtcbiAgICAgICAgfVxuICAgICAgICBnZXRNZXRhY2xhc3MoKTogTWV0YVJvb3Qge1xuICAgICAgICAgICAgICAgIHJldHVybiBNZXRhUm9vdC5tZXRhY2xhc3M7XG4gICAgICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1ldGFUZXN0QSBleHRlbmRzIE1ldGFSb290IHtcbiAgICAgICAgc3RhdGljIHJlYWRvbmx5IG1ldGFjbGFzczogTWV0YVRlc3RBID0gbmV3IE1ldGFUZXN0QShNZXRhUm9vdC5tZXRhY2xhc3MpO1xuXG4gICAgICAgIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihzdXBlckNsYXNzOiBNZXRhUm9vdCkge1xuICAgICAgICAgICAgICAgIHN1cGVyKHN1cGVyQ2xhc3MsICdUZXN0QScpO1xuICAgICAgICB9XG4gICAgICAgIGdldE1ldGFjbGFzcygpOiBNZXRhVGVzdEEge1xuICAgICAgICAgICAgICAgIHJldHVybiBNZXRhVGVzdEEubWV0YWNsYXNzO1xuICAgICAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBNZXRhVGVzdEIgZXh0ZW5kcyBNZXRhVGVzdEEge1xuICAgICAgICBzdGF0aWMgcmVhZG9ubHkgbWV0YWNsYXNzOiBNZXRhVGVzdEIgPSBuZXcgTWV0YVRlc3RCKE1ldGFUZXN0QS5tZXRhY2xhc3MpO1xuXG4gICAgICAgIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihzdXBlckNsYXNzOiBNZXRhVGVzdEEpIHtcbiAgICAgICAgICAgICAgICBzdXBlcihzdXBlckNsYXNzKTtcbiAgICAgICAgICAgICAgICAvLyBldCB2b3VzIGNoYW5nZXoganVzdGUgbGUgbm9tIDpcbiAgICAgICAgICAgICAgICAodGhpcyBhcyBhbnkpLnR5cGVOYW1lID0gJ1Rlc3RCJztcbiAgICAgICAgfVxuICAgICAgICBnZXRNZXRhY2xhc3MoKTogTWV0YVRlc3RCIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWV0YVRlc3RCLm1ldGFjbGFzcztcbiAgICAgICAgfVxufVxuXG5leHBvcnQgY2xhc3MgTWV0YVRlc3RDIGV4dGVuZHMgTWV0YVRlc3RCIHtcbiAgICAgICAgc3RhdGljIHJlYWRvbmx5IG1ldGFjbGFzczogTWV0YVRlc3RDID0gbmV3IE1ldGFUZXN0QyhNZXRhVGVzdEIubWV0YWNsYXNzKTtcblxuICAgICAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3Ioc3VwZXJDbGFzczogTWV0YVRlc3RCKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoc3VwZXJDbGFzcyk7XG4gICAgICAgICAgICAgICAgKHRoaXMgYXMgYW55KS50eXBlTmFtZSA9ICdUZXN0Qyc7XG4gICAgICAgIH1cblxuICAgICAgICBnZXRNZXRhY2xhc3MoKTogTWV0YVRlc3RDIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWV0YVRlc3RDLm1ldGFjbGFzcztcbiAgICAgICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdGVzdCgpIHtcbiAgICAgICAgbGV0IGM6IE1ldGFSb290IHwgbnVsbCA9IE1ldGFUZXN0Qy5tZXRhY2xhc3M7XG4gICAgICAgIHdoaWxlIChjKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7Yy5nZXRNZXRhY2xhc3MoKS50eXBlTmFtZX0gLSAke2MudHlwZU5hbWV9IC0+ICR7Yy5zdXBlckNsYXNzPy50eXBlTmFtZX1gKTtcbiAgICAgICAgICAgICAgICBjID0gYy5zdXBlckNsYXNzO1xuICAgICAgICB9XG59XG4iLCAiLy8vIDxyZWZlcmVuY2UgbGliPVwiZG9tXCIgLz5cbmNvbnNvbGUubG9nKCdJIEFNIFpBWkEnKTtcbi8vaW1wb3J0IHsgaW5zdGFsbERlbHBoaW5lUnVudGltZSB9IGZyb20gXCIuL3NyYy9kcnRcIjsgLy8gPC0tIFRTLCBwYXMgLmpzXG5pbXBvcnQgeyBURm9ybSwgVENvbG9yLCBUQXBwbGljYXRpb24sIFRDb21wb25lbnQsIFRCdXR0b24gfSBmcm9tICdAdmNsJztcbmltcG9ydCB7IHRlc3QgfSBmcm9tICcuL3Rlc3QnO1xuXG4vL2ltcG9ydCB7IENvbXBvbmVudFR5cGVSZWdpc3RyeSB9IGZyb20gJ0B2Y2wvU3RkQ3RybHMnO1xuLy9pbXBvcnQgeyBDb21wb25lbnRSZWdpc3RyeSB9IGZyb20gJ0BkcnQvQ29tcG9uZW50UmVnaXN0cnknO1xuLy9pbXBvcnQgeyBUUGx1Z2luSG9zdCB9IGZyb20gJ0BkcnQvVUlQbHVnaW4nO1xuLypcbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlclBsdWdpblR5cGVzKHJlZzogQ29tcG9uZW50VHlwZVJlZ2lzdHJ5KTogdm9pZCB7XG4gICAgICAgIC8gKlxuICAgICAgICAvLyBFeGFtcGxlOiBhbnkgdHlwZSBuYW1lIGNhbiBiZSBwcm92aWRlZCBieSBhIHBsdWdpbi5cbiAgICAgICAgcmVnLnJlZ2lzdGVyLnJlZ2lzdGVyVHlwZSgnY2hhcnRqcy1waWUnLCAobmFtZTogc3RyaW5nLCBmb3JtOiBURm9ybSwgcGFyZW50OiBUQ29tcG9uZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQbHVnaW5Ib3N0KG5hbWUsIGZvcm0sIHBhcmVudCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJlZy5yZWdpc3RlclR5cGUoJ3Z1ZS1oZWxsbycsIChuYW1lOiBzdHJpbmcsIGZvcm06IFRGb3JtLCBwYXJlbnQ6IFRDb21wb25lbnQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFBsdWdpbkhvc3QobmFtZSwgZm9ybSwgcGFyZW50KTtcbiAgICAgICAgfSk7XG4gICAgICAgICogL1xufVxuKi9cbmNvbnNvbGUubG9nKCdJIEFNIFpBWkEnKTtcblxuY2xhc3MgWmF6YSBleHRlbmRzIFRGb3JtIHtcbiAgICAgICAgLy8gRm9ybSBjb21wb25lbnRzIC0gVGhpcyBsaXN0IGlzIGF1dG8gZ2VuZXJhdGVkIGJ5IERlbHBoaW5lXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAvL2J1dHRvbjEgOiBUQnV0dG9uID0gbmV3IFRCdXR0b24oXCJidXR0b24xXCIsIHRoaXMsIHRoaXMpO1xuICAgICAgICAvL2J1dHRvbjIgOiBUQnV0dG9uID0gbmV3IFRCdXR0b24oXCJidXR0b24yXCIsIHRoaXMsIHRoaXMpO1xuICAgICAgICAvL2J1dHRvbjMgOiBUQnV0dG9uID0gbmV3IFRCdXR0b24oXCJidXR0b24zXCIsIHRoaXMsIHRoaXMpO1xuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS1cblxuICAgICAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICBzdXBlcihuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICAvL2ltcG9ydCB7IGluc3RhbGxEZWxwaGluZVJ1bnRpbWUgfSBmcm9tIFwiLi9kcnRcIjtcblxuICAgICAgICAvKlxuY29uc3QgcnVudGltZSA9IHsgICBcbiAgaGFuZGxlQ2xpY2soeyBlbGVtZW50IH06IHsgZWxlbWVudDogRWxlbWVudCB9KSB7XG4gICAgY29uc29sZS5sb2coXCJjbGlja2VkIVwiLCBlbGVtZW50KTtcbiAgICAvLyhlbGVtZW50IGFzIEhUTUxFbGVtZW50KS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcInJlZFwiO1xuICB9LFxufTsgXG4qL1xuXG4gICAgICAgIHByb3RlY3RlZCBvbk15Q3JlYXRlKF9ldjogRXZlbnQgfCBudWxsLCBfc2VuZGVyOiBUQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYnRuID0gdGhpcy5jb21wb25lbnRSZWdpc3RyeS5nZXQoJ2J1dHRvbjInKTtcbiAgICAgICAgICAgICAgICBpZiAoYnRuKSBidG4uY29sb3IgPSBUQ29sb3IucmdiKDAsIDAsIDI1NSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm90ZWN0ZWQgb25NeVNob3duKF9ldjogRXZlbnQgfCBudWxsLCBfc2VuZGVyOiBUQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYnRuID0gdGhpcy5jb21wb25lbnRSZWdpc3RyeS5nZXQoJ2J1dHRvbjMnKTtcbiAgICAgICAgICAgICAgICBpZiAoYnRuKSBidG4uY29sb3IgPSBUQ29sb3IucmdiKDAsIDI1NSwgMjU1KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJ1dHRvbjFfb25jbGljayhfZXY6IEV2ZW50IHwgbnVsbCwgX3NlbmRlcjogVENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ0biA9IHRoaXMuY29tcG9uZW50UmVnaXN0cnkuZ2V0PFRCdXR0b24+KCdidXR0b24xJyk7XG4gICAgICAgICAgICAgICAgaWYgKCFidG4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignYnV0dG9uMSBub3QgZm91bmQgaW4gcmVnaXN0cnknKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy9idG4uY29sb3IgPSBUQ29sb3IucmdiKDAsIDAsIDI1NSk7XG4gICAgICAgICAgICAgICAgYnRuIS5jb2xvciA9IFRDb2xvci5yZ2IoMjU1LCAwLCAwKTtcbiAgICAgICAgICAgICAgICBidG4hLmNhcHRpb24gPSAnTUlNSSc7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0J1dHRvbjEgY2xpY2tlZCEhISEnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHphemFfb25jbGljayhfZXY6IEV2ZW50IHwgbnVsbCwgX3NlbmRlcjogVENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ0biA9IHRoaXMuY29tcG9uZW50UmVnaXN0cnkuZ2V0PFRCdXR0b24+KCdidXR0b254Jyk7XG4gICAgICAgICAgICAgICAgYnRuIS5jb2xvciA9IFRDb2xvci5yZ2IoMCwgMjU1LCAwKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnemF6YSBjbGlja2VkISEhIScpO1xuICAgICAgICAgICAgICAgIC8vYnRuIS5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvL2luc3RhbGxEZWxwaGluZVJ1bnRpbWUocnVudGltZSk7XG59IC8vIGNsYXNzIHphemFcblxuY2xhc3MgTXlBcHBsaWNhdGlvbiBleHRlbmRzIFRBcHBsaWNhdGlvbiB7XG4gICAgICAgIHphemE6IFphemE7XG5cbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnphemEgPSBuZXcgWmF6YSgnemF6YScpO1xuICAgICAgICAgICAgICAgIHRoaXMubWFpbkZvcm0gPSB0aGlzLnphemE7XG4gICAgICAgIH1cblxuICAgICAgICBydW4oKSB7XG4gICAgICAgICAgICAgICAgLy90aGlzLnphemEuY29tcG9uZW50UmVnaXN0cnkuYnVpbGRDb21wb25lbnRUcmVlKHRoaXMuemF6YSk7XG4gICAgICAgICAgICAgICAgLy90aGlzLnphemEuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snKTtcblxuICAgICAgICAgICAgICAgIC8vIGF1IGxhbmNlbWVudFxuICAgICAgICAgICAgICAgIHRoaXMucnVuV2hlbkRvbVJlYWR5KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuemF6YS5zaG93KCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbn0gLy8gY2xhc3MgTXlBcHBsaWNhdGlvblxuXG5jb25zdCBteUFwcGxpY2F0aW9uOiBNeUFwcGxpY2F0aW9uID0gbmV3IE15QXBwbGljYXRpb24oKTtcbnRlc3QoKTtcbm15QXBwbGljYXRpb24ucnVuKCk7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7OztBQUVPLFNBQVMsaUJBQWlCLE9BQStCO0FBQ3hELFFBQU0sU0FBUyxZQUFZLFNB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LEVBQUU7QUFBQSxFQUNkO0FBQ1I7OztBQ3pEQSxRQUFRLElBQUksV0FBVztBQXNCdkIsUUFBUSxJQUFJLFdBQVc7QUFFdkIsSUFBTSxPQUFOLGNBQW1CLE1BQU07QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQVFqQixZQUFZLE1BQWM7QUFDbEIsVUFBTSxJQUFJO0FBQUEsRUFDbEI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQVlVLFdBQVcsS0FBbUIsU0FBcUI7QUFDckQsVUFBTSxNQUFNLEtBQUssa0JBQWtCLElBQUksU0FBUztBQUNoRCxRQUFJLElBQUssS0FBSSxRQUFRLE9BQU8sSUFBSSxHQUFHLEdBQUcsR0FBRztBQUFBLEVBQ2pEO0FBQUEsRUFFVSxVQUFVLEtBQW1CLFNBQXFCO0FBQ3BELFVBQU0sTUFBTSxLQUFLLGtCQUFrQixJQUFJLFNBQVM7QUFDaEQsUUFBSSxJQUFLLEtBQUksUUFBUSxPQUFPLElBQUksR0FBRyxLQUFLLEdBQUc7QUFBQSxFQUNuRDtBQUFBLEVBRUEsZ0JBQWdCLEtBQW1CLFNBQXFCO0FBQ2hELFVBQU0sTUFBTSxLQUFLLGtCQUFrQixJQUFhLFNBQVM7QUFDekQsUUFBSSxDQUFDLEtBQUs7QUFDRixjQUFRLEtBQUssK0JBQStCO0FBQzVDO0FBQUEsSUFDUjtBQUVBLFFBQUssUUFBUSxPQUFPLElBQUksS0FBSyxHQUFHLENBQUM7QUFDakMsUUFBSyxVQUFVO0FBQ2YsWUFBUSxJQUFJLHFCQUFxQjtBQUFBLEVBQ3pDO0FBQUEsRUFFQSxhQUFhLEtBQW1CLFNBQXFCO0FBQzdDLFVBQU0sTUFBTSxLQUFLLGtCQUFrQixJQUFhLFNBQVM7QUFDekQsUUFBSyxRQUFRLE9BQU8sSUFBSSxHQUFHLEtBQUssQ0FBQztBQUNqQyxZQUFRLElBQUksa0JBQWtCO0FBQUEsRUFFdEM7QUFBQTtBQUdSO0FBRUEsSUFBTSxnQkFBTixjQUE0QixhQUFhO0FBQUEsRUFHakMsY0FBYztBQUNOLFVBQU07QUFIZDtBQUlRLFNBQUssT0FBTyxJQUFJLEtBQUssTUFBTTtBQUMzQixTQUFLLFdBQVcsS0FBSztBQUFBLEVBQzdCO0FBQUEsRUFFQSxNQUFNO0FBS0UsU0FBSyxnQkFBZ0IsTUFBTTtBQUNuQixXQUFLLEtBQUssS0FBSztBQUFBLElBQ3ZCLENBQUM7QUFBQSxFQUNUO0FBQ1I7QUFFQSxJQUFNLGdCQUErQixJQUFJLGNBQWM7QUFDdkQsS0FBSztBQUNMLGNBQWMsSUFBSTsiLAogICJuYW1lcyI6IFsiVENvbXBvbmVudFR5cGVSZWdpc3RyeSIsICJlbCJdCn0K
