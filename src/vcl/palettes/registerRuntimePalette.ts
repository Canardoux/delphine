// vcl/palettes/registerRuntimePalette.ts

//import type { TTypeRegistry } from "../TypeRegistry";
import { loadPalette } from './PaletteCatalog';

export async function registerRuntimePalettes(paletteNames: readonly string[]): Promise<void> {
        console.trace(
                '[Delphine] registerRuntimePalettes CALLED',

                paletteNames
        );
        console.log('[Delphine] Registering runtime palettes', paletteNames);
        for (const paletteName of paletteNames) {
                const palette = await loadPalette(paletteName);

                console.log(`[Delphine] Registering runtime palette "${palette.name}".`);

                for (const component of palette.components) {
                        console.log('[Delphine Canvas] BEFORE component', component.type);
                        const module = await component.loadRuntime();
                        console.log('[Delphine Canvas] module loaded', component.type);

                        await module.registerRuntime();
                        console.log('[Delphine Canvas] registered', component.type);
                }
                console.log('[Delphine Canvas] palette DONE', paletteName);
        }
}
