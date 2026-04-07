import type { Editor } from 'grapesjs';
import type { TTypeRegistry } from '../vcl/TypeRegistry.js';
import type { IMetaComponent, ComponentSchema } from '../vcl/IComponent.js';

export function registerDelphineComponentsFromRegistry(editor: Editor, typeRegistry: TTypeRegistry): void {
        for (const meta of typeRegistry.getAll()) {
                const schema = meta.getSchema?.();
                if (!schema) continue;

                registerComponentType(editor, meta, schema);
                registerBlock(editor, schema);
        }
}
function registerComponentType(editor: Editor, meta: IMetaComponent, schema: ComponentSchema): void {
        const typeId = `delphine-${schema.name}`;

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
                                draggable: true,
                                droppable: schema.isContainer ?? false,
                                attributes: {
                                        'data-delphine-component': schema.name
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
