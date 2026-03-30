import template from './HelloVanilla.template.html?raw';
import type { DelphineServices } from '@vcl/IPlugin';

type HelloVanillaProps = {
        message: string;
        count: number;
        enabled: boolean;
};

export default {
        template,

        createController({ services, hostName }: { services: DelphineServices; hostName: string }) {
                let root: HTMLElement;
                let changeButton: HTMLButtonElement | null = null;
                let incrementButton: HTMLButtonElement | null = null;

                function changeMessage(e: Event) {
                        e.stopPropagation();
                        services.notify?.({
                                type: 'setProp',
                                hostName,
                                key: 'message',
                                value: 'Hello from Vanilla!'
                        });
                }

                function incrementCount(e: Event) {
                        e.stopPropagation();
                        services.notify?.({
                                type: 'setProp',
                                hostName,
                                key: 'count',
                                value: 77
                        });
                }

                return {
                        mount(r: HTMLElement) {
                                root = r;

                                changeButton = root.querySelector('[data-action="changeMessage"]');
                                incrementButton = root.querySelector('[data-action="incrementCount"]');

                                changeButton?.addEventListener('click', changeMessage);
                                incrementButton?.addEventListener('click', incrementCount);
                        },

                        update(props: HelloVanillaProps) {
                                const msg = root.querySelector('[data-bind="message"]');
                                const cnt = root.querySelector('[data-bind="count"]');

                                if (msg) msg.textContent = props.message;
                                if (cnt) cnt.textContent = String(props.count);

                                const disabled = !props.enabled;
                                if (changeButton) changeButton.disabled = disabled;
                                if (incrementButton) incrementButton.disabled = disabled;
                        },

                        destroy() {
                                changeButton?.removeEventListener('click', changeMessage);
                                incrementButton?.removeEventListener('click', incrementCount);
                                root.innerHTML = '';
                        }
                };
        }
};
