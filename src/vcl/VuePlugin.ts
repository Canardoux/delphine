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

import { createApp, reactive } from 'vue';
import type { UIPluginFactory, UIPluginInstance } from './Plugin';

export function defineVuePlugin(Component: any): UIPluginFactory {
        return ({ host }) => {
                let app: any = null;
                const state = reactive({});

                return {
                        id: Component.name ?? 'vue-plugin',

                        mount(container, props, services) {
                                Object.assign(state, props);

                                app = createApp(Component, {
                                        state,
                                        services,
                                        hostName: host.name
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
