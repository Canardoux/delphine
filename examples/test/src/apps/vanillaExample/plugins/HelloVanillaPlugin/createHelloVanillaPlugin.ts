// createHelloVanillaPlugin.ts
// --------------------------

import * as HelloDelphine from './HelloVanillaDelphine';

import { defineVanillaPlugin } from '@vcl/VanillaPlugin';
import type { ComponentSchema } from '@vcl/IComponent';

const schema: ComponentSchema = {
        name: 'hello-vanilla',
        label: 'Hello Vanilla',
        component: HelloDelphine,
        category: 'Vanilla',
        props: {
                message: { kind: 'string', default: 'Hello depuis Delphine' },
                count: { kind: 'number', default: 0 },
                enabled: { kind: 'boolean', default: true }
        }
};

export const createHelloVanillaPlugin = defineVanillaPlugin(schema, ({ container, props, services, hostName }) => {
        const root = document.createElement('div');
        root.style.border = '1px solid #ccc';
        root.style.padding = '8px';

        const title = document.createElement('h2');
        title.textContent = 'Vanilla';

        const messageDiv = document.createElement('div');
        const countDiv = document.createElement('div');

        const changeButton = document.createElement('button');
        changeButton.textContent = 'Change message';

        const incrementButton = document.createElement('button');
        incrementButton.textContent = 'Increment count';

        function render(nextProps: any) {
                messageDiv.textContent = `Message: ${nextProps.message ?? ''}`;
                countDiv.textContent = `Count: ${nextProps.count ?? 0}`;

                const disabled = !nextProps.enabled;
                changeButton.disabled = disabled;
                incrementButton.disabled = disabled;
        }

        changeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                services.notify?.({
                        type: 'setProp',
                        hostName,
                        key: 'message',
                        value: 'Hello from Vanilla!'
                });
        });

        incrementButton.addEventListener('click', (e) => {
                e.stopPropagation();
                services.notify?.({
                        type: 'setProp',
                        hostName,
                        key: 'count',
                        value: 77 //(props.count ?? 0) + 1
                });
        });

        root.appendChild(title);
        root.appendChild(messageDiv);
        root.appendChild(countDiv);
        root.appendChild(changeButton);
        root.appendChild(incrementButton);

        container.replaceChildren(root);
        render(props);

        return {
                update(nextProps: any) {
                        render(nextProps);
                },
                destroy() {
                        root.remove();
                }
        };
});

//export const createHelloSveltePlugin = defineVanillaPlugin(schema);
