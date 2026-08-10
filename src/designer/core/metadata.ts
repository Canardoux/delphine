// designer/core/metadata.ts

import { vclDesignMetadata } from '../../vcl/designMetadata';
import { loadPalette } from '../../vcl/palettes/PaletteCatalog';

export interface ComponentPropertyMetadata {
        name: string;
        type: 'string' | 'number' | 'boolean';
        defaultValue?: string | number | boolean | null;
        design?: {
                label?: string;
                traitType?: 'text' | 'checkbox' | 'select' | 'color' | 'number';
                options?: string[];
        };
}

export interface ComponentEventMetadata {
        name: string;
        label?: string;
        attribute?: string;
        default?: boolean;
}

export interface ComponentMetadata {
        type: string;
        tagName?: string;
        category?: string;
        icon?: string;
        instanceName?: string;
        container?: boolean;
        resizable?: boolean;
        droppable?: boolean;

        extends?: string;

        properties: readonly ComponentPropertyMetadata[];
        events: readonly ComponentEventMetadata[];
}

function mergeByName<T extends { name: string }>(inherited: readonly T[], own: readonly T[]): T[] {
        const result = new Map<string, T>();

        for (const item of inherited) {
                result.set(item.name, item);
        }

        for (const item of own) {
                result.set(item.name, item);
        }

        return Array.from(result.values());
}

export class TDesignRegistry {
        private readonly byType = new Map<string, ComponentMetadata>();

        private readonly byTag = new Map<string, ComponentMetadata>();

        getResolvedMetadata(type: string): ComponentMetadata {
                const metadata = this.findByType(type);

                if (!metadata) {
                        throw new Error(`Unknown design type "${type}".`);
                }

                if (!metadata.extends) {
                        return metadata;
                }

                const parent = this.getResolvedMetadata(metadata.extends);

                return {
                        ...parent,
                        ...metadata,

                        properties: mergeByName(parent.properties, metadata.properties),

                        events: mergeByName(parent.events, metadata.events)
                };
        }

        register(metadata: ComponentMetadata): void {
                if (this.byType.has(metadata.type)) {
                        throw new Error(`Design metadata already registered for "${metadata.type}".`);
                }

                if (metadata.tagName && this.byTag.has(metadata.tagName)) {
                        throw new Error(`Design metadata already registered for tag <${metadata.tagName}>.`);
                }

                this.byType.set(metadata.type, metadata);

                if (metadata.tagName) {
                        this.byTag.set(metadata.tagName, metadata);
                }
        }

        findByType(type: string): ComponentMetadata | undefined {
                return this.byType.get(type);
        }

        findByTag(tagName: string): ComponentMetadata | undefined {
                return this.byTag.get(tagName);
        }

        getAll(): readonly ComponentMetadata[] {
                return Array.from(this.byType.values());
        }

        clear(): void {
                this.byType.clear();
                this.byTag.clear();
        }
}

export async function registerDesignPalettes(registry: TDesignRegistry, paletteNames: readonly string[]): Promise<void> {
        for (const paletteName of paletteNames) {
                const palette = await loadPalette(paletteName);

                console.log(`[Delphine] Registering design palette "${palette.name}".`);

                for (const component of palette.components) {
                        const module = await component.loadDesign();

                        registry.register(module.designMetadata);
                }
        }
}

export async function registerVclDesignMetadata(registry: TDesignRegistry): Promise<void> {
        for (const load of vclDesignMetadata) {
                const module = await load();
                registry.register(module.designMetadata);
        }
}

export async function initializeDesignRegistry(registry: TDesignRegistry, paletteNames: readonly string[]): Promise<void> {
        registry.clear();

        await registerVclDesignMetadata(registry);
        await registerDesignPalettes(registry, paletteNames);
}
