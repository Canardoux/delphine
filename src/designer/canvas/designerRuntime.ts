// src/designer/canvas/designerRuntime.ts

import { registerRuntimePalettes } from '../../vcl/palettes/registerRuntimePalette';
import type { DelphineFrameConfig } from '../../extension/config/DelphineAppConfig';

declare global {
        interface Window {
                __delphineRegisterRuntimePalettes?: (paletteNames: readonly string[]) => Promise<void>;

                __delphineRegisterRuntimeFrames?: (frames: readonly DelphineFrameConfig[]) => Promise<void>;
        }
}

window.__delphineRegisterRuntimePalettes = registerRuntimePalettes;

window.__delphineRegisterRuntimeFrames = async (frames) => {
        console.log('[Delphine Canvas] registerRuntimeFrames CALLED', frames);

        for (const frame of frames) {
                console.log('[Delphine Canvas] loading frame', frame.className, frame.tagName, frame.url);

                const mod = await import(
                        /* @vite-ignore */
                        frame.url
                );

                console.log('[Delphine Canvas] module loaded', frame.className, mod);

                if (typeof mod.registerFrame !== 'function') {
                        throw new Error(`Frame "${frame.name}" does not export registerFrame().`);
                }

                mod.registerFrame();

                console.log('[Delphine Canvas] frame registered', frame.tagName, customElements.get(frame.tagName));
        }
};

console.log('[Delphine Canvas] Runtime bootstrap loaded.');

export {};
