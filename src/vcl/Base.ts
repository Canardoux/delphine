// Base.ts
// -------

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

//import { TForm } from './Form';
import { TMetaclass, TObject, TMetaObject } from './Oops';
//import { TComponentRegistry } from './ComponentRegistry';
import type { IForm } from './IForm';
import type { IControl, IMetaControl } from './IControl';
import { TComponent, TMetaComponent } from './Component';
import type { PropSpec } from './Component';

export class TColor {
        s: string;

        constructor(s: string) {
                this.s = s;
        }
        /* factory */ static rgb(r: number, g: number, b: number): TColor {
                return new TColor(`rgb(${r}, ${g}, ${b})`);
        }
        /* factory */ static rgba(r: number, g: number, b: number, a: number): TColor {
                return new TColor(`rgba(${r}, ${g}, ${b}, ${a})`);
        }
}

export class THandler {
        s: string;

        constructor(s: string) {
                this.s = s;
        }
        fire(form: IForm, handlerName: string, ev: Event, sender: any) {
                const maybeMethod = (form as any)[this.s];
                if (typeof maybeMethod !== 'function') {
                        console.log('NOT A METHOD', handlerName);
                        return false;
                }

                // If sender is missing, fallback to the form itself (safe)
                (maybeMethod as (event: Event, sender: any) => any).call(form, ev, sender ?? this);
        }
}

// --------------------------------------

export class TControl extends TComponent implements IControl {
        getMetaclass() {
                return TMetaControl.metaclass;
        }

        readonly name: string;
        readonly parent: TControl | null = null;

        form: IForm | null = null;
        children: TControl[] = [];

        elem: Element | null = null;
        get htmlElement(): HTMLElement | null {
                return this.elem as HTMLElement | null;
        }
        constructor(name: string, form: IForm | null, parent: TControl | null) {
                super(name, form, parent);
                this.name = name;
                this.parent = parent;
                parent?.children.push(this); // Could be done in buildComponentTree()
                this.form = form;

                // IMPORTANT: Initialize props at runtime (declare would not do it).
                //this.props = {};
        }

        // NOTE: This is runtime data, so it must be initialized (no "declare").
        //props: ComponentProps;

        /** May contain child components */
        //_onclick: THandler = new THandler('');
        allowsChildren(): boolean {
                return false;
        }

        get color(): TColor {
                return new TColor(this.getHtmlStyleProp('color'));
        }

        set color(color) {
                this.setHtmlStyleProp('color', color.s);
        }

        get onclick(): THandler {
                const handler = this.props.onclick as THandler;
                return handler ?? new THandler('');
        }

        set onclick(handler) {
                this.props.onclick = handler;
        }

        syncDomFromProps() {
                const el = this.htmlElement;
                if (!el) return;
        }

        get backgroundColor(): TColor {
                return new TColor(this.getHtmlStyleProp('background-color'));
        }
        set backgroundColor(v: TColor) {
                this.setHtmlStyleProp('background-color', v.s);
        }

        get width(): string {
                return this.getHtmlProp('width') ?? '';
        }
        set width(v: string) {
                this.setHtmlProp('width', v);
        }

        get height(): string {
                return this.getHtmlProp('height') ?? '';
        }
        set height(v: string) {
                this.setHtmlProp('height', v);
        }

        get offsetWidth(): number {
                return this.htmlElement!.offsetWidth;
        }
        get offsetHeight(): number {
                return this.htmlElement!.offsetHeight;
        }

        setHtmlStyleProp(name: string, value: string) {
                this.htmlElement!.style.setProperty(name, value);
        }

        getHtmlStyleProp(name: string) {
                return this.htmlElement!.style.getPropertyValue(name);
        }

        setHtmlProp(name: string, value: string) {
                this.htmlElement!.setAttribute(name, value);
        }

        getHtmlProp(name: string) {
                return this!.htmlElement!.getAttribute(name);
        }
}

export class TMetaControl extends TMetaComponent implements IMetaControl {
        static readonly metaclass = new TMetaControl(TMetaComponent.metaclass, 'TComponent');
        // The symbolic name used in HTML: data-delphine-component="TButton" or "my-button"
        protected constructor(superClass: TMetaComponent, name: string) {
                super(superClass, name);
        }

        getMetaclass() {
                return TMetaComponent.metaclass;
        }

        isAForm(): boolean {
                return false;
        }

        // Create the runtime instance and attach it to the DOM element.
        create(name: string, form: IForm, parent: TControl): TControl {
                return new TControl(name, form, parent);
        }

        defProps(): PropSpec<any>[] {
                return [
                        //{ name: 'color', kind: 'color', apply: (o, v) => (o.color = new TColor(String(v))) },
                        {
                                name: 'onclick',
                                kind: 'handler',
                                retrieve: (o) => {
                                        return o.onclick;
                                },
                                //apply: (o, v) => (o.onclick = new THandler(String(v)))
                                apply: (o, v) => (o.onclick = v as THandler)
                        }
                        //{ name: 'oncreate', kind: 'handler', apply: (o, v) => (o.oncreate = new THandler(String(v))) }
                ];
        }

        domEvents?(): string[]; // default [];
}
