// src/designer/canvas/designerRuntime.ts

import { registerRuntimePalettes } from '../../vcl/palettes/registerRuntimePalette';

declare global {
        interface Window {
                __delphineRegisterRuntimePalettes?: (paletteNames: readonly string[]) => Promise<void>;
        }
}

window.__delphineRegisterRuntimePalettes = registerRuntimePalettes;

console.log('[Delphine Canvas] Runtime bootstrap loaded.');

export {};
