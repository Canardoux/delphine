// vcl/palettes/standard/TPanel.design.ts

// vcl/palettes/standard/TPanel.design.ts

import type { ComponentMetadata } from '../../../designer/core/metadata';

export const designMetadata = {
        type: 'TPanel',
        tagName: 'lit-panel',
        extends: 'TLitControlElement',

        properties: [],

        events: [
                {
                        name: 'onclick',
                        default: true
                }
        ]
} as const satisfies ComponentMetadata;
