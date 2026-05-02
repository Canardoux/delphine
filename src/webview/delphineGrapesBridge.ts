import type { Editor } from 'grapesjs';
import type { TTypeRegistry } from '../vcl/TypeRegistry.js';
import type { IMetaComponent, ComponentSchema } from '../vcl/IComponent.js';
import type { PropSpec } from '../vcl/IComponent.js';

export function registerDelphineComponentsFromRegistry(editor: Editor, typeRegistry: TTypeRegistry): void {
        for (const meta of typeRegistry.getAll()) {
                const schema = meta.getSchema?.();
                if (!schema) continue;

                registerComponentType(editor, meta, schema);
                registerBlock(editor, schema);
        }

        customizeOptionsPanel(editor);
}

export function showCurrentDelphineTraitTab(editor: any, model: any) {
        showDelphineTraitTab(editor, model, currentTraitTab);
        //updateTraitButtons(editor);
}

export function showDelphineTraitTab(editor: any, model: any, tab: 'properties' | 'events') {
        if (!model) {
                console.warn('[Delphine] No component selected');
                return;
        }

        const sets = model.get('delphineTraits');

        if (!sets) {
                console.warn('[Delphine] Selected component has no delphineTraits', model);
                return;
        }

        model.set('traits', sets[tab]);
        editor.TraitManager.select(model);
        editor.TraitManager.render?.();

        // Open Settings / Trait Manager panel

        editor.Panels.getButton('views', 'open-tm')?.set('active', true);
}

let currentTraitTab: 'properties' | 'events' = 'properties';
//function updateTraitButtons(editor: any) {
//const propsBtn = editor.Panels.getButton('options', 'delphine-properties');
//const eventsBtn = editor.Panels.getButton('options', 'delphine-events');

//propsBtn?.set('active', currentTraitTab === 'properties');
//eventsBtn?.set('active', currentTraitTab === 'events');
//}

function setTraitTab(editor: any, model: any, tab: 'properties' | 'events') {
        currentTraitTab = tab;

        showDelphineTraitTab(editor, model, tab);
        //updateTraitButtons(editor);
}
function customizeOptionsPanel(editor: Editor): void {
        // Remove buttons we do not want
        editor.Panels.removeButton('options', 'fullscreen');

        // Replace default preview/view-code if present
        editor.Panels.removeButton('options', 'preview');
        editor.Panels.removeButton('options', 'export-template');

        // Add our own buttons
        editor.Panels.addButton('options', [
                {
                        id: 'delphine-save',
                        label: '💾',
                        command: 'delphine:save',
                        attributes: { title: 'Save (Ctrl+S)' }
                },

                {
                        id: 'delphine-preview',
                        label: '👁',
                        command: 'delphine:preview',
                        attributes: { title: 'Open Delphine Preview' }
                },

                {
                        id: 'delphine-view-source',
                        label: '&lt;/&gt;',
                        command: 'delphine:view-source',
                        attributes: { title: 'Open MainForm.dform source' }
                },
                {
                        id: 'undo',
                        className: 'fa fa-undo',
                        command: 'core:undo',
                        attributes: { title: 'Undo (Ctrl+Z)' }
                },
                {
                        id: 'redo',
                        className: 'fa fa-repeat',
                        command: 'core:redo',
                        attributes: { title: 'Redo (Ctrl+Shift+Z)' }
                },
                {
                        id: 'delphine-properties',

                        label: '🔧',

                        command: () => {
                                const model = editor.getSelected();

                                setTraitTab(editor, model, 'properties');
                        },
                        attributes: { title: 'Properties' }
                },
                {
                        id: 'delphine-events',

                        label: '⚡',

                        command: () => {
                                const model = editor.getSelected();

                                setTraitTab(editor, model, 'events');
                        },
                        attributes: { title: 'Events' }
                }
                /*
                {
                        id: 'delphine-reload',

                        label: '🔄',

                        attributes: { title: 'Reload Designer' },

                        command: () => {
                                location.reload();
                        }
                }
                        */

                /*
                {
                        id: 'delphine-devtools',

                        label: '🛠',

                        attributes: { title: 'Open DevTools' },

                        command: () => {
                                postToVsCode({ type: 'delphine:devtools' });
                        }
                }
                        */
        ]);
}

function readPropFromAttrs(attrs: Record<string, any>, spec: PropSpec<any>): unknown {
        const attrName = `data-delphine-${spec.name}`;
        const raw = attrs[attrName];

        switch (spec.kind) {
                case 'boolean': {
                        if (raw === undefined || raw === null || raw === '') {
                                return spec.default ?? false;
                        }

                        return raw === true || raw === 'true' || raw === '1' || raw === 'on' || raw === 'yes';
                }

                case 'number': {
                        if (raw === undefined || raw === null || raw === '') {
                                return spec.default;
                        }

                        return Number(raw);
                }

                default: {
                        if (raw === undefined || raw === null) {
                                return spec.default;
                        }

                        return raw;
                }
        }
}

function buildTraitsFromPropSpecs(propSpecs: PropSpec<any>[], kind: 'properties' | 'events' = 'properties') {
        const traits: any[] = [];

        for (const spec of propSpecs) {
                const isEvent = spec.kind === 'handler';

                if (kind === 'properties' && isEvent) continue;
                if (kind === 'events' && !isEvent) continue;

                traits.push({
                        //type: spec.grapes?.traitType ?? mapPropKindToTraitType(spec.kind),
                        type: spec.kind === 'handler' ? 'delphine-event' : (spec.grapes?.traitType ?? mapPropKindToTraitType(spec.kind)),
                        name: spec.name,
                        label: spec.grapes?.label ?? spec.name,
                        changeProp: true
                });
        }

        return traits;
}
function normalizeComponentName(value: string): string {
        let name = value.trim();

        // Replace invalid characters with "_"
        name = name.replace(/[^a-zA-Z0-9_$]/g, '_');

        // Component names should not start with a digit
        if (!/^[a-zA-Z_$]/.test(name)) {
                name = `_${name}`;
        }

        return name || 'component';
}

function ensureUniqueComponentName(editor: any, model: any, wantedName: string): string {
        const wrapper = editor.getWrapper?.();
        if (!wrapper) return wantedName;

        const all = wrapper.find?.('[data-delphine-name]') ?? [];

        const existing = new Set<string>();

        for (const comp of all) {
                if (comp === model) continue;

                const attrs = comp.getAttributes?.() ?? {};
                const name = attrs['data-delphine-name'];

                if (name) {
                        existing.add(String(name));
                }
        }

        if (!existing.has(wantedName)) {
                return wantedName;
        }

        let index = 1;
        let candidate = `${wantedName}${index}`;

        while (existing.has(candidate)) {
                index++;
                candidate = `${wantedName}${index}`;
        }

        return candidate;
}

function registerComponentType(editor: Editor, meta: IMetaComponent, schema: ComponentSchema): void {
        const typeId = `delphine-${schema.name}`;
        const propSpecs = meta.getPropSpecs?.() ?? [];

        editor.DomComponents.addType(typeId, {
                isComponent(el) {
                        if (!(el instanceof HTMLElement)) return false;

                        const componentName = el.getAttribute('data-delphine-component');
                        if (componentName === schema.name) {
                                const delphineName = el.getAttribute('data-delphine-name');
                                return { name: `${delphineName}(${componentName})`, type: typeId };
                        }
                        return false;
                },

                model: {
                        defaults: {
                                name: schema.label ?? schema.name,
                                tagName: schema.tagName,

                                attributes: {
                                        ...(schema.attributes ?? {}),
                                        'data-delphine-component': schema.name
                                },

                                resizable: schema.resizable ?? false,
                                draggable: schema.draggable ?? true,
                                droppable: schema.droppable ?? schema.isContainer ?? false,

                                delphineTraits: {
                                        properties: buildTraitsFromPropSpecs(propSpecs, 'properties'),

                                        events: buildTraitsFromPropSpecs(propSpecs, 'events')
                                }
                        },

                        init(this: any) {
                                const model = this;

                                let syncingName = false;
                                const attrs = model.getAttributes?.() ?? {};

                                // 1) Hydrate model props from DOM attributes
                                // 1) Hydrate model props from DOM attributes or defaults
                                for (const spec of propSpecs) {
                                        const value = readPropFromAttrs(attrs, spec);

                                        if (value !== undefined) {
                                                model.set(spec.name, value, { silent: true });
                                        }
                                }

                                // 2) Listen trait/model changes
                                for (const spec of propSpecs) {
                                        if (!spec.grapes) continue;

                                        const traitEvent = `change:${spec.name}`;
                                        model.on(traitEvent, () => {
                                                if (spec.name === 'name' && syncingName) {
                                                        return;
                                                }
                                                let value = model.get(spec.name);
                                                if (spec.name === 'name') {
                                                        const normalized = ensureUniqueComponentName(
                                                                editor,

                                                                model,

                                                                normalizeComponentName(String(value ?? ''))
                                                        );

                                                        if (normalized !== value) {
                                                                syncingName = true;

                                                                try {
                                                                        model.set(spec.name, normalized, { silent: true });

                                                                        value = normalized;
                                                                } finally {
                                                                        syncingName = false;
                                                                }
                                                        }
                                                }
                                                if (spec.grapes?.applyToModel) {
                                                        spec.grapes.applyToModel(model, value);
                                                } else {
                                                        applyDefaultTraitToModel(model, spec, value);
                                                }

                                                syncModelValueToAttributes(model, spec, value);
                                        });
                                }

                                // 3) Initial render from hydrated values
                                for (const spec of propSpecs) {
                                        const value = model.get(spec.name);
                                        if (value === undefined) continue;

                                        if (spec.grapes?.applyToModel) {
                                                spec.grapes.applyToModel(model, value);
                                        } else {
                                                applyDefaultTraitToModel(model, spec, value);
                                        }

                                        syncModelValueToAttributes(model, spec, value);
                                }
                        }
                }
        });
        //registerDelphineEventTrait(editor);
}

function escapeHtml(value: string): string {
        return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function schemaToHtml(schema: ComponentSchema, isRoot = false): string {
        const tag = schema.tagName ?? 'div';

        const attrs: Record<string, string> = {
                ...(schema.attributes ?? {})
        };

        if (schema.component) {
                attrs['data-delphine-component'] = schema.name;
        }

        if (isRoot) {
                attrs['data-delphine-name'] = schema.instanceName ?? schema.name;
        }

        const attrText = Object.entries(attrs)
                .map(([key, value]) => ` ${key}="${escapeHtml(String(value))}"`)
                .join('');

        const children = schema.components?.map((child) => schemaToHtml(child, false)).join('') ?? escapeHtml(schema.textContent ?? '');

        if (tag === 'input') {
                return `<input${attrText}>`;
        }

        return `<${tag}${attrText}>${children}</${tag}>`;
}

function registerBlock(editor: Editor, schema: ComponentSchema): void {
        editor.BlockManager.add(`delphine-block-${schema.name}`, {
                label: schema.label,
                category: schema.category,
                content: schemaToHtml(schema, true)
        });
}

function mapPropKindToTraitType(kind: PropSpec<any>['kind']): string {
        switch (kind) {
                case 'boolean':
                        return 'checkbox';
                case 'number':
                        return 'number';
                default:
                        return 'text';
        }
}

function applyDefaultTraitToModel(model: any, spec: PropSpec<any>, value: unknown): void {
        if (spec.name === 'caption') {
                model.components(String(value ?? 'Caption'));
                return;
        }
}

function syncModelValueToAttributes(model: any, spec: PropSpec<any>, value: unknown): void {
        const attrName = `data-delphine-${spec.name}`;
        const attrs = { ...(model.getAttributes?.() ?? {}) };

        if (spec.name === 'name') {
                attrs['data-delphine-name'] = String(value ?? '');
                model.setAttributes(attrs);

                const componentClass = attrs['data-delphine-component'];

                // Use a different GrapesJS internal display key if needed,
                // but avoid setting the same "name" property again here.
                model.set('label', componentClass ? `${value} (${componentClass})` : String(value ?? ''), {
                        silent: true
                });

                return;
        }

        if (spec.kind === 'boolean') {
                const boolValue = value === true || value === 'true' || value === 1 || value === '1' || value === 'on' || value === 'yes';

                const defaultValue = spec.default ?? false;

                if (boolValue === defaultValue) {
                        delete attrs[attrName];
                } else {
                        attrs[attrName] = String(boolValue);
                }

                model.setAttributes(attrs);
                return;
        }

        attrs[attrName] = String(value ?? '');
        model.setAttributes(attrs);
}
