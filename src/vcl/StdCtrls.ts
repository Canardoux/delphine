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
import { TMetaComponent } from './Component';
import { TMetaContainer, TContainer } from './Container';
import type { PropSpec } from './IComponent';
import type { ComponentSchema } from './IComponent';
import type { IForm } from './IForm';
import type { IControl } from './IControl';
import type { TMetaclass } from './Oops';
import { TCompositeControl, TMetaCompositeControl } from './CompositeControl';
import { TComponent } from './Component';
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

                                        applyToModel: (model, value) => {}
                                }
                        }
                ];
        }

        getSchema(): ComponentSchema | null {
                return {
                        name: this.typeName,
                        label: 'TButton',
                        category: 'Standard Control',
                        icon: '🔘',
                        //icon: `<svg viewBox="0 0 24 24" width="22" height="22"><rect x="4" y="8" width="16" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,

                        component: this,
                        isContainer: false,
                        instanceName: 'Button',
                        tagName: 'button',
                        resizable: true,

                        //draggable: true,
                        droppable: false,
                        //copyable: true,

                        props: this.propSpecsToSchemaProps()
                };
        }
}

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

        getSchema(): ComponentSchema | null {
                return {
                        name: this.typeName,
                        label: 'TPanel',
                        category: 'Standard Control',
                        icon: '▭',
                        component: TMetaPanel.metaclass,
                        isContainer: true,
                        instanceName: 'Panel',
                        tagName: 'div',
                        resizable: true,

                        //hoverable: true,
                        //layerable: true,
                        //removable: true,
                        //draggable: true,
                        droppable: true,
                        //copyable: true,

                        props: this.propSpecsToSchemaProps()
                };
        }
}

// --------------------------------------

export class TNonVisualComponents extends TContainer {
        constructor(name: string, form: IForm, parent: TControl) {
                super(TMetaNonVisualComponents.metaclass, name, form, parent);
        }
}

export class TMetaNonVisualComponents extends TMetaContainer {
        static readonly metaclass = new TMetaNonVisualComponents(TMetaContainer.metaclass, 'TNonVisualComponents');

        protected constructor(superClass: TMetaContainer, name: string) {
                super(superClass, name);
        }

        create(name: string, form: IForm, parent: TControl): TContainer {
                return new TNonVisualComponents(name, form, parent);
        }

        defProps(): PropSpec<any>[] {
                return [
                        //{ name: 'caption', kind: 'string', apply: (o, v) => (o.caption = String(v)) },
                        //{ name: 'enabled', kind: 'boolean', apply: (o, v) => (o.enabled = Boolean(v)) }
                ];
        }

        /*
        getSchema(): ComponentSchema | null {
                return {
                        name: this.typeName,
                        label: 'TPanel',
                        category: 'Standard Control',
                        icon: '▭',
                        component: TMetaPanel.metaclass,
                        isContainer: true,
                        instanceName: 'Panel',
                        tagName: 'div',
                        resizable: true,

                        //hoverable: true,
                        //layerable: true,
                        //removable: true,
                        //draggable: true,
                        droppable: true,
                        //copyable: true,

                        props: this.propSpecsToSchemaProps()
                };
        }
                */
}

// --------------------------------------

export class TPopupMenu extends TComponent {
        constructor(name: string, form: IForm, parent: TControl) {
                super(TMetaPopupMenu.metaclass, name, form, parent);
        }
}

export class TMetaPopupMenu extends TMetaComponent {
        static readonly metaclass = new TMetaPopupMenu(TMetaComponent.metaclass, 'TPopupMenu');

        protected constructor(superClass: TMetaComponent, name: string) {
                super(superClass, name);
        }

        create(name: string, form: IForm, parent: TControl): TPopupMenu {
                return new TPopupMenu(name, form, parent);
        }

        defProps(): PropSpec<any>[] {
                return [
                        //{ name: 'caption', kind: 'string', apply: (o, v) => (o.caption = String(v)) },
                        //{ name: 'enabled', kind: 'boolean', apply: (o, v) => (o.enabled = Boolean(v)) }
                ];
        }

        getSchema(): ComponentSchema | null {
                return {
                        name: this.typeName,
                        label: 'TPopupMenu',
                        category: 'Standard Control',
                        icon: 'X',
                        component: TMetaPopupMenu.metaclass,
                        isContainer: false,
                        instanceName: 'PopupMenu',
                        tagName: 'div',
                        resizable: false,

                        //hoverable: true,
                        //layerable: true,
                        //removable: true,
                        //draggable: true,
                        droppable: false,
                        //copyable: true,

                        props: this.propSpecsToSchemaProps()
                };
        }
}

// ------------------------------------------

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

        getSchema(): ComponentSchema | null {
                return {
                        name: this.typeName,
                        label: 'TLabel',
                        category: 'Standard Control',
                        icon: '🏷️',
                        component: this,
                        isContainer: false,
                        instanceName: 'Label',
                        tagName: 'label',
                        resizable: false,
                        droppable: false,

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
                //return this.props.caption() ?? 'Caption';
        }

        //captionElement(): HTMLSpanElement {
        //        return this.htmlElement!.querySelector('[data-delphine-part="caption"]') as HTMLSpanElement;
        //}

        /*
        set caption(caption: string) {
                this.props.caption = caption;

                const el = this.elem;
                if (!el) return;

                //el.textContent = caption;
        }
                */

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

        private findPart(model: any, partName: string): any | undefined {
                const components = model.components?.();
                if (!components) return undefined;

                return components.models.find((child: any) => {
                        const attrs = child.getAttributes?.() ?? {};
                        return attrs['data-delphine-part'] === partName;
                });
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
                                                const captionPart = this.findPart(model, 'caption');

                                                if (captionPart) {
                                                        captionPart.components(String(value ?? ''));
                                                }

                                                const inputPart = this.findPart(model, 'chkBox');

                                                if (!inputPart) return;

                                                const checked = Boolean(value);

                                                // 🔥 DOM

                                                inputPart.setAttributes({
                                                        ...inputPart.getAttributes(),

                                                        checked: checked ? 'checked' : undefined
                                                });

                                                // 🔥 IMPORTANT : forcer aussi la propriété DOM

                                                const view = inputPart.view;

                                                const el = view?.el as HTMLInputElement | undefined;

                                                if (el) {
                                                        el.checked = checked;
                                                }

                                                const attrs = { ...(model.getAttributes?.() ?? {}) };
                                                attrs['data-delphine-checked'] = String(checked);
                                                attrs['data-delphine-caption'] = String(value ?? '');
                                                model.setAttributes(attrs);
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
                                                const inputPart = this.findPart(model, 'chkBox');
                                                if (!inputPart) return;

                                                const attrs = { ...(inputPart.getAttributes?.() ?? {}) };

                                                if (Boolean(value)) {
                                                        delete attrs.disabled;
                                                } else {
                                                        attrs.disabled = 'disabled';
                                                }

                                                inputPart.setAttributes(attrs);

                                                const rootAttrs = { ...(model.getAttributes?.() ?? {}) };
                                                rootAttrs['data-delphine-enabled'] = String(Boolean(value));
                                                model.setAttributes(rootAttrs);
                                        }
                                }
                        },

                        {
                                name: 'checked',
                                kind: 'boolean',
                                default: false,
                                retrieve: (o) => {
                                        return o.checked;
                                },
                                apply: (o, v) => (o.checked = Boolean(v)),

                                grapes: {
                                        traitType: 'checkbox',
                                        label: 'Checked',

                                        applyToModel: (model, value) => {
                                                const inputPart = this.findPart(model, 'chkBox');
                                                if (!inputPart) return;
                                                const checked = Boolean(value);

                                                const attrs = { ...(inputPart.getAttributes?.() ?? {}) };

                                                if (checked) {
                                                        attrs.checked = 'checked';
                                                } else {
                                                        delete attrs.checked;
                                                }

                                                inputPart.setAttributes(attrs);
                                                const el = inputPart.view?.el as HTMLInputElement | undefined;

                                                if (el) {
                                                        el.checked = checked;
                                                }

                                                const rootAttrs = { ...(model.getAttributes?.() ?? {}) };
                                                rootAttrs['data-delphine-checked'] = String(checked);
                                                model.setAttributes(rootAttrs);
                                        }
                                }
                        }
                ];
        }

        getSchema(): ComponentSchema | null {
                return {
                        name: this.typeName,
                        label: 'TCheckBox',
                        category: 'Standard Control',
                        icon: '☑️',
                        component: this,
                        isContainer: false,
                        instanceName: 'CheckBox',
                        tagName: 'label',
                        resizable: false,
                        //type: 'Delphine-TCheckBox',
                        //draggable: true,

                        //selectable: true,
                        //draggable: true,
                        droppable: false,
                        //copyable: true,
                        //removable: true,
                        //editable: false,
                        //hoverable: true,
                        //layerable: true,

                        attributes: {
                                'data-delphine-component': this.typeName,

                                'data-delphine-name': this.typeName
                        },
                        //droppable: false,
                        //selectable: true,
                        components: [
                                {
                                        name: 'chkBox',

                                        tagName: 'input',

                                        attributes: {
                                                type: 'checkbox',

                                                'data-delphine-part': 'chkBox'
                                        },

                                        layerable: false,

                                        selectable: false,

                                        draggable: false,

                                        droppable: false,

                                        //name: 'chkBox',
                                        //category: null,
                                        //type: 'default',
                                        category: 'null',

                                        label: 'CheckBox',

                                        //tagName: 'input',

                                        component: null,

                                        instanceName: 'chkBox',

                                        props: {},

                                        //attributes: {
                                        //       type: 'checkbox',
                                        //       'data-delphine-part': 'chkBox'
                                        //},

                                        //selectable: false,

                                        //draggable: false,

                                        //droppable: false,

                                        //resizable: false,

                                        //name: 'chkBox',
                                        //tagName: 'input',
                                        //attributes: {
                                        //type: 'checkbox',
                                        //data-delphine-part': 'chkBox'
                                        //},

                                        //selectable: false,
                                        //draggable: false,
                                        //droppable: false,
                                        //copyable: false,
                                        //removable: false,
                                        //editable: false,
                                        //hoverable: false,
                                        //layerable: false,

                                        resizable: false
                                },

                                {
                                        name: 'caption',

                                        tagName: 'span',

                                        component: null,

                                        attributes: {
                                                'data-delphine-part': 'caption'
                                        },
                                        textContent: 'Caption',

                                        //components: null
                                        /*[
                                                {
                                                        type: 'textnode',
                                                        content: 'Caption'
                                                }
                                        ],*/

                                        layerable: false,

                                        selectable: false,

                                        draggable: false,

                                        droppable: false,
                                        //name: 'caption',
                                        //category: null,

                                        label: 'Caption',
                                        category: 'null',
                                        //type: 'default',

                                        //tagName: 'span',

                                        //component: null,

                                        instanceName: 'caption',

                                        props: {},
                                        //attributes: {
                                        //'data-delphine-part': 'caption'
                                        //},
                                        //components: ['Caption'],
                                        //selectable: false,

                                        //draggable: false,

                                        //droppable: false,

                                        //resizable: false,
                                        //name: 'chkBox',
                                        //tagName: 'input',
                                        //attributes: {
                                        //        type: 'checkbox',
                                        //        'data-delphine-part': 'chkBox'
                                        //},

                                        //selectable: false,
                                        //draggable: false,
                                        //droppable: false,
                                        //copyable: false,
                                        //removable: false,
                                        //editable: false,
                                        //hoverable: false,
                                        //layerable: false,

                                        resizable: false

                                        //components: []
                                }
                        ],

                        //attributes: {
                        //'data-delphine-component': 'TCheckBox'
                        //},

                        props: this.propSpecsToSchemaProps()
                };
        }
}
