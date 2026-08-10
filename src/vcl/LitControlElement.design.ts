// vcl/LitControlElement.design.ts

import type { ComponentMetadata } from '../designer/core/metadata';

export const designMetadata = {
        type: 'TLitControlElement',

        properties: [
                {
                        name: 'left',
                        type: 'number'
                },
                {
                        name: 'top',
                        type: 'number'
                },
                {
                        name: 'width',
                        type: 'string'
                },
                {
                        name: 'height',
                        type: 'string'
                },
                {
                        name: 'color',
                        type: 'string',
                        defaultValue: ''
                },
                {
                        name: 'backgroundColor',
                        type: 'string',
                        defaultValue: ''
                }
        ],

        events: [
                {
                        name: 'onclick',
                        label: 'OnClick',
                        default: true
                },
                {
                        name: 'ondblclick',
                        label: 'OnDblClick'
                },
                {
                        name: 'oncontextpopup',
                        label: 'OnContextPopup'
                }
        ]
} as const satisfies ComponentMetadata;
