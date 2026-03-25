// VuePlugin.ts
// ------------
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

import type { UIPluginFactory } from './IPlugin';
import type { ComponentSchema } from './IComponent';
import type { IPluginHost, UIPluginInstance } from './IPlugin';
import { IForm } from './IForm';
import type { Json } from './IPlugin';

type SvelteComponentConstructor = new (options: { target: HTMLElement; props?: Record<string, unknown> }) => {
        $set?: (props: Record<string, unknown>) => void;
        $destroy?: () => void;
};

export function defineSveltePlugin<Props extends Json = Json>(schema: ComponentSchema): UIPluginFactory<Props> {
        const SvelteComponent = schema.component as SvelteComponentConstructor;
        const factory: UIPluginFactory<Props> = ({ host, form }: { host: IPluginHost; form: IForm }): UIPluginInstance<Props> => {
                let instance: {
                        $set?: (props: Record<string, unknown>) => void;
                        $destroy?: () => void;
                } | null = null;

                return {
                        id: schema.name,

                        mount(container, props, services) {
                                instance = new SvelteComponent({
                                        target: container,
                                        props: {
                                                state: props,
                                                services,
                                                hostName: host.getName(),
                                                formName: form.getName()
                                        }
                                });
                        },

                        update(props) {
                                instance?.$set?.({
                                        state: props
                                });
                        },

                        unmount() {
                                instance?.$destroy?.();
                                instance = null;
                        }
                };
        };

        (factory as any).propSchema = schema.props;
        return factory;
}
