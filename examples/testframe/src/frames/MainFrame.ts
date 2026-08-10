//import { TForm, TControl, TColor, TApplication, TPluginHost } from '@vcl';
import { TButton } from '@vcl/palettes/standard/TButton';
import { TPanel } from '@vcl/palettes/standard/TPanel';
import { getApplication } from '@vcl/IApplication';
import { TCheckBox } from '@vcl/palettes/standard/TCheckBox';
import { TFrame } from '@vcl/palettes/standard/TFrame';
import { LitElement, html, css } from 'lit';
import { DelphineMyLitFrame } from './TMyLitFrame';

//import std from '@vcl/palettes/standard/index';

//import './MainForm.css';
//import { THostFrame } from '@vcl/palettes/standard/TFrame';
import { registerMyLitFrame } from './TMyLitFrame';

console.log('[MainFrame] module loaded from:', import.meta.url);

export default class MainFrame extends TFrame {
        static properties = {
                ...TFrame.properties

                // msg: { type: String },
                // subCounter: { type: Number, state: true },
                // myCounter: { type: Number, state: true }
        };

        render() {
                return html`
                        <div>
                                <my-lit-frame data-delphine-component="main-frame" id="main-frameAAA" data-delphine-name="main-frameAAA" data-delphine-onclick="helloframeAAA_onclick"></my-lit-frame>
                        </div>
                `;
        }

        private helloframeAAA_onclick(ev: Event): void {
                console.log('helloframeAAA_onclick');
        }
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
