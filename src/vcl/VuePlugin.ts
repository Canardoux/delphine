import { createApp, reactive } from 'vue';
import type { UIPluginFactory, UIPluginInstance } from './plugin';

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
