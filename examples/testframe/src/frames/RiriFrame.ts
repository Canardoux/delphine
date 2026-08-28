// frames/RiriFrame.ts

import { TApplication } from '@vcl';
import { TButton } from '@vcl/palettes/standard/TButton';
import { getApplication } from '@vcl/IApplication';
import { TFrame } from '@vcl/palettes/standard/TFrame';
import { html } from 'lit';

export default class RiriFrame extends TFrame {
        static properties = {
                ...TFrame.properties
                // <delphine:properties>
                //msg: { type: String },
                //numberClicked: { type: Number }
                // </delphine:properties>
        };

        // <delphine:property-values>
        // </delphine:property-values>

        render() {
                return this.layout;
        }
        // <delphine:layout>
        get layout() {
                return html`
                        <lit-panel data-delphine-component="TPanel" data-delphine-name="Riri" id="iomi"
                                ><lit-button data-delphine-component="TButton" data-delphine-name="button1" caption="MainForm" data-delphine-onclick="button1_onclick" id="is7v"> </lit-button
                                ><lit-button data-delphine-component="TButton" data-delphine-name="button2" caption="POP to MainForm" data-delphine-onclick="button2_onclick" id="irgh2"> </lit-button
                        ></lit-panel>
                `;
        }
        // </delphine:layout>

        // <delphine:handlers>

        button1_onclick(_ev: Event | null, _sender: any) {
                debugger;
                const btn = this.getComponent<TButton>('button1');
                if (!btn) {
                        console.warn('button1 not found in registry');
                        return;
                }
                btn!.color = 'rgb(0, 128, 128)';
                console.log('Button1 clicked!!!!');
                const app = getApplication() as TApplication;
                app?.showFormByName('MainForm');
        }

        button2_onclick(_ev: Event | null, _sender: any) {
                debugger;
                const btn = this.getComponent<TButton>('button2');
                if (!btn) {
                        console.warn('button2 not found in registry');
                        return;
                }
                btn!.color = 'rgb(255, 0, 0)';
                console.log('Button2 clicked!!!!');
                const app = getApplication() as TApplication;
                app.popFormDestroy();
        }

        // </delphine:handlers>
}

export const frameMetadata = {
        tagName: 'riri-frame',
        design: {
                category: 'Frames',
                resizable: true,
                droppable: false
        }
};
export function registerRiriFrame() {
        if (!customElements.get(frameMetadata.tagName)) {
                customElements.define(frameMetadata.tagName, RiriFrame);
        }
}

export const registerFrame = registerRiriFrame;

declare global {
        interface HTMLElementTagNameMap {
                'riri-frame': RiriFrame;
        }
}
