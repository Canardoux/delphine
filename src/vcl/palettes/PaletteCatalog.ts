// vcl/Palettes/PaletteCatalog.ts

import type { PaletteDefinition } from './PaletteDefinition';

export const paletteLoaders: Readonly<Record<string, () => Promise<PaletteDefinition>>> = {
        standard: async () => (await import('./standard/standardPalette')).standardPalette,

        additional: async () => (await import('./additional/additionalPalette')).additionalPalette
};

export const availablePaletteNames = Object.freeze(Object.keys(paletteLoaders));

export async function loadPalette(paletteName: string): Promise<PaletteDefinition> {
        const loader = paletteLoaders[paletteName];

        if (!loader) {
                throw new Error(`Unknown Delphine palette: "${paletteName}".`);
        }

        return loader();
}
