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
import { TComponentTypeRegistry } from './ComponentTypeRegistry';
import { registerBuiltins } from './RegisterVcl';
import { getApplication, setApplication } from './IApplication';
import type { IApplication } from './IApplication';
import { TMetaControl } from './Base';

//export TheApplication : TApplication | null = null;

export type TApplicationConfig = {
        mainForm?: string;
        forms?: string[];
};

export class TMetaApplication extends TMetaclass {
        static readonly metaclass: TMetaApplication = new TMetaApplication(TMetaclass.metaclass, 'TApplication');

        protected constructor(superClass: TMetaclass, name: string) {
                super(superClass, name);
        }
        getMetaclass(): TMetaApplication {
                return TMetaApplication.metaclass;
        }
}

export class TApplication implements IApplication {
        currentForm: TForm | null = null;

        getMetaclass(): TMetaApplication {
                return TMetaApplication.metaclass;
        }
        private forms: TForm[] = [];
        mainForm: TForm | null = null;

        protected appName: string;
        protected appConfig: TApplicationConfig;

        constructor(appName: string, appConfig: TApplicationConfig) {
                debugger;
                this.appName = appName;
                this.appConfig = appConfig;
                setApplication(this);
                //registerBuiltins(this.types);
        }

        getForms(): readonly TForm[] {
                return this.forms;
        }

        getFormByName<T extends TForm = TForm>(name: string): T | undefined {
                return this.forms.find((f) => f.name === name) as T | undefined;
        }
        protected registerForm(form: TForm): void {
                debugger;
                this.forms.push(form);

                if (!this.mainForm) {
                        this.mainForm = form;
                }
        }

        // Actually not used
        createForm<T extends TForm>(ctor: new (...args: any[]) => T, name: string, html: string): T {
                debugger;
                const f = new ctor(name);
                f.create(html);

                this.forms.push(f);

                if (!this.mainForm) this.mainForm = f;

                return f;
        }

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

                host.hidden = false;

                form.onShown();
        }
        // By default we show() the main Form
        // This method can be overriden in a user TApplication
        run() {
                debugger;
                this.runWhenDomReady(() => {
                        if (this.mainForm) {
                                this.mainForm.show();
                        } else {
                                this.autoStart();
                        }
                });
        }

        // By default, we create a TForm for every Forms declared in app.json.
        // This method can be overriden in a user TApplication
        async initialize(): Promise<void> {
                debugger;
                const formNames = this.appConfig.forms ?? [];

                for (const formName of formNames) {
                        const form = await this.createFormByName(formName);
                        this.registerForm(form);
                }

                if (this.appConfig.mainForm) {
                        const main = this.getFormByName(this.appConfig.mainForm);
                        if (main) {
                                this.mainForm = main;
                        }
                }
        }

        protected autoStart(): void {
                debugger;
                if (this.forms.length > 0) {
                        this.mainForm = this.forms[0]!;
                        this.mainForm!.show();
                }
        }

        runWhenDomReady(fn: () => void): void {
                if (document.readyState === 'loading') {
                        window.addEventListener('DOMContentLoaded', fn, { once: true });
                } else {
                        fn();
                }
        }

        protected async createFormByName(formName: string): Promise<TForm> {
                const basePath = `/src/apps/${this.appName}/forms/${formName}.form`;

                const module = await import(/* @vite-ignore */ `${basePath}/${formName}.ts`);

                const response = await fetch(`${basePath}/${formName}.html`);
                const html = await response.text();

                const FormClass = module.default ?? module[formName];
                const form = new FormClass(formName);

                form.create(html); // 🔥 IMPORTANT

                return form;
        }

        protected async loadFormModule(formName: string): Promise<any> {
                debugger;
                const modulePath = `/src/apps/${this.appName}/forms/${formName}.form/${formName}.ts`;
                return import(/* @vite-ignore */ modulePath);
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
}
