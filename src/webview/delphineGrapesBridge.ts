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
                }
        ]);
}

function buildTraitsFromSchema(schema: ComponentSchema) {
        const traits: any[] = [];

        for (const [propName, prop] of Object.entries(schema.props ?? {})) {
                let traitType = 'text';

                if (prop.kind === 'boolean') {
                        traitType = 'checkbox';
                } else if (prop.kind === 'number') {
                        traitType = 'number';
                }

                traits.push({
                        type: traitType,
                        name: propName,

                        label: propName,

                        changeProp: true // 🔥 🔥 🔥 CRUCIAL
                });
        }

        return traits;
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
function schemaToGrapesContent(schema: ComponentSchema): any {
        const isDelphineComponent = !!schema.component;

        return {
                type: isDelphineComponent ? `delphine-${schema.name}` : 'default',

                tagName: schema.tagName ?? 'div',

                attributes: {
                        ...(schema.attributes ?? {}),
                        ...(isDelphineComponent ? { 'data-delphine-component': schema.name } : {})
                },

                selectable: schema.selectable ?? isDelphineComponent,
                draggable: schema.draggable ?? isDelphineComponent,
                droppable: schema.droppable ?? schema.isContainer ?? false,
                copyable: schema.copyable ?? isDelphineComponent,
                removable: schema.removable ?? isDelphineComponent,
                editable: schema.editable ?? false,
                hoverable: schema.hoverable ?? isDelphineComponent,
                layerable: schema.layerable ?? isDelphineComponent,
                resizable: schema.resizable ?? false,

                components: schema.components?.map(schemaToGrapesContent) ?? []
        };
}
function schemaToBlockContent(schema: ComponentSchema): any {
        return {
                type: `delphine-${schema.name}`,

                attributes: {
                        'data-delphine-component': schema.name,
                        'data-delphine-name': schema.instanceName
                },

                components: schema.components?.map(schemaToBlockContent) ?? []
        };
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

                                traits: buildTraitsFromSchema(schema)
                        },

                        init(this: any) {
                                const model = this;
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
                                                const value = model.get(spec.name);

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
/*

function buildTraits(propSpecs: PropSpec<any>[]): any[] {
        const traits: any[] = [];

        for (const spec of propSpecs) {
                if (spec.kind === 'handler') {
                        continue;
                }

                const traitType = spec.grapes?.traitType ?? mapPropKindToTraitType(spec.kind);

                traits.push({
                        type: traitType,
                        name: spec.name,
                        label: spec.grapes?.label ?? spec.name,
                        changeProp: true
                });
        }

        return traits;
}
        */

/*
function buildDefaultAttributes(schema: ComponentSchema, propSpecs: PropSpec<any>[]): Record<string, string> {
        const attrs: Record<string, string> = {
                'data-delphine-component': schema.name
        };

        for (const spec of propSpecs) {
                if (spec.default === undefined) continue;
                if (spec.kind === 'handler') continue;

                attrs[`data-delphine-${spec.name}`] = stringifyPropValue(spec.default);
        }

        return attrs;
}
        */

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

        /*
        if (spec.kind === 'boolean') {
                const attrs = { ...(model.getAttributes?.() ?? {}) };

                if (spec.name === 'enabled') {
                        if (Boolean(value)) {
                                delete attrs.disabled;
                        } else {
                                attrs.disabled = 'disabled';
                        }
                }

                model.setAttributes(attrs);
        }
                */
}

function syncModelValueToAttributes(model: any, spec: PropSpec<any>, value: unknown): void {
        const attrName = `data-delphine-${spec.name}`;
        const attrs = { ...(model.getAttributes?.() ?? {}) };

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
