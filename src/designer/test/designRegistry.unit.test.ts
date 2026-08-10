import { describe, expect, it } from 'vitest';

import { TDesignRegistry, registerDesignPalettes, registerVclDesignMetadata, initializeDesignRegistry } from '../core/metadata';

describe('TDesignRegistry', () => {
        it('registers the standard palette', async () => {
                const registry = new TDesignRegistry();

                await initializeDesignRegistry(registry, ['standard']);

                const button = registry.findByTag('lit-button');

                expect(button).toBeDefined();
                expect(button?.type).toBe('TButton');

                const panel = registry.findByTag('lit-panel');

                expect(panel).toBeDefined();
                expect(panel?.type).toBe('TPanel');
        });

        it('resolves inherited metadata', async () => {
                const registry = new TDesignRegistry();

                await registerVclDesignMetadata(registry);
                await registerDesignPalettes(registry, ['standard']);

                const button = registry.getResolvedMetadata('TButton');

                expect(button.properties.map((property) => property.name)).toEqual(['left', 'top', 'width', 'height', 'caption', 'enabled']);
        });
});
