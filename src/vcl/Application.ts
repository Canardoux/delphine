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
//import { registerPalettes } from './TypeRegistry';
import type { IApplication } from './IApplication';
import { setApplication } from './IApplication';
//import type { IControl, IMetaControl } from './IControl';
//import { TMetaControl } from './Control';
//import type { IMetaComponent } from './IComponent';
import { parseDformSource } from './DformSource';
import { registerRuntimePalettes } from './palettes/registerRuntimePalette';
//import { TTypeRegistry } from './TypeRegistry';
//import { TLitFrame } from './palettes/lit/TLitFrame';
//import '../themes/win98.css';

export type TApplicationConfig = {
        mainForm?: string;
        forms?: { name: string; frame: string; autoCreate: boolean }[];
        frames?: {
                name: string;
                className: string;
                tagName: string;
        }[];
        ui?: {
                theme?: string;
                density?: 'compact' | 'normal' | 'spacious';
                fontScale?: number;
        };
        palettes?: string[];
};

export class TMetaApplication extends TMetaclass {
        static readonly metaclass: TMetaApplication = new TMetaApplication(TMetaclass.metaclass, 'TApplication');

        protected constructor(superClass: TMetaclass, name: string) {
                super(superClass, name);
        }
}

export class TApplication implements IApplication {
        //typeRegistry: TTypeRegistry | null = null;
        currentForm: TForm | null = null;
        mainForm: TForm | null = null;
        protected appName: string;
        appConfig: TApplicationConfig | null = null;
        private formStack: TForm[] = [];
        private handlingBrowserPop = false;
        private forms: Map<string, TForm> = new Map<string, TForm>();
        //private loadedUnits = new Map<string, TLoadedUnit>();
        private _theme: string | null = null;

        get theme(): string {
                return this._theme ?? this.appConfig?.ui?.theme ?? 'win98';
        }

        set theme(value: string) {
                this.setTheme(value);
        }

        // setTheme(theme: string): void {
        //         this._theme = theme;
        //         this.applyTheme();
        // }

        setTheme(theme: string): void {
                this._theme = theme;

                if (this.appConfig) {
                        this.appConfig.ui ??= {};
                        this.appConfig.ui.theme = theme;
                }

                this.applyTheme();
        }

        // applyTheme(): void {
        //         //document.documentElement.dataset.theme = this._theme ?? this._theme ?? 'win98';
        //         // const themeId = 'delphine-current-theme';
        //         // let link = document.getElementById(themeId) as HTMLLinkElement | null;
        //         // const theme = this._theme || (this.appConfig?.ui?.theme ?? 'win95');
        //         // if (!link) {
        //         //         link = document.createElement('link');
        //         //         link.id = themeId;
        //         //         link.rel = 'stylesheet';
        //         //         link.setAttribute('data-delphine-theme', theme);
        //         //         document.head.appendChild(link);
        //         // }
        //         // link.href = `/themes/${theme}.css`;
        //         // link.setAttribute('data-delphine-theme', theme);
        //         // // Important: keep the theme last in <head>
        //         // document.head.appendChild(link);

        //         const theme = this._theme ?? this.appConfig?.ui?.theme ?? 'win98';

        //         document.documentElement.dataset.theme = theme;

        //         const themeId = 'delphine-current-theme';

        //         let link = document.getElementById(themeId) as HTMLLinkElement | null;

        //         if (!link) {
        //                 link = document.createElement('link');
        //                 link.id = themeId;
        //                 link.rel = 'stylesheet';
        //                 document.head.appendChild(link);
        //         }

        //         link.href = `/themes/${encodeURIComponent(theme)}.css`;

        //         link.dataset.delphineTheme = theme;

        //         /*

        //  * Keep the theme after the other stylesheets so that its

        //  * global rules take precedence when specificity is equal.

        //  */

        //         document.head.appendChild(link);
        // }

        applyTheme(): void {
                const theme = this.theme;

                document.documentElement.dataset.theme = theme;

                const themeId = 'delphine-current-theme';

                let link = document.getElementById(themeId) as HTMLLinkElement | null;

                if (!link) {
                        link = document.createElement('link');
                        link.id = themeId;
                        link.rel = 'stylesheet';
                        document.head.appendChild(link);
                }

                link.href = `/themes/${encodeURIComponent(theme)}.css`;

                link.dataset.delphineTheme = theme;
        }

        // private async loadDformUnit(basePath: string, unitName: string): Promise<TLoadedUnit> {
        //         const formPath = `${basePath}/${unitName}.dform`;
        //         const srcPath = `${basePath}/${unitName}.ts`;
        //         const mod = await import(srcPath);

        //         if (!mod.delphineMeta) {
        //                 throw new Error(`Missing delphineMeta export in ${srcPath}`);
        //         }
        //         const response = await fetch(formPath);
        //         if (!response.ok) {
        //                 throw new Error(`Cannot load ${formPath}`);
        //         }

        //         const source = await response.text();
        //         const parts = parseDformSource(source);

        //         const loaded: TLoadedUnit = {
        //                 name: unitName,
        //                 template: parts.template,
        //                 style: parts.style,
        //                 metaclass: mod.delphineMeta as IMetaControl
        //                 //metaclass: metaclass
        //         };

        //         return loaded;
        // }

        // registerLoadedUnit(name: string, unit: TLoadedUnit): void {
        //         this.loadedUnits.set(name, unit);
        // }

        // getLoadedUnit(name: string): TLoadedUnit | undefined {
        //         return this.loadedUnits.get(name);
        // }

        constructor(appName: string) {
                this.appName = appName;
                setApplication(this);
                //this.typeRegistry = new TTypeRegistry();
        }

        async readConfig() {
                const appConfigUrl = `/app.json`;

                const appConfigResponse = await fetch(appConfigUrl);
                if (!appConfigResponse.ok) {
                        throw new Error(`Cannot load ${appConfigUrl}`);
                }

                const appConfig = await appConfigResponse.json();
                console.log(`Loaded app config. Theme:`, appConfig.ui.theme);
                this.appConfig = appConfig;
        }

        // getClass(type: string): IMetaComponent | undefined {
        //         return this.typeRegistry?.get(type);
        // }

        getFormByName<T extends TForm = TForm>(name: string): T | undefined {
                return this.forms.get(name) as T;
        }

        protected registerForm(form: TForm): void {
                this.forms.set(form.name, form);

                if (!this.mainForm) {
                        this.mainForm = form;
                }
        }

        async createAndShow(formName: string) {
                let form = this.getFormByName(formName);
                if (!form) {
                        form = await this.createFormByName(formName);
                }
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
                this.createAndShow(formName);
                this.destroy(me);
        }

        showForm(form: TForm): void {
                console.log('form.elem =', form.elem);
                console.log('form.elem.parentElement =', form.elem?.parentElement);

                if (!form.elem) {
                        throw new Error(`Form ${form.name} has not been created`);
                }

                if (!form.elem.isConnected) {
                        throw new Error(`Form ${form.name} is not mounted`);
                }

                if (this.currentForm === form) {
                        return;
                }

                this.currentForm?.hide();
                this.currentForm = form;

                // const host = form.elem.parentElement;
                // if (!host) {
                //         throw new Error(`Form ${form.name} has no host`);
                // }

                // const focusTarget = form.elem.querySelector<HTMLElement>('[autofocus], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])');
                // focusTarget?.focus();
                form.elem.hidden = false;

                const focusTarget = form.elem.querySelector<HTMLElement>(['[autofocus]', 'button:not([disabled])', 'input:not([disabled])', 'select:not([disabled])', 'textarea:not([disabled])', '[href]', '[tabindex]:not([tabindex="-1"])'].join(', '));

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

        // private activateForm(form: TForm): void {
        //         if (!form.elem) {
        //                 throw new Error(`Form ${form.name} not created`);
        //         }

        //         const host = form.elem.parentElement;
        //         if (host) host.hidden = false;

        //         this.currentForm = form;
        //         form.onShown();
        // }

        private activateForm(form: TForm): void {
                if (!form.elem.isConnected) {
                        throw new Error(`Form ${form.name} is not mounted`);
                }

                form.elem.hidden = false;
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

        start() {
                this.runWhenDomReady(() => {
                        this.installBrowserBackHandler();
                        const url = new URL(window.location.href);
                        url.searchParams.set('form', this.mainForm!.name);
                        history.replaceState({ form: this.mainForm!.name }, '', url);
                        this.setTheme(this.appConfig?.ui?.theme ?? 'win98');
                        this.run();
                });
        }

        run() {
                this.mainForm?.show();
        }

        private async registerFrame(basePath: string, unitName: string): Promise<void> {
                const srcPath = `${basePath}/${unitName}.ts`;
                const mod = await import(srcPath);
                mod.registerFrame();
        }

        async registerFrames() {
                const frames = this.appConfig?.frames ?? [];
                for (const frame of frames) {
                        await this.registerFrame(`/src/frames`, frame.className);
                        //loaded.register();
                        // this.registerLoadedUnit(frame.tagName, loaded);
                        // typeRegistry?.register(loaded.metaclass as TMetaControl);
                }
        }

        async registerRuntimeTypes() {
                await registerRuntimePalettes(this.appConfig!.palettes!);
                await this.registerFrames();
        }

        async createAutoForms() {
                const dforms = this.appConfig?.forms ?? [];

                for (const f of dforms) {
                        if (f.autoCreate) await this.createFormByName(f.name);
                }
        }

        // By default, we create a TForm for every Forms declared in app.json.
        // This method can be overriden in a user TApplication
        async initialize(): Promise<void> {}

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

        private getApplicationHost(): HTMLElement {
                // const host = document.getElementById('app');
                // if (!host) {
                //         throw new Error('Missing application host element #app');
                // }
                // return host;
                return document.body;
        }

        protected getTagName(formName: string): string | null {
                const forms = this.appConfig?.forms;
                for (const x of forms!) {
                        if (x.name == formName) {
                                const frames = this.appConfig?.frames;
                                const frame = x.frame;
                                for (const y of frames!) {
                                        if (y.name == frame) return y.tagName;
                                }
                        }
                }
                return null;
        }

        protected async createFormByName(formName: string): Promise<TForm> {
                // const basePath = `/src/forms/${formName}`;

                // const module = await import(/* @vite-ignore */ `${basePath}.ts`);

                // // const response = await fetch(`${basePath}.dform`);
                // // if (!response.ok) {
                // //         throw new Error(`Cannot load ${basePath}.dform`);
                // // }

                // // const dformText = await response.text();

                // // const html = this.extractTemplateFromDform(dformText);
                // // const css = this.extractStyleFromDform(dformText);

                // const FormClass = module.default ?? module[formName];
                // if (!FormClass) {
                //         throw new Error(`Form class ${formName} was not exported by ${basePath}.ts`);
                // }
                //const form = new FormClass();
                const frameName = this.getTagName(formName);
                if (frameName == null) throw new Error(`${frameName} not declared in app.config`);
                const form = new TForm(frameName, formName);

                // this.applyDformStyle(formName, css);
                // await form.create(html);
                form.mount(this.getApplicationHost());

                // const host = document.getElementById('app');

                // if (!host) {
                //         throw new Error('Missing #app');
                // }

                // host.appendChild(form.elem);

                this.registerForm(form);
                //this.applyTheme();

                return form;
        }
}
