// VuePlugin.ts
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

import { createApp, reactive, type App as VueApp, type Component } from 'vue';
import type { UIPluginFactory } from './IPlugin';

export function defineVuePlugin(component: Component): UIPluginFactory {
        return ({ host }) => {
                let app: VueApp | null = null;
                const state = reactive<Record<string, unknown>>({});

                return {
                        id: (component as any).name ?? 'vue-plugin',

                        mount(container, props, services) {
                                Object.assign(state, props);

                                app = createApp(component, {
                                        state,
                                        services,
                                        hostName: host.getName()
                                });

                                app.mount(container);
                        },

                        update(props) {
                                Object.assign(state, props);
                        },

                        unmount() {
                                app?.unmount();
                                app = null;
                        }
                };
        };
}
