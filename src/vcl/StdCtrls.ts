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

import { TControl, TMetaControl } from './Control';
import { TMetaContainer, TContainer } from './Container';
import type { PropSpec } from './IComponent';
import type { ComponentSchema } from './IComponent';
import type { IForm } from './IForm';
import type { IControl } from './IControl';
import type { TMetaclass } from './Oops';
import { TCompositeControl, TMetaCompositeControl } from './CompositeControl';
//import { TForm } from './Form';

export class TButton extends TControl {
        //getMetaclass() {
        //return TMetaControl.metaclass;
        //}

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
                super(TMetaButton.metaclass, name, form, parent);
        }
        /*
        syncDomFromProps() {
                const el = this.htmlElement;
                if (!el) return;

                el.textContent = this.caption;
                this.htmlButton().disabled = !this.enabled;
                super.syncDomFromProps();
        }
                */
}

export class TMetaButton<T extends TButton> extends TMetaControl {
        static metaclass = new TMetaButton(TMetaControl.metaclass, 'TButton');

        protected constructor(superClass: TMetaControl, name: string) {
                super(superClass, name);
        }

        create(name: string, form: IForm, parent: TControl) {
                return new TButton(name, form, parent) as T;
        }

        defProps(): PropSpec<any>[] {
                return [
                        {
                                name: 'caption',
                                kind: 'string',
                                default: 'Caption',
                                retrieve: (o: T) => {
                                        return o.caption;
                                },
                                apply: (o, v) => (o.caption = String(v)),
                                grapes: {
                                        traitType: 'text',

                                        label: 'Caption',

                                        applyToModel: (model: any, value) => {
                                                model.components(String(value ?? 'GLOUPS'));
                                        }
                                }
                        },
                        {
                                name: 'enabled',
                                kind: 'boolean',
                                default: true,
                                retrieve: (o) => {
                                        return o.enabled;
                                },
                                apply: (o, v) => (o.enabled = Boolean(v)),

                                grapes: {
                                        traitType: 'checkbox',

                                        label: 'Enabled',

                                        applyToModel: (model, value) => {
                                                /*
                                                const attrs = { ...(model.getAttributes?.() ?? {}) };

                                                if (Boolean(value)) {
                                                        delete attrs.disabled;
                                                } else {
                                                        attrs.disabled = 'disabled';
                                                }
                                                model.setAttributes(attrs);
                                                */
                                        }
                                }
                        }
                ];
        }

        getSchema(): ComponentSchema {
                return {
                        name: this.typeName,
                        label: 'TButton',
                        category: 'Standard Control',
                        icon: undefined,
                        component: this,
                        isContainer: false,
                        instanceName: 'button',
                        tagName: 'button',
                        resizable: true,

                        props: this.propSpecsToSchemaProps()
                };
        }
}

// This class does not do anything useful
// --------------------------------------

export class TPanel extends TContainer {
        constructor(name: string, form: IForm, parent: TControl) {
                super(TMetaPanel.metaclass, name, form, parent);
        }
}

export class TMetaPanel extends TMetaContainer {
        static readonly metaclass = new TMetaPanel(TMetaContainer.metaclass, 'TPanel');

        protected constructor(superClass: TMetaContainer, name: string) {
                super(superClass, name);
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

        getSchema(): ComponentSchema {
                return {
                        name: this.typeName,
                        label: 'TPanel',
                        category: 'Standard Control',
                        icon: undefined,
                        component: TMetaPanel.metaclass,
                        isContainer: true,
                        instanceName: 'panel',
                        tagName: 'div',
                        resizable: true,

                        props: this.propSpecsToSchemaProps()
                };
        }
}

export class TLabel extends TControl {
        htmlButton(): HTMLButtonElement {
                return this.htmlElement! as HTMLButtonElement;
        }

        get caption(): string {
                return (this.props.caption as string) ?? 'Caption';
        }
        set caption(caption: string) {
                this.props.caption = caption;
                const el = this.htmlElement;
                if (!el) return;
                el.textContent = this.caption;
        }

        get enabled(): boolean {
                return (this.props.enabled as boolean) ?? true;
        }
        set enabled(enabled) {
                this.props.enabled = enabled;
                this.htmlButton().disabled = !enabled;
        }

        constructor(name: string, form: IForm, parent: TControl) {
                super(TMetaLabel.metaclass, name, form, parent);
        }
}

export class TMetaLabel<T extends TLabel> extends TMetaControl {
        static metaclass = new TMetaLabel(TMetaControl.metaclass, 'TLabel');

        protected constructor(superClass: TMetaControl, name: string) {
                super(superClass, name);
        }

        create(name: string, form: IForm, parent: TControl) {
                return new TLabel(name, form, parent) as T;
        }

        defProps(): PropSpec<any>[] {
                return [
                        {
                                name: 'caption',
                                kind: 'string',
                                default: 'Caption',
                                retrieve: (o: T) => {
                                        return o.caption;
                                },
                                apply: (o, v) => (o.caption = String(v)),
                                grapes: {
                                        traitType: 'text',
                                        label: 'Caption',
                                        applyToModel: (model: any, value) => {
                                                model.components(String(value ?? 'GLOUPS'));
                                        }
                                }
                        },
                        {
                                name: 'enabled',
                                kind: 'boolean',
                                default: true,
                                retrieve: (o) => {
                                        return o.enabled;
                                },
                                apply: (o, v) => (o.enabled = Boolean(v)),

                                grapes: {
                                        traitType: 'checkbox',
                                        label: 'Enabled',
                                        applyToModel: (model, value) => {
                                                const attrs = { ...(model.getAttributes?.() ?? {}) };

                                                if (Boolean(value)) {
                                                        delete attrs.disabled;
                                                } else {
                                                        attrs.disabled = 'disabled';
                                                }
                                                model.setAttributes(attrs);
                                        }
                                }
                        }
                ];
        }

        getSchema(): ComponentSchema {
                return {
                        name: this.typeName,
                        label: 'TLabel',
                        category: 'Standard Control',
                        icon: undefined,
                        component: this,
                        isContainer: false,
                        instanceName: 'label',
                        tagName: 'label',
                        resizable: false,

                        props: this.propSpecsToSchemaProps()
                };
        }
}

export class TCheckBox extends TContainer {
        htmlInput(): HTMLInputElement {
                return this.htmlElement!.querySelector('[data-delphine-part="chkBox"]') as HTMLInputElement;
        }

        get caption(): string {
                return (this.props.caption as string) ?? 'Caption';
        }
        captionElement(): HTMLSpanElement {
                return this.htmlElement!.querySelector('[data-delphine-part="caption"]') as HTMLSpanElement;
        }

        set caption(caption: string) {
                this.props.caption = caption;

                const el = this.captionElement();
                if (!el) return;

                el.textContent = caption;
        }

        get enabled(): boolean {
                return (this.props.enabled as boolean) ?? true;
        }
        set enabled(enabled) {
                this.props.enabled = enabled;
                this.htmlInput().disabled = !enabled;
        }
        get checked(): boolean {
                return this.htmlInput().checked;
        }

        set checked(checked: boolean) {
                this.props.checked = checked;

                const input = this.htmlInput();
                if (!input) return;

                input.checked = checked;
        }

        constructor(name: string, form: IForm, parent: TControl) {
                super(TMetaCheckBox.metaclass, name, form, parent);
        }
}

export class TMetaCheckBox<T extends TCheckBox> extends TMetaContainer {
        static metaclass = new TMetaCheckBox(TMetaContainer.metaclass, 'TCheckBox');

        protected constructor(superClass: TMetaContainer, name: string) {
                super(superClass, name);
        }

        create(name: string, form: IForm, parent: TControl) {
                return new TCheckBox(name, form, parent) as T;
        }

        defProps(): PropSpec<any>[] {
                return [
                        {
                                name: 'caption',
                                kind: 'string',
                                default: 'Caption',
                                retrieve: (o: T) => {
                                        return o.caption;
                                },
                                apply: (o, v) => (o.caption = String(v)),
                                grapes: {
                                        traitType: 'text',
                                        label: 'Caption',
                                        applyToModel: (model: any, value) => {
                                                model.components(String(value ?? 'GLOUPS'));
                                        }
                                }
                        },
                        {
                                name: 'enabled',
                                kind: 'boolean',
                                default: true,
                                retrieve: (o) => {
                                        return o.enabled;
                                },
                                apply: (o, v) => (o.enabled = Boolean(v)),

                                grapes: {
                                        traitType: 'checkbox',
                                        label: 'Enabled',
                                        applyToModel: (model, value) => {
                                                const attrs = { ...(model.getAttributes?.() ?? {}) };

                                                if (Boolean(value)) {
                                                        delete attrs.disabled;
                                                } else {
                                                        attrs.disabled = 'disabled';
                                                }
                                                model.setAttributes(attrs);
                                        }
                                }
                        },
                        {
                                name: 'checked',
                                kind: 'boolean',
                                default: true,
                                retrieve: (o) => {
                                        return o.checked;
                                },
                                apply: (o, v) => (o.checked = Boolean(v)),

                                grapes: {
                                        traitType: 'checkbox',
                                        label: 'Checked',
                                        applyToModel: (model, value) => {
                                                const attrs = { ...(model.getAttributes?.() ?? {}) };

                                                if (Boolean(value)) {
                                                        attrs.checked = 'checked';
                                                } else {
                                                        delete attrs.checked;
                                                }
                                                model.setAttributes(attrs);
                                        }
                                }
                        }
                ];
        }

        getSchema(): ComponentSchema {
                return {
                        name: this.typeName,
                        label: 'TCheckBox',
                        category: 'Standard Control',
                        icon: undefined,
                        component: this,
                        isContainer: false,
                        instanceName: 'checkBox',
                        tagName: 'span',
                        resizable: true,
                        draggable: true,

                        droppable: false,
                        selectable: true,
                        components: [
                                {
                                        name: 'chkBox',
                                        //category: null,

                                        label: 'CheckBox',

                                        tagName: 'input',

                                        component: null,

                                        instanceName: 'chkBox',

                                        props: {},

                                        //attributes: {
                                        //        type: 'checkbox',

                                        //        'data-delphine-part': 'chkBox'
                                        //},

                                        selectable: false,

                                        draggable: false,

                                        droppable: false,

                                        resizable: false
                                },

                                {
                                        name: 'caption',
                                        //category: null,

                                        label: 'Caption',

                                        tagName: 'span',

                                        component: null,

                                        instanceName: 'caption',

                                        props: {},

                                        //attributes: {
                                        //        'data-delphine-part': 'caption'
                                        //},

                                        selectable: false,

                                        draggable: false,

                                        droppable: false,

                                        resizable: false

                                        //components: ['Caption']
                                }
                        ],

                        //attributes: {
                        //'data-delphine-component': 'TCheckBox'
                        //},

                        props: this.propSpecsToSchemaProps()
                };
        }
}
