// createHelloVuePlugin.ts
// -----------------------

import HelloDelphine from './HelloVueDelphine.vue';
import { defineVuePlugin } from '@vcl/VuePlugin';
import type { PluginPropSchema, PluginSchema } from '@vcl/IPlugin';

const schema: PluginSchema = {
        name: 'hello-vue',
        component: HelloDelphine,
        label: 'Hello Vue',
        category: 'Vue',
        props: {
                message: { kind: 'string', default: 'Hello depuis Delphine' },
                count: { kind: 'number', default: 0 },
                enabled: { kind: 'boolean', default: true }
        }
};

//export const HelloVuePlugin: PluginSchema = defineVuePlugin();

export const createHelloVuePlugin = defineVuePlugin(schema);
