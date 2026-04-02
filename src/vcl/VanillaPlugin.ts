//import type { UIPluginFactory } from './IPlugin';
import type { ComponentSchema, PropSchema } from './IComponent';
import type { IPluginHost, DelphineServices } from './IPlugin';
//import type { IForm } from './IForm';
//import type { Json } from './IPlugin';

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

export function defineVanillaPlugin<Props>(schema: ComponentSchema) {
        const factory = ({ host, form }: any) => {
                let controller: any = null;
                let containerRef: HTMLElement | null = null;

                return {
                        id: schema.name,

                        mount(container: HTMLElement, props: Props, services: DelphineServices) {
                                containerRef = container;

                                const component: any = schema.component;

                                // 1. Inject template if present
                                if (component?.template) {
                                        container.innerHTML = component.template;
                                }

                                // 2. Create controller
                                if (component?.createController) {
                                        controller = component.createController({
                                                services,
                                                hostName: host.getName(),
                                                formName: form.getName()
                                        });

                                        controller.mount?.(container);
                                        controller.update?.(props);
                                }
                        },

                        update(props: Props) {
                                controller?.update?.(props);
                        },

                        unmount() {
                                controller?.destroy?.();
                                controller = null;
                                if (containerRef) {
                                        containerRef.innerHTML = '';
                                }
                        },

                        focus() {
                                controller?.focus?.();
                        }
                };
        };

        (factory as any).propSchema = schema.props;
        return factory;
}
