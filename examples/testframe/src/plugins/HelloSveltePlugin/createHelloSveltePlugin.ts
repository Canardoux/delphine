// createHelloSveltePlugin.ts
// --------------------------

import HelloDelphine from './HelloSvelteDelphine.svelte';
import { defineSveltePlugin } from '@vcl/SveltePlugin';
import type { ComponentSchema } from '@vcl/IComponent';

const schema: ComponentSchema = {
        name: 'hello-svelte',
        component: HelloDelphine,
        label: 'Hello Svelte',
        category: 'Svelte',
        icon: undefined,
        isContainer: false,
        instanceName: 'helloSvelte',
        resizable: false,
        tagName: 'div',
        props: {
                message: { kind: 'string', default: 'Hello depuis Delphine' },
                count: { kind: 'number', default: 0 },
                enabled: { kind: 'boolean', default: true }
        }
};

export const createHelloSveltePlugin = defineSveltePlugin(schema);
