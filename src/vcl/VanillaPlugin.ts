import type { UIPluginFactory } from './IPlugin';
import type { ComponentSchema, PropSchema } from './IComponent';
import type { IPluginHost, UIPluginInstance, DelphineServices } from './IPlugin';
import type { IForm } from './IForm';
import type { Json } from './IPlugin';

type VanillaRenderContext<Props> = {
        container: HTMLElement;
        props: Props;
        services: DelphineServices;
        hostName: string;
        formName: string;
};

type VanillaRenderResult<Props> = {
        update?: (props: Props) => void;
        destroy?: () => void;
        focus?: () => void;
};

export function defineVanillaPlugin<Props>(schema: ComponentSchema, renderFn: (ctx: VanillaRenderContext<Props>) => VanillaRenderResult<Props>) {
        const factory = ({ host, form }: any) => {
                let api: VanillaRenderResult<Props> | null = null;

                return {
                        id: schema.name,

                        mount(container: HTMLElement, props: Props, services: any) {
                                api = renderFn({
                                        container,
                                        props,
                                        services,
                                        hostName: host.getName(),
                                        formName: form.getName()
                                });
                        },

                        update(props: Props) {
                                api?.update?.(props);
                        },

                        unmount() {
                                api?.destroy?.();
                                api = null;
                        },

                        focus() {
                                api?.focus?.();
                        }
                };
        };

        (factory as any).propSchema = schema.props;
        return factory;
}
