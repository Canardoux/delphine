// StdCtrls.ts

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

import { TControl, TMetaControl } from './Base';
import { TMetaContainer, TContainer } from './Container';
import type { PropSpec } from './Component';
import type { IForm } from './IForm';
import type { IControl } from './IControl';
//import { TForm } from './Form';

export class TButton extends TControl {
        getMetaclass() {
                return TMetaControl.metaclass;
        }

        htmlButton(): HTMLButtonElement {
                return this.htmlElement! as HTMLButtonElement;
        }

        //_caption: string = '';
        //_enabled: boolean = true;
        /*
        protected get bprops(): ButtonProps {
                return this.props as ButtonProps;
        }
                */

        get caption(): string {
                //return this._caption;
                return (this.props.caption as string) ?? 'Caption';
        }
        set caption(caption: string) {
                //this._caption = caption;
                this.props.caption = caption;
                const el = this.htmlElement;
                if (!el) return;
                el.textContent = this.caption;
        }

        get enabled(): boolean {
                //return this._enabled ?? true;
                return (this.props.enabled as boolean) ?? true;
        }
        set enabled(enabled) {
                //this._enabled = enabled;
                this.props.enabled = enabled;
                this.htmlButton().disabled = !enabled;
        }

        constructor(name: string, form: IForm, parent: TControl) {
                super(name, form, parent);
        }
        syncDomFromProps() {
                const el = this.htmlElement;
                if (!el) return;

                el.textContent = this.caption;
                this.htmlButton().disabled = !this.enabled;
                super.syncDomFromProps();
        }
}

export class TMetaButton<T extends TButton> extends TMetaControl {
        static readonly metaclass = new TMetaButton(TMetaControl.metaclass, 'TButton');

        protected constructor(superClass: TMetaControl, name: string) {
                super(superClass, name);
                // et vous changez juste le nom :
        }
        getMetaclass() {
                return TMetaButton.metaclass;
        }

        create(name: string, form: IForm, parent: TControl) {
                return new TButton(name, form, parent) as T;
        }

        defProps(): PropSpec<any>[] {
                return [
                        {
                                name: 'caption',
                                kind: 'string',
                                retrieve: (o) => {
                                        return o.caption;
                                },
                                apply: (o, v) => (o.caption = String(v))
                        },
                        {
                                name: 'enabled',
                                kind: 'boolean',
                                retrieve: (o) => {
                                        return o.enabled;
                                },
                                apply: (o, v) => (o.enabled = Boolean(v))
                        }
                ];
        }
}

// This class does not do anything useful
// --------------------------------------

export class TPanel extends TContainer {
        getMetaclass(): TMetaPanel {
                return TMetaPanel.metaclass;
        }

        //protected get pprops(): PanelProps {
        //return this.props as PanelProps;
        //}

        constructor(name: string, form: IForm | null, parent: TControl | null) {
                super(name, form, parent);
        }
        syncDomFromProps() {
                const el = this.htmlElement;
                if (!el) return;

                super.syncDomFromProps();
        }
        //toto = 12;
}

export class TMetaPanel extends TMetaContainer {
        static readonly metaclass = new TMetaPanel(TMetaContainer.metaclass, 'TPanel');

        protected constructor(superClass: TMetaContainer, name: string) {
                super(superClass, name);
                // et vous changez juste le nom :
        }
        getMetaclass(): TMetaPanel {
                return TMetaPanel.metaclass;
        }

        create(name: string, form: IForm, parent: TControl): TPanel {
                return new TPanel(name, form, parent);
        }

        defProps(): PropSpec<any>[] {
                return [
                        //{ name: 'caption', kind: 'string', apply: (o, v) => (o.caption = String(v)) },
                        //{ name: 'enabled', kind: 'boolean', apply: (o, v) => (o.enabled = Boolean(v)) }
                ];
        }
}

export class TSimpleDCC extends TControl {
        getMetaclass() {
                return TMetaSimpleDCC.metaclass;
        }

        constructor(name: string, form: IForm, parent: TControl) {
                super(name, form, parent);
        }

        /*
        protected get dccprops(): SimpleDCCProps {
                return this.props as SimpleDCCProps;
        }
                */
}

export class TMetaSimpleDCC extends TMetaControl {
        static readonly metaclass: TMetaSimpleDCC = new TMetaSimpleDCC(TMetaControl.metaclass, 'TSimpleDCC');

        protected constructor(superClass: TMetaControl, name: string) {
                super(superClass, name);
                // et vous changez juste le nom :
        }
        getMetaclass(): TMetaSimpleDCC {
                return TMetaSimpleDCC.metaclass;
        }

        create(name: string, form: IForm, parent: TControl) {
                return new TSimpleDCC(name, form, parent);
        }

        defProps(): PropSpec<any>[] {
                return [
                        //{ name: 'caption', kind: 'string', apply: (o, v) => (o.caption = String(v)) },
                        //{ name: 'enabled', kind: 'boolean', apply: (o, v) => (o.enabled = Boolean(v)) }
                ];
        }
}

/*
export type CompositeDCCProps = ComponentProps & {
        //caption?: string;
        //enabled?: boolean;
        //color?: TColor; // ou TColor, etc.
};
*/

// Note: this class does not do anything. Perhaps that DCC can herit directly from TContainer or TPanel
// TContainer or TPanel ? Actually this is not clear. Those two class do not do anything useful abof TComponent
export class TCompositeDCC extends TContainer {
        getMetaclass() {
                return TMetaCompositeDCC.metaclass;
        }

        constructor(name: string, form: IForm, parent: TControl) {
                super(name, form, parent);
        }
        /*
        protected get dccprops(): CompositeDCCProps {
                return this.props as CompositeDCCProps;
        }
                */
}

export class TMetaCompositeDCC extends TMetaContainer {
        static readonly metaclass: TMetaCompositeDCC = new TMetaCompositeDCC(TMetaContainer.metaclass, 'TCompositDCC');

        protected constructor(superClass: TMetaContainer, name: string) {
                super(superClass, name);
                // et vous changez juste le nom :
        }
        getMetaclass(): TMetaCompositeDCC {
                return TMetaCompositeDCC.metaclass;
        }

        create(name: string, form: IForm, parent: TControl) {
                return new TCompositeDCC(name, form, parent);
        }

        defProps(): PropSpec<any>[] {
                return [
                        //{ name: 'caption', kind: 'string', apply: (o, v) => (o.caption = String(v)) },
                        //{ name: 'enabled', kind: 'boolean', apply: (o, v) => (o.enabled = Boolean(v)) }
                ];
        }
}
