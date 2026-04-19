// Application.ts
// --------------

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
import { TForm } from './Form';
import { TTypeRegistry } from './TypeRegistry';
import { registerBuiltins } from './RegisterVcl';
import { getApplication, setApplication } from './IApplication';
import type { IApplication, TLoadedUnit } from './IApplication';
import type { IControl, IMetaControl } from './IControl';
import { TMetaControl } from './Control';
import type { IMetaComponent } from './IComponent';
import { parseDformSource } from './dformSource';

//export TheApplication : TApplication | null = null;

export type TApplicationConfig = {
        mainForm?: string;
        forms?: string[];
        frames?: any[];
};

export class TMetaApplication extends TMetaclass {
        static readonly metaclass: TMetaApplication = new TMetaApplication(TMetaclass.metaclass, 'TApplication');

        protected constructor(superClass: TMetaclass, name: string) {
                super(superClass, name);
        }
        //getMetaclass(): TMetaApplication {
        //return TMetaApplication.metaclass;
        //}
}

export class TApplication implements IApplication {
        typeRegistry: TTypeRegistry | null = null;
        currentForm: TForm | null = null;
        mainForm: TForm | null = null;
        protected appName: string;
        protected appConfig: TApplicationConfig;
        private formStack: TForm[] = [];
        private handlingBrowserPop = false;

        //getMetaclass(): TMetaApplication {
        //return TMetaApplication.metaclass;
        //}
        private forms: Map<string, TForm> = new Map<string, TForm>();
        private loadedUnits = new Map<string, TLoadedUnit>();

        private async loadDformUnit(basePath: string, unitName: string): Promise<TLoadedUnit> {
                const formPath = `${basePath}/${unitName}.dform`;
                const srcPath = `${basePath}/${unitName}.ts`;
                const mod = await import(srcPath);

                if (!mod.delphineMeta) {
                        throw new Error(`Missing delphineMeta export in ${srcPath}`);
                }
                const response = await fetch(formPath);
                if (!response.ok) {
                        throw new Error(`Cannot load ${formPath}`);
                }

                const source = await response.text();
                const parts = parseDformSource(source);

                const loaded: TLoadedUnit = {
                        name: unitName,
                        template: parts.template,
                        style: parts.style,
                        metaclass: mod.delphineMeta as IMetaControl
                        //metaclass: metaclass
                };

                return loaded;
        }

        registerLoadedUnit(name: string, unit: TLoadedUnit): void {
                this.loadedUnits.set(name, unit);
        }

        getLoadedUnit(name: string): TLoadedUnit | undefined {
                return this.loadedUnits.get(name);
        }

        constructor(appName: string, appConfig: TApplicationConfig) {
                debugger;
                this.appName = appName;
                this.appConfig = appConfig;
                setApplication(this);
                this.typeRegistry = new TTypeRegistry();
                registerBuiltins(this.typeRegistry);

                //registerBuiltins(this.types);
        }

        getClass(type: string): IMetaComponent | undefined {
                //if (!this.typeRegistry) {
                //        this.typeRegistry = new TComponentTypeRegistry();
                //        registerBuiltins(this.typeRegistry);
                //}

                return this.typeRegistry?.get(type);
        }

        //getForms(): readonly TForm[] {
        //return this.forms;
        //}

        getFormByName<T extends TForm = TForm>(name: string): T | undefined {
                return this.forms.get(name) as T;
                //return this.forms.find((f) => f.name === name) as T | undefined;
        }

        protected registerForm(form: TForm): void {
                debugger;
                this.forms.set(form.name, form);

                if (!this.mainForm) {
                        this.mainForm = form;
                }
        }

        /*
        // Actually not used
        createForm<T extends TForm>(ctor: new (...args: any[]) => T, name: string, html: string): T {
                debugger;
                const f = new ctor(name);
                f.create(html);

                this.forms.push(f);

                if (!this.mainForm) this.mainForm = f;

                return f;
        }
                */

        async createAndShow(formName: string) {
                let form = this.getFormByName('formName');
                if (!form) {
                        form = await this.createFormByName(formName);
                        // this.registerForm(form);
                }
                //form?.show();
                this.showForm(form);
        }

        destroy(form: TForm | null) {
                if (form) {
                        form?.destroy();
                        this.forms.delete(form!.name);
                }
        }

        async replaceForm(formName: string) {
                const me = this.currentForm;
                //form?.show();
                this.createAndShow(formName);
                this.destroy(me);
                //const previousForm = this.forms.findIndex((element) => element.name == formName);
                //this.forms[previousForm] = undefined;
        }

        /*
        replaceForm(form: TForm): void {
                const old = this.currentForm;

                this.activateForm(form);

                if (old) {
                        old.destroy();
                }
        }
                */

        showForm(form: TForm): void {
                console.log('form.elem =', form.elem);
                console.log('form.elem.parentElement =', form.elem?.parentElement);

                if (!form.elem) {
                        throw new Error(`Form ${form.name} has not been created`);
                }

                if (this.currentForm === form) {
                        return;
                }

                this.currentForm?.hide();
                this.currentForm = form;

                const host = form.elem.parentElement;
                if (!host) {
                        throw new Error(`Form ${form.name} has no host`);
                }

                //host.hidden = false;

                const focusTarget = form.elem.querySelector<HTMLElement>('[autofocus], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])');
                focusTarget?.focus();
                this.activateForm(form);
                //form.onShown();
        }

        pushForm(form: TForm): void {
                if (!form.elem) {
                        throw new Error(`Form ${form.name} not created`);
                }

                if (this.currentForm) {
                        this.currentForm.hide();
                        this.formStack.push(this.currentForm);
                }

                this.activateForm(form);

                if (!this.handlingBrowserPop) {
                        const url = new URL(window.location.href);
                        url.searchParams.set('form', form.name);
                        history.pushState({ form: form.name }, '', url);
                }
        }

        async createAndPushForm(name: string): Promise<void> {
                let form = this.getFormByName(name);

                if (!form) {
                        form = await this.createFormByName(name);
                        // this.registerForm(form);
                }

                this.pushForm(form);
        }

        popForm(): void {
                history.back();
        }

        private performPopForm(): void {
                if (this.formStack.length === 0) {
                        //this.onExitRequested();
                        return;
                }

                const previous = this.formStack.pop()!;
                this.currentForm?.hide();
                this.activateForm(previous);
        }

        popFormDestroy(): void {
                if (this.formStack.length === 0) {
                        // TDODO
                        //this.onExitRequested();
                        return;
                }

                const old = this.currentForm;
                //this.performPopForm();
                this.popForm();
                //const previous = this.formStack.pop()!;

                //this.activateForm(previous);
                this.destroy(old);
                //old?.destroy();
        }

        private activateForm(form: TForm): void {
                if (!form.elem) {
                        throw new Error(`Form ${form.name} not created`);
                }

                const host = form.elem.parentElement;
                if (host) host.hidden = false;

                this.currentForm = form;
                form.onShown();
        }

        showFormByName(formName: string) {
                const form = this.getFormByName(formName);
                if (form) this.showForm(form);
        }

        installBrowserBackHandler(): void {
                window.addEventListener('popstate', (_event) => {
                        this.handlingBrowserPop = true;
                        try {
                                this.performPopForm();
                        } finally {
                                this.handlingBrowserPop = false;
                        }
                });
        }

        // By default we show() the main Form
        // This method can be overriden in a user TApplication
        start() {
                debugger;
                this.runWhenDomReady(() => {
                        this.installBrowserBackHandler();
                        const url = new URL(window.location.href);
                        url.searchParams.set('form', this.mainForm!.name);
                        history.replaceState({ form: this.mainForm!.name }, '', url);
                        this.run();
                        //if (this.mainForm) {
                        //} else {
                        //this.autoStart();
                        //}
                });
        }

        run() {
                this.mainForm?.show();
        }

        // By default, we create a TForm for every Forms declared in app.json.
        // This method can be overriden in a user TApplication
        async initialize(): Promise<void> {
                debugger;
                const frames = this.appConfig.frames ?? [];
                for (const frame of frames) {
                        const loaded = await this.loadDformUnit(`/src/frames`, frame.className);
                        this.registerLoadedUnit(frame.tagName, loaded);
                        this.typeRegistry?.register(loaded.metaclass as TMetaControl);
                }
                const formNames = this.appConfig.forms ?? [];

                for (const formName of formNames) {
                        const form = await this.createFormByName(formName);
                        //this.registerForm(form);
                }

                if (this.appConfig.mainForm) {
                        const main = this.getFormByName(this.appConfig.mainForm);
                        if (main) {
                                this.mainForm = main;
                        }
                }
        }

        /*
        protected autoStart(): void {
                debugger;
                //if (this.forms.length > 0) {
                //        this.mainForm = this.forms[0]!;
                this.mainForm!.show();
                //}
        }
                */

        runWhenDomReady(fn: () => void): void {
                if (document.readyState === 'loading') {
                        window.addEventListener('DOMContentLoaded', fn, { once: true });
                } else {
                        fn();
                }
        }

        extractTemplateFromDform(source: string): string {
                const match = source.match(/<template[^>]*>([\s\S]*?)<\/template>/i);
                return match ? (match[1] ? match[1] : '') : '';
        }

        extractStyleFromDform(source: string): string {
                const match = source.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
                return match ? (match[1] ?? '') : '';
        }

        applyDformStyle(formName: string, cssText: string): void {
                const styleId = `delphine-style-${formName}`;

                let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
                if (!styleEl) {
                        styleEl = document.createElement('style');
                        styleEl.id = styleId;
                        document.head.appendChild(styleEl);
                }

                styleEl.textContent = cssText;
        }

        protected async createFormByName(formName: string): Promise<TForm> {
                const basePath = `/src/forms/${formName}`;

                const module = await import(/* @vite-ignore */ `${basePath}.ts`);

                const response = await fetch(`${basePath}.dform`);
                if (!response.ok) {
                        throw new Error(`Cannot load ${basePath}.dform`);
                }

                const dformText = await response.text();

                const html = this.extractTemplateFromDform(dformText);
                const css = this.extractStyleFromDform(dformText);

                const FormClass = module.default ?? module[formName];
                const form = new FormClass(formName);

                this.applyDformStyle(formName, css);
                form.create(html);
                this.registerForm(form);

                return form;
        }

        /*
        protected async loadFormModule(formName: string): Promise<any> {
                debugger;
                const modulePath = `/src/apps/${this.appName}/forms/${formName}.form/${formName}.ts`;
                return import(/ * @vite-ignore * / modulePath);
        }

        protected async loadFormHtml(formName: string): Promise<string> {
                debugger;
                const htmlPath = `/src/apps/${this.appName}/forms/${formName}.form/${formName}.html`;

                const response = await fetch(htmlPath);
                if (!response.ok) {
                        throw new Error(`Cannot load ${htmlPath}`);
                }

                return await response.text();
        }
        */
}
