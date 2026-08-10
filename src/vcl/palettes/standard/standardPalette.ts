// standardPalette.ts.ts

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

import type { PaletteDefinition } from '../PaletteDefinition';

export const standardPalette = {
        name: 'standard',

        components: [
                {
                        type: 'TPanel',

                        loadRuntime: () => import('./TPanel'),
                        loadDesign: () => import('./TPanel.design')
                },
                {
                        type: 'TButton',

                        loadRuntime: () => import('./TButton'),
                        loadDesign: () => import('./TButton.design')
                },
                {
                        type: 'TCheckBox',

                        loadRuntime: () => import('./TCheckBox'),
                        loadDesign: () => import('./TCheckBox.design')
                }
        ]
} as const satisfies PaletteDefinition;
