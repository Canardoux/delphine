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
import { TMetaControl } from './Base';
//import type { IApplication } from './IApplication';

export class TMetaApplication extends TMetaclass {
        static readonly metaclass: TMetaApplication = new TMetaApplication(TMetaclass.metaclass, 'TApplication');

        protected constructor(superClass: TMetaclass, name: string) {
                super(superClass, name);
        }
        getMetaclass(): TMetaApplication {
                return TMetaApplication.metaclass;
        }
}

export class TApplication implements TApplication {
        getMetaclass(): TMetaApplication {
                return TMetaApplication.metaclass;
        }
        //static TheApplication: TApplication;
        //static pluginRegistry = new PluginRegistry();
        //plugins: IPluginRegistry;
        private forms: TForm[] = [];
        //readonly types = new TComponentTypeRegistry();
        mainForm: TForm | null = null;
        //getClass(type: string): TMetaControl | undefined {
        //return this.types.get(type!) as TMetaControl | undefined;
        //}

        constructor() {
                setApplication(this);
                //registerBuiltins(this.types);
        }

        createForm<T extends TForm>(ctor: new (...args: any[]) => T, name: string): T {
                const f = new ctor(name);
                this.forms.push(f);
                if (!this.mainForm) this.mainForm = f;
                return f;
        }

        run() {
                this.runWhenDomReady(() => {
                        if (this.mainForm) this.mainForm.show();
                        else this.autoStart();
                });
        }

        protected autoStart() {
                // fallback: choisir une form enregistrée, ou créer une form implicite
        }

        runWhenDomReady(fn: () => void) {
                if (document.readyState === 'loading') {
                        window.addEventListener('DOMContentLoaded', fn, { once: true });
                } else {
                        fn();
                }
        }
}
