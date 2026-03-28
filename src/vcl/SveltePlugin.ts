import { mount, unmount, flushSync } from 'svelte';
import type { Component } from 'svelte';

import type { UIPluginFactory } from './IPlugin';
import type { ComponentSchema } from './IComponent';
import type { IPluginHost, UIPluginInstance } from './IPlugin';
import type { IForm } from './IForm';
import type { Json } from './IPlugin';

function toRecord(value: unknown): Record<string, unknown> {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
                return value as Record<string, unknown>;
        }
        return {};
}

type MountedSvelteInstance = {
        $set?: (props: Record<string, unknown>) => void;
};

export function defineSveltePlugin<Props extends Json = Json>(schema: ComponentSchema): UIPluginFactory<Props> {
        const SvelteComponent = schema.component as Component<Record<string, unknown>>;

        const factory: UIPluginFactory<Props> = ({ host, form }: { host: IPluginHost; form: IForm }): UIPluginInstance<Props> => {
                let instance: MountedSvelteInstance | null = null;

                return {
                        id: schema.name,

                        mount(container, props, services) {
                                const pluginProps = toRecord(props);

                                instance = mount(SvelteComponent, {
                                        target: container,
                                        props: {
                                                ...pluginProps,
                                                services,
                                                hostName: host.getName(),
                                                formName: form.getName()
                                        }
                                }) as MountedSvelteInstance;

                                flushSync();
                        },

                        update(props) {
                                const pluginProps = toRecord(props);
                                console.log('SVELTE PLUGIN UPDATE', pluginProps);

                                instance?.$set?.(pluginProps);
                                flushSync();
                        },

                        unmount() {
                                if (instance) {
                                        void unmount(instance as Record<string, unknown>);
                                }
                                instance = null;
                        }
                };
        };

        (factory as any).propSchema = schema.props;
        return factory;
}
//
