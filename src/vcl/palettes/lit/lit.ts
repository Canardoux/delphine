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

import { LitElement, html } from 'lit';
import { TControl, TMetaControl } from '../../Control';

// --------------------------------------

export class TLitComponent extends TControl {}

export class TLitMetaComponent extends TMetaControl {
        static metaclass = new TLitMetaComponent(TMetaControl.metaclass, 'TLitMetaComponent');
}

// --------------------------------------

export abstract class TLitControlElement extends LitElement {
        delphineControl?: TControl;
}

//export abstract class TLitMetaControl extends TLitMetaComponent {
//      }
