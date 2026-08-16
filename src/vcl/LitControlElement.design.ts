// vcl/LitControlElement.design.ts

import type { ComponentMetadata } from '../designer/core/metadata';

export const designMetadata = {
        type: 'TLitControlElement',

        properties: [
                {
                        name: 'left',
                        type: 'number',
                        design: {
                                category: 'style',
                                label: 'Left'
                        }
                },
                {
                        name: 'top',
                        type: 'number',
                        design: {
                                category: 'style',
                                label: 'Top'
                        }
                },
                {
                        name: 'width',
                        type: 'string',
                        design: {
                                category: 'style',
                                label: 'Width'
                        }
                },
                {
                        name: 'height',
                        type: 'string',
                        design: {
                                category: 'style',
                                label: 'Height'
                        }
                },
                {
                        name: 'color',
                        type: 'string',
                        defaultValue: '',
                        design: {
                                category: 'style',
                                label: 'Color'
                        }
                },
                {
                        name: 'backgroundColor',
                        type: 'string',
                        defaultValue: '',
                        design: {
                                category: 'style',
                                label: 'Background Color'
                        }
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
