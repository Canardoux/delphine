import type { DelphineDocument } from '../core/model';

export const mainFrameDocument: DelphineDocument = {
        version: 1,
        frameName: 'MainFrame',

        root: {
                type: 'MainFrame',
                name: 'MainFrame',

                properties: {},
                events: {},

                children: [
                        {
                                type: 'TPanel',
                                name: 'Panel1',

                                properties: {
                                        left: 10,
                                        top: 10,
                                        width: '320px',
                                        height: '180px',
                                        backgroundColor: '#eeeeee'
                                },

                                events: {},

                                children: [
                                        {
                                                type: 'TButton',
                                                name: 'Button1',

                                                properties: {
                                                        left: 16,
                                                        top: 16,
                                                        width: '160px',
                                                        height: '32px',
                                                        caption: 'Hello from Delphine',
                                                        enabled: true
                                                },

                                                events: {
                                                        onclick: 'Button1Click'
                                                },

                                                children: []
                                        }
                                ]
                        }
                ]
        }
};
