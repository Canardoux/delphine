// frames/MainFrame.ts

import { TFrame } from '@vcl/palettes/standard/TFrame';
import { html, css, type CSSResultGroup } from 'lit';

console.log('[MainFrame] module loaded from:', import.meta.url);

export default class MainFrame extends TFrame {
        static properties = {
                ...TFrame.properties
                // <delphine:properties>
                // msg: { type: String },
                // subCounter: { type: Number, state: true },
                // myCounter: { type: Number, state: true }
                // </delphine:properties>
        };

        // <delphine:property-values>
        // </delphine:property-values>

        static override styles: CSSResultGroup = [
                TFrame.styles
                // <delphine:styles>
                // css`
                //         delphine-frame {
                //                 color: green;
                //         }
                // `
                // </delphine:styles>
        ];

        render() {
                return this.layout;
        }
        // <delphine:layout>
        get layout() {
                return html` <my-lit-frame data-delphine-component="TMyLitFrame" id="main-frameAAA" data-delphine-name="main-frameAAA" data-delphine-onclick="helloframeAAA_onclick"></my-lit-frame> `;
        }
        // </delphine:layout>

        // <delphine:components>
        // </delphine:components>

        // <delphine:handlers>
        private helloframeAAA_onclick(ev: Event): void {
                console.log('helloframeAAA_onclick');
        }
        // </delphine:handlers>
}

export function registerMainFrame(): void {
        const registeredClass = customElements.get('main-frame');

        if (!registeredClass) {
                customElements.define('main-frame', MainFrame);
                return;
        }

        if (registeredClass !== MainFrame) {
                console.warn('[Delphine] "main-frame" was loaded through two different modules.', {
                        currentModule: import.meta.url,
                        registeredClass,
                        currentClass: MainFrame
                });
        }
}

export const registerFrame = registerMainFrame;

declare global {
        interface HTMLElementTagNameMap {
                'main-frame': MainFrame;
        }
}
