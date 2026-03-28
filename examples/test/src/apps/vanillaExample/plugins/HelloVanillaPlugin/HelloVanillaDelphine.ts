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
                                value: undefined
                        });
                }

                return {
                        mount(r: HTMLElement) {
                                root = r;

                                root.querySelector('[data-action="changeMessage"]')?.addEventListener('click', changeMessage);

                                root.querySelector('[data-action="incrementCount"]')?.addEventListener('click', incrementCount);
                        },

                        update(props: HelloVanillaProps) {
                                const msg = root.querySelector('[data-bind="message"]');
                                const cnt = root.querySelector('[data-bind="count"]');

                                if (msg) msg.textContent = props.message;
                                if (cnt) cnt.textContent = String(props.count);
                        },

                        destroy() {
                                root.innerHTML = '';
                        }
                };
        }
};
