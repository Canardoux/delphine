// IComponent.ts
// -------------

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

import { TObject, TMetaclass, TMetaObject } from './Oops';
import type { IControl } from './IControl';
import type { PropKind } from './Component';

export interface IComponent {
        isAForm(): boolean;
        //getClass(type: string): IControl | undefined;
}

export interface IMetaComponent {
        create(name: string, form: any, parent: any): any;
        isAForm(): boolean;
}

export type PropSchema = Record<
        string,
        {
                kind: PropKind;

                default?: unknown;
        }
>;

export type ComponentSchema = {
        name: string;
        component: any;
        props?: PropSchema;

        // GrapesJS / designer
        label?: string;
        category?: string;
        icon?: string;

        // Optional default HTML representation
        defaultProps?: Record<string, any>;

        sizeHints?: {
                minWidth?: number;
                minHeight?: number;
                preferredWidth?: number;
                preferredHeight?: number;
        };
};
