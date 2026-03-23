import type { UIPluginFactory } from './IPlugin';

export function defineSveltePlugin(Component: any): UIPluginFactory {
        return ({ host }) => {
                let app: any;

                return {
                        id: Component.name ?? 'svelte-plugin',

                        mount(container, props, services) {
                                app = new Component({
                                        target: container,
                                        props: {
                                                state: props,
                                                services,
                                                hostName: host.getName()
                                        }
                                });
                        },

                        update(props) {
                                app?.$set({ state: props });
                        },

                        unmount() {
                                app?.$destroy();
                        }
                };
        };
}
