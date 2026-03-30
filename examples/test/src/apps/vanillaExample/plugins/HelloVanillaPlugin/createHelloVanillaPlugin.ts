// createHelloVanillaPlugin.ts
// --------------------------

import HelloVanilla from './HelloVanillaDelphine';
import { defineVanillaPlugin } from '@vcl/VanillaPlugin';
import type { ComponentSchema } from '@vcl/IComponent';

const schema: ComponentSchema = {
        name: 'hello-vanilla',
        label: 'Hello Vanilla',
        component: HelloVanilla,
        category: 'Vanilla',
        props: {
                message: { kind: 'string', default: 'Hello depuis Delphine' },
                count: { kind: 'number', default: 0 },
                enabled: { kind: 'boolean', default: true }
        }
};

export const createHelloVanillaPlugin = defineVanillaPlugin(schema);
