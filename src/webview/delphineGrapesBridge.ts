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

function registerComponentType(editor: Editor, meta: IMetaComponent, schema: ComponentSchema): void {
        const typeId = `delphine-${schema.name}`;
        const propSpecs = meta.getPropSpecs?.() ?? [];

        editor.DomComponents.addType(typeId, {
                isComponent(el) {
                        if (!(el instanceof HTMLElement)) return false;
                        const componentName = el.getAttribute('data-delphine-component');
                        if (componentName === schema.name) {
                                return { type: typeId };
                        }
                        return false;
                },

                model: {
                        defaults: {
                                tagName: schema.tagName,

                                resizable: schema.resizable ?? false,

                                draggable: true,

                                droppable: schema.isContainer ?? false,

                                attributes: {
                                        'data-delphine-component': schema.name
                                },

                                traits: buildTraitsFromSchema(schema)
                        },
                        init(this: any) {
                                const model = this;
                                const attrs = model.getAttributes?.() ?? {};

                                // 1) Hydrate model props from DOM attributes
                                for (const spec of propSpecs) {
                                        const attrName = `data-delphine-${spec.name}`;
                                        const raw = attrs[attrName];

                                        if (raw === undefined) {
                                                continue;
                                        }

                                        let value: unknown = raw;

                                        switch (spec.kind) {
                                                case 'boolean':
                                                        value = raw !== 'false' && raw !== '0' && raw !== '' && raw !== false;
                                                        break;

                                                case 'number':
                                                        value = Number(raw);
                                                        break;

                                                default:
                                                        value = raw;
                                                        break;
                                        }

                                        model.set(spec.name, value, { silent: true });
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

function registerBlock(editor: Editor, schema: ComponentSchema): void {
        editor.BlockManager.add(`block-${schema.name}`, {
                label: schema.label,
                category: schema.category,
                content: {
                        type: `delphine-${schema.name}`,
                        attributes: {
                                'data-delphine-component': schema.name,
                                'data-delphine-name': schema.instanceName
                        }
                }
        });
}

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
                model.components(String(value ?? ''));
                return;
        }

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
}

function syncModelValueToAttributes(model: any, spec: PropSpec<any>, value: unknown): void {
        const attrs = { ...(model.getAttributes?.() ?? {}) };
        attrs[`data-delphine-${spec.name}`] = stringifyPropValue(value);
        model.setAttributes(attrs);
}

function stringifyPropValue(value: unknown): string {
        if (typeof value === 'boolean') {
                return value ? 'true' : 'false';
        }

        if (value === null || value === undefined) {
                return '';
        }

        return String(value);
}
