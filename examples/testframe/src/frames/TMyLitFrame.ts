//import type { ComponentSchema } from '@vcl/IComponent';
import { TFrame } from '@vcl/palettes/standard/TFrame';
import { TForm } from '@vcl/Form';
//import { TControl } from '@vcl/Control';
import { TButton } from '@vcl/palettes/standard/TButton';
//import type { PropSpec } from '@vcl/IComponent';
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TLitControlElement } from '@vcl/LitControlElement';
//import { TMetaSubFrame } from './TSubFrame';
//import { TFrame } from '@vcl/palettes/standard/TFrame';
//import { TButton } from '@vcl/palettes/standard/TButton';
//import { TColor } from '@vcl/Color';
import { getApplication } from '@vcl/IApplication';
import { TApplication } from '@vcl/Application';
import { TCheckBox } from '@vcl/palettes/standard/TCheckBox';
import { TPanel } from '@vcl/palettes/standard/TPanel';
import { DelphineSubFrame } from './TSubFrame';

export class DelphineMyLitFrame extends TFrame {
        static properties = {
                ...TFrame.properties,
                // <delphine:properties>
                msg: { type: String },
                subCounter: { type: Number, state: true },
                myCounter: { type: Number, state: true }
                // </delphine:properties>
        };
        // <delphine:styles>
        // css`
        //         delphine-frame {
        //                 color: green;
        //         }
        // `
        // </delphine:styles>

        // <delphine:property-values>
        msg = 'Caption';
        //subFrame = this.getComponent<DelphineSubFrame>('sub-frameBBB')!;
        //subCounter = this.subFrame ? this.subFrame.numberClicked : 20;
        subCounter: number = 20;
        myCounter: number = 30;
        // </delphine:property-values>

        constructor() {
                super();
        }

        render() {
                return this.layout;
        }
        // <delphine:layout>
        get layout() {
                return html`
                        <lit-panel data-delphine-component="TPanel" data-delphine-name="Panel1BBB" id="iezh"
                                ><lit-button data-delphine-component="TButton" data-delphine-name="showriri" caption="Show Riri" data-delphine-onclick="showriri_onclick" id="ii4f"> </lit-button
                                ><lit-button data-delphine-component="TButton" data-delphine-name="pushriri" caption="push Riri" data-delphine-onclick="pushriri_onclick" id="ishi"> </lit-button
                                ><lit-button data-delphine-component="TButton" data-delphine-name="Modern" caption="Modern" data-delphine-onclick="modern_onclick" id="izma"> </lit-button
                                ><lit-button data-delphine-component="TButton" data-delphine-name="Win95" caption="Win95" data-delphine-onclick="Win95_onclick" id="izvtj"> </lit-button
                                ><lit-button data-delphine-component="TButton" data-delphine-name="Win98" caption="Win98" data-delphine-onclick="Win98_onclick" id="ip2lh"> </lit-button
                                ><lit-button data-delphine-component="TButton" data-delphine-name="Cde" caption="Cde" data-delphine-onclick="cde_onclick" id="ivnif"> </lit-button
                                ><lit-button data-delphine-component="TButton" data-delphine-name="Motif" caption="Motif" data-delphine-onclick="Motif_onclick" id="iovp9"> </lit-button
                                ><lit-button data-delphine-component="TButton" data-delphine-name="incrementSubCounter" caption="Incr. Counter" data-delphine-onclick="incrementSubCounter" id="ifyni"> </lit-button
                                ><lit-button data-delphine-component="TButton" data-delphine-name="incrementMyCounter" caption="Incr. MyCounter" data-delphine-onclick="incrementMyCounter" id="il86u"> </lit-button></lit-panel
                        ><sub-frame data-delphine-component="TSubFrame" data-delphine-name="sub-frameBBB" id="i4ocj"> </sub-frame
                        ><lit-button data-delphine-component="TButton" data-delphine-name="Button1" color="" backgroundcolor="" caption="The Caption" enabled="true" data-delphine-onclick="Button1_onclick" id="iuh2l"> </lit-button>
                `;
                // </delphine:layout>
        }

        // <delphine:components>
        // </delphine:components>

        // <delphine:handlers>

        private counterChanged(ev: CustomEvent<number>): void {
                this.subCounter = ev.detail;
                this.myCounter = ev.detail;
        }

        private incrementSubCounter(ev: Event): void {
                const subFrame: DelphineSubFrame = this.getComponent<DelphineSubFrame>('sub-frameBBB')!;

                ++subFrame!.numberClicked;
                this.subCounter = subFrame!.numberClicked;
                this.myCounter = subFrame!.numberClicked;
        }

        private incrementMyCounter(ev: Event): void {
                const subFrame: DelphineSubFrame = this.getComponent<DelphineSubFrame>('sub-frameBBB')!;

                ++this.myCounter;
                subFrame!.numberClicked = this.myCounter;
                this.subCounter = subFrame!.numberClicked;
        }

        Panel1BBB_onclick(ev: Event): void {
                console.log('helloframeBBB_onclick');
        }

        private helloframeBBB_onclick(ev: Event): void {
                console.log('helloframeBBB_onclick');
        }

        showriri_onclick(_ev: Event | null, _sender: any) {
                debugger;
                const btn = this.getComponent<TButton>('showriri');
                if (!btn) {
                        console.warn('button-a not found in registry');
                        return;
                }
                btn!.color = 'rgb(255, 255, 2';
                console.log('showriri_onclick clicked!!!!');
                const app = getApplication() as TApplication;
                app.createAndShow('RiriForm');
        }

        pushriri_onclick(_ev: Event | null, _sender: any) {
                debugger;
                const btn = this.getComponent<TButton>('pushriri');
                if (!btn) {
                        console.warn('button-b not found in registry');
                        return;
                }
                btn!.color = 'rgb(0, 128, 0)';
                btn!.caption = 'PUSH to Riri!';
                console.log('Button2 clicked!!!!');
                const app = getApplication() as TApplication;
                app.createAndPushForm('RiriForm');
        }

        chk_onclick(_ev: Event | null, _sender: any) {
                const btn = this.getComponent<TCheckBox>('chk3');
                btn!.caption = btn?.checked ? 'Checked' : 'unchecked';
        }

        mainForm_onclick(_ev: Event | null, _sender: any) {
                console.log('Form clicked!!!!');
                const panel = this.getComponent<TPanel>('myPanel');
                if (!panel) {
                        console.warn('myPanel not found in registry');
                        return;
                }
                //panel!.backgroundColor = TColor.rgb(54, 127, 173);
        }

        button1_onclick(_ev: Event | null, _sender: any) {
                const btn = this.getComponent<TButton>('button1');
                if (!btn) {
                        console.warn('button1 not found in registry');
                        return;
                }
                btn!.color = 'rgb(0, 0, 255)';
                btn!.caption = 'MIMI';
                btn!.enabled = false;
                console.log('Button1 clicked!!!!');
        }

        zaza_onclick(_ev: Event | null, _sender: any) {
                const btn = this.getComponent<TButton>('buttonx');
                btn!.color = 'rgb(0, 255, 0)';
                console.log('zazaVue clicked!!!!');
        }

        modern_onclick(_ev: Event | null, _sender: any) {
                const app = getApplication();
                app!.setTheme('modern');
        }

        Win98_onclick(_ev: Event | null, _sender: any) {
                const app = getApplication();
                app!.setTheme('win98');
        }

        cde_onclick(_ev: Event | null, _sender: any) {
                const app = getApplication();
                app!.setTheme('cde');
        }

        Button1_ondblclick(_ev: Event | null, _sender: any) {
                console.log('Button1 double clicked!!!!');
        }

        Button1_oncontextpopup(_ev: Event | null, _sender: any) {
                console.log('Button1 context popup!!!!');
        }

        Motif_onclick(_ev: Event | null, _sender: any) {
                console.log('Motif clicked!!!!');
                const app = getApplication();
                app!.setTheme('motif');
        }

        button1_ondblclick(_ev: Event | null, _sender: any) {
                // TODO: handle button1_ondblclick
        }

        ButtonEnabled_onclick(_ev: Event | null, _sender: any) {
                const btn = this.getComponent<TCheckBox>('LitCheckbox');
                btn!.enabled = !btn?.enabled;
                console.log(` enabled: ${btn!.enabled}`);
        }

        ButtonChecked_onclick(_ev: Event | null, _sender: any) {
                const btn = this.getComponent<TCheckBox>('LitCheckbox');
                btn!.checked = !btn?.checked;
                console.log(` checked: ${btn!.checked}`);
        }

        LitCheckbox_onclick(_ev: Event | null, _sender: any) {
                const btn = this.getComponent<TCheckBox>('LitCheckbox');
                console.log(`LitCheckbox enabled: ${btn!.enabled}`);
                console.log(`LitCheckbox checked: ${btn!.checked}`);
        }

        ChangeColor_onclick(_ev: Event | null, _sender: any) {
                const btn = this.getComponent<TCheckBox>('LitCheckbox');
                btn!.color = 'rgb(255, 0, 255)';
        }

        Win95_onclick(_ev: Event | null, _sender: any): void {}

        toto(_ev: Event | null, _sender: any): void {}
        // </delphine:handlers>
}
//customElements.define('my-lit-frame', DelphineMyLitFrame);

// export class TMetaMyLitFrame extends TMetaLitFrame {
//         static metaclass = new TMetaMyLitFrame(TMetaFrame.metaclass, 'lit-frame');

//         protected constructor(superClass: TMetaFrame<TFrame>, name: string) {
//                 super(superClass, name);
//         }
// }
// export const delphineMeta = TMetaMyLitFrame.metaclass;

export function registerMyLitFrame() {
        if (!customElements.get('my-lit-frame')) {
                customElements.define('my-lit-frame', DelphineMyLitFrame);
        }
}

export const registerFrame = registerMyLitFrame;

declare global {
        interface HTMLElementTagNameMap {
                'my-lit-frame': DelphineMyLitFrame;
        }
}
