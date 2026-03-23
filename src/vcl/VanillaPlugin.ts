import type { UIPluginFactory } from './IPlugin';

export function defineVanillaPlugin(
        render: (ctx: { container: HTMLElement; props: any; services: any; hostName: string }) => {
                update?: (props: any) => void;
                destroy?: () => void;
        }
): UIPluginFactory {
        return ({ host }) => {
                let instance: any;

                return {
                        id: 'vanilla-plugin',

                        mount(container, props, services) {
                                instance = render({
                                        container,
                                        props,
                                        services,
                                        hostName: host.getName()
                                });
                        },

                        update(props) {
                                instance?.update?.(props);
                        },

                        unmount() {
                                instance?.destroy?.();
                        }
                };
        };
}
