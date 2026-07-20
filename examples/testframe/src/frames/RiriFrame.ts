import { TForm, TControl, TColor, TApplication, TPluginHost } from '@vcl';
import { TLitButton } from '@vcl/palettes/lit/TLitButton';
import { TPanel } from '@vcl/palettes/standard/TPanel';
import { getApplication } from '@vcl/IApplication';
import { TCheckBox } from '@vcl/palettes/standard/TCheckBox';
import { TLitFrame } from '@vcl/palettes/lit/TLitFrame';
import { LitElement, html, css } from 'lit';

//import std from '@vcl/palettes/standard/index';

//import './MainForm.css';
import { THostFrame } from '@vcl/palettes/standard/TFrame';
import { registerMyLitFrame } from './TMyLitFrame';

export default class RiriFrame extends TLitFrame {
        static properties = {
                ...TLitFrame.properties

                // msg: { type: String },
                // subCounter: { type: Number, state: true },
                // myCounter: { type: Number, state: true }
        };

        render() {
                return html`
                        <div data-delphine-component="TForm" id="ir9k" data-delphine-name="Riri" data-delphine-oncreate="onMyCreate" data-delphine-onshown="onMyShown" data-delphine-onclick="">
                                Hello from AutoRunDelphiMode : Riri

                                <lit-button data-delphine-component="TButton" caption="MainForm" data-delphine-name="button1" @click="${this.button1_onclick}" class="delphine-control delphine-button"> MainForm </lit-button>
                                <lit-button data-delphine-component="TButton" caption="POP to MainForm" data-delphine-name="button2" @click="${this.button2_onclick}" class="delphine-control delphine-button"> POP to MainForm </lit-button>
                        </div>
                `;
        }

        button1_onclick(_ev: Event | null, _sender: TControl) {
                debugger;
                const btn = this.getComponent<TLitButton>('button1');
                if (!btn) {
                        console.warn('button1 not found in registry');
                        return;
                }
                btn!.color = 'rgb(0, 128, 128)';
                console.log('Button1 clicked!!!!');
                const app = getApplication() as TApplication;
                //const mainForm = app.getFormByName('MainForm');
                app?.showFormByName('MainForm');
                //app.replaceForm('MainForm');
        }

        button2_onclick(_ev: Event | null, _sender: TControl) {
                debugger;
                const btn = this.getComponent<TLitButton>('button2');
                if (!btn) {
                        console.warn('button2 not found in registry');
                        return;
                }
                btn!.color = 'rgb(255, 0, 0)';
                console.log('Button2 clicked!!!!');
                const app = getApplication() as TApplication;
                //const mainForm = app.getFormByName('MainForm');
                //app?.showFormByName('MainForm');
                app.popFormDestroy();
        }
}

export function registerRiriFrame() {
        if (!customElements.get('riri-frame')) {
                customElements.define('riri-frame', RiriFrame);
        }
}

export const registerFrame = registerRiriFrame;

declare global {
        interface HTMLElementTagNameMap {
                'riri-frame': RiriFrame;
        }
}
