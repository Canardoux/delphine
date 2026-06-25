// TypeRegistry.ts
// ---------------

/*
 * Copyright 2026 Canardoux.
 *
 * This file is part of the Delphine project.
 *
 * Delphine is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 (GPL3), as published by
 * the Free Software Foundation.
 *
 * Delphine is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Delphine.  If not, see <https://www.gnu.org/licenses/>.
 */

import { TMetaObject, TObject } from './Oops';
import { TMetaComponent } from './Component';
import { getApplication } from './IApplication';
import { TApplication } from './Application';
import type { IComponent, IMetaComponent } from './IComponent';
import type { ComponentSchema } from './IComponent';
import type { TForm } from './Form';
import { register } from './palettes/standard/standardPalette';
import { TMetaControl } from './Control';

export const allPalettes = ['standard', 'lit' /*, 'additional', 'menus'*/];

export class TTypeRegistry /*extends TObject*/ {
        // We store heterogeneous metas, so we keep them as TMetaComponent<any>.
        //getMetaclass(): TMetaComponentTypeRegistry {
        //return TMetaComponentTypeRegistry.metaclass;
        //}
        private readonly componentsClass = new Map<string, TMetaComponent>();

        getAll(): IMetaComponent[] {
                return [...this.componentsClass.values()];
        }

        register(mc: TMetaComponent) {
                if (this.componentsClass.has(mc.typeName)) {
                        throw new Error(`Component type already registered: ${mc.typeName}`);
                }
                console.log('[Delphine] register mc =', mc.typeName);
                this.componentsClass.set(mc.typeName, mc);
        }

        // If you just need "something meta", return any-meta.
        get(typeName: string) {
                return this.componentsClass.get(typeName);
        }

        has(typeName: string): boolean {
                return this.componentsClass.has(typeName);
        }

        list(): string[] {
                return [...this.componentsClass.keys()].sort();
        }
}

//import type { TTypeRegistry } from '../TTypeRegistry';

type PaletteModule = {
        register: (typeRegistry: TTypeRegistry) => void | Promise<void>;
};

const paletteLoaders: Record<string, () => Promise<PaletteModule>> = {
        standard: () => import('./palettes/standard/standardPalette'),
        lit: () => import('./palettes/lit/litPalette')
        // additional: () => import('./palettes/additional/additionalPalette'),
        // menus: () => import('./palettes/menus/menusPalette'),
};

// export async function registerFrames(typeRegistry: TTypeRegistry, frames: { tagName: string; className: string }[]) {
//         for (const frame of frames) {
//                 //const loaded = await this.loadDformUnit(`/src/frames`, frame.className);
//                 //this.registerLoadedUnit(frame.tagName, loaded);
//                 //const palette = await loader();
//                 //console.log('[Delphine] registerPalettes BEGIN', paletteName);
//                 //await palette.register(typeRegistry);
//                 //console.log('[Delphine] registerPalettes END', paletteName, typeRegistry);
//                                         //const loaded = await this.loadDformUnit(`/src/frames`, frame.className);
//                                         this.registerLoadedUnit(frame.tagName, loaded);
//                                         typeRegistry?.register(loaded.metaclass as TMetaControl);
//         }
// }

export async function registerPalettes(typeRegistry: TTypeRegistry, enabledPalettes: string[]) {
        for (const paletteName of enabledPalettes) {
                const loader = paletteLoaders[paletteName];

                if (!loader) {
                        console.warn(`[Delphine] Unknown palette: ${paletteName}`);
                        continue;
                }

                const palette = await loader();
                console.log('[Delphine] registerPalettes BEGIN', paletteName);
                await palette.register(typeRegistry);
                console.log('[Delphine] registerPalettes END', paletteName, typeRegistry);
                console.log('[Delphine] registered types =', typeRegistry.getAll?.());
        }
}
