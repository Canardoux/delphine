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
                        defaultValue: 'The Caption',
                        design: {
                                category: 'property',
                                label: 'Caption'
                        }
                },
                {
                        name: 'enabled',
                        type: 'boolean',
                        defaultValue: true,
                        design: {
                                category: 'property',
                                label: 'Enabled'
                        }
                },
                {
                        name: 'checked',
                        type: 'boolean',
                        defaultValue: false,
                        design: {
                                category: 'property',
                                label: 'Checked'
                        }
                }
        ],

        events: [
                // {
                //         name: 'onclick',
                //         default: true
                // }
        ]
} as const satisfies ComponentMetadata;
