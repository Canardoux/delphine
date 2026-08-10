// vcl/palettes/standard/TCheckBox.design.ts

import type { ComponentMetadata } from '../../../designer/core/metadata';

export const designMetadata = {
        type: 'TCheckBox',
        tagName: 'lit-checkbox',
        extends: 'TLitControlElement',

        properties: [
                {
                        name: 'caption',
                        type: 'string',
                        defaultValue: 'The Caption'
                },
                {
                        name: 'enabled',
                        type: 'boolean',
                        defaultValue: true
                },
                {
                        name: 'checked',
                        type: 'boolean',
                        defaultValue: false
                }
        ],

        events: [
                {
                        name: 'onclick',
                        default: true
                }
        ]
} as const satisfies ComponentMetadata;
