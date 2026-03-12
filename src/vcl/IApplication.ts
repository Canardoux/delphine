// IApplication.ts
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

import { TMetaclass } from './Oops';
import type { IControl, IMetaControl } from './IControl';

export interface IApplication {
        run(): void;
        getClass(type: string): IMetaControl | undefined;
}

//export const TheApplication: IApplication | null = null;

let _application: IApplication | null = null;

export function getApplication(): IApplication | null {
        return _application;
}

export function setApplication(app: IApplication): void {
        _application = app;
}
