// designer/grapes/registerGrapesBlocks.ts

import type { ComponentMetadata, TDesignRegistry } from '../core/metadata';

export function registerGrapesBlocks(
        editor: any,

        registry: TDesignRegistry,

        excludedTypes: ReadonlySet<string> = new Set()
): void {
        for (const metadata of registry.getAll()) {
                if (excludedTypes.has(metadata.type)) {
                        continue;
                }

                registerGrapesBlock(editor, registry, metadata);
        }
}

function registerGrapesBlock(editor: any, registry: TDesignRegistry, metadata: ComponentMetadata): void {
        /*
         * Abstract design classes such as TLitControlElement do not have
         * a tag name and must not appear in the GrapesJS block palette.
         */
        if (!metadata.tagName) {
                return;
        }

        const resolvedMetadata = registry.getResolvedMetadata(metadata.type);

        const blockId = `delphine-${metadata.type}`;

        const existing = editor.BlockManager.get(blockId);
        if (existing) {
                editor.BlockManager.remove(blockId);
        }

        editor.BlockManager.add(blockId, {
                label: createBlockLabel(resolvedMetadata),
                category: resolvedMetadata.category ?? 'Delphine',

                content: createComponentDefinition(resolvedMetadata),

                attributes: {
                        title: resolvedMetadata.type
                }
        });
}

function createBlockLabel(metadata: ComponentMetadata): string {
        const label = metadata.instanceName ?? metadata.type.replace(/^T/, '');

        if (!metadata.icon) {
                return label;
        }

        return `
                <div class="delphine-block">
                        <div class="delphine-block-icon">
                                ${metadata.icon}
                        </div>

                        <div class="delphine-block-label">
                                ${escapeHtml(label)}
                        </div>
                </div>
        `;
}

function createTraits(metadata: ComponentMetadata): Record<string, unknown>[] {
        const traits: Record<string, unknown>[] = [];

        for (const property of metadata.properties) {
                if (!property.design) {
                        continue;
                }

                const trait: Record<string, unknown> = {
                        type: property.design.traitType ?? inferTraitType(property.type),

                        name: property.name,

                        label: property.design.label ?? property.name,

                        changeProp: false
                };

                if (property.design.options) {
                        trait.options = property.design.options.map((option) => ({
                                id: option,
                                name: option
                        }));
                }

                traits.push(trait);
        }

        for (const event of metadata.events) {
                traits.push({
                        type: 'delphine-event',
                        name: event.name,
                        label: event.label ?? event.name
                });
        }

        return traits;
}

function inferTraitType(propertyType: 'string' | 'number' | 'boolean'): string {
        switch (propertyType) {
                case 'boolean':
                        return 'checkbox';

                case 'number':
                        return 'number';

                case 'string':
                        return 'text';
        }
}

function createComponentDefinition(metadata: ComponentMetadata): Record<string, unknown> {
        if (!metadata.tagName) {
                throw new Error(`Design component "${metadata.type}" has no tag name.`);
        }

        const name = `${metadata.instanceName ?? metadata.type.replace(/^T/, '')}1`;

        const attributes: Record<string, string> = {
                'data-delphine-component': metadata.type,
                'data-delphine-name': name
        };

        for (const property of metadata.properties) {
                if (property.defaultValue === undefined || property.defaultValue === null) {
                        continue;
                }

                attributes[property.name] = String(property.defaultValue);
        }

        return {
                // PAS de type: metadata.tagName

                tagName: metadata.tagName,

                attributes,
                traits: createTraits(metadata),

                name,

                draggable: true,
                droppable: metadata.droppable ?? false,
                resizable: metadata.resizable ?? false
        };
}

function escapeHtml(value: string): string {
        return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
