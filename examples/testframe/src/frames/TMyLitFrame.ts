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

                msg: { type: String },
                subCounter: { type: Number, state: true },
                myCounter: { type: Number, state: true }
        };
        // static styles = css`
        //         div {
        //                 color: red;
        //         }
        // `;

        msg = 'Caption';
        //subFrame = this.getComponent<DelphineSubFrame>('sub-frameBBB')!;
        //subCounter = this.subFrame ? this.subFrame.numberClicked : 20;
        subCounter: number = 20;
        myCounter: number = 30;
        constructor() {
                super();
        }

        render() {
                return html`
                        <div id="hello-frameBBB" data-delphine-name="hello-frameBBB" data-delphine-oncreate="onMyCreateBBB">
                                <lit-panel data-delphine-name="Panel1BBB" id="Panel1BBB" data-delphine-component="lit-panel">
                                        <h2 id="ipo99">Frame</h2>
                                        👋 Message: ${this.msg}

                                        <lit-button
                                                data-delphine-component="TButton"
                                                id="button-a"
                                                caption="Show Riri"
                                                data-delphine-name="showriri"
                                                data-delphine-onclick="showriri_onclick"
                                                data-delphine-ondblclick=""
                                                data-delphine-popupmenu=""
                                                data-delphine-oncontextpopup=""
                                                class="delphine-control delphine-button"
                                        >
                                        </lit-button>
                                        <lit-button
                                                data-delphine-component="TButton"
                                                id="button-b"
                                                caption="push Riri"
                                                data-delphine-name="pushriri"
                                                data-delphine-onclick="pushriri_onclick"
                                                data-delphine-ondblclick=""
                                                data-delphine-popupmenu=""
                                                data-delphine-oncontextpopup=""
                                                class="delphine-control delphine-button"
                                        >
                                        </lit-button>

                                        <lit-button
                                                data-delphine-component="TButton"
                                                data-delphine-name="Modern"
                                                data-delphine-onclick="modern_onclick"
                                                caption="Modern"
                                                id="itiqa"
                                                data-delphine-ondblclick=""
                                                data-delphine-popupmenu=""
                                                data-delphine-oncontextpopup=""
                                                class="delphine-control delphine-button"
                                        >
                                        </lit-button>
                                        <lit-button
                                                data-delphine-component="TButton"
                                                data-delphine-name="Win95"
                                                data-delphine-onclick="Win95_onclick"
                                                caption="Win95"
                                                id="ipm9k"
                                                data-delphine-ondblclick=""
                                                data-delphine-popupmenu=""
                                                data-delphine-oncontextpopup=""
                                                class="delphine-control delphine-button"
                                        >
                                        </lit-button>
                                        <lit-button
                                                data-delphine-component="TButton"
                                                data-delphine-name="Win98"
                                                data-delphine-onclick="Win98_onclick"
                                                caption="Win98"
                                                data-delphine-ondblclick=""
                                                id="i90r7"
                                                data-delphine-popupmenu=""
                                                data-delphine-oncontextpopup=""
                                                class="delphine-control delphine-button"
                                        >
                                        </lit-button>
                                        <lit-button
                                                data-delphine-component="TButton"
                                                data-delphine-name="Cde"
                                                data-delphine-onclick="cde_onclick"
                                                caption="Cde"
                                                data-delphine-ondblclick=""
                                                id="iimad"
                                                data-delphine-popupmenu=""
                                                data-delphine-oncontextpopup=""
                                                class="delphine-control delphine-button"
                                        >
                                        </lit-button>
                                        <lit-button
                                                data-delphine-component="TButton"
                                                data-delphine-name="Motif"
                                                data-delphine-onclick="Motif_onclick"
                                                caption="Motif"
                                                data-delphine-ondblclick=""
                                                data-delphine-oncontextpopup=""
                                                data-delphine-caption="Motif"
                                                id="iyccw"
                                                class="delphine-control delphine-button"
                                        >
                                        </lit-button>
                                        <p>Number of clicks: ${this.subCounter}</p>
                                        <lit-button data-delphine-component="TButton" data-delphine-name="incrementSubCounter" data-delphine-onclick="incrementSubCounter" caption="Incr. Counter" id="fgju" class="delphine-control delphine-button"> </lit-button>
                                        <p>myCounter: ${this.myCounter}</p>
                                        <lit-button data-delphine-component="TButton" data-delphine-name="incrementMyCounter" data-delphine-onclick="incrementMyCounter" caption="Incr. MyCounter" id="fgjuqd" class="delphine-control delphine-button"> </lit-button>
                                </lit-panel>

                                <sub-frame data-delphine-component="sub-frame" id="sub-frameBBB" data-delphine-name="sub-frameBBB" @counter-change="${this.counterChanged}" .numberClicked=${this.myCounter} data-delphine-oncreate="onMyCreate"></sub-frame>
                        </div>
                `;
        }

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

        Win95_onclick(_ev: Event | null, _sender: any) {
                const app = getApplication();
                app!.setTheme('win95');
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
                console.log('Button1 context popup!!!!'); // TODO: handle Button1_oncontextpopup
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
