import type { ComponentSchema } from '@vcl/IComponent';
import { TFrame, TMetaFrame } from '@vcl/palettes/standard/TFrame';
import { TForm } from '@vcl/Form';
import { TControl } from '@vcl/Control';
import { TButton } from '@vcl/palettes/standard/TButton';
import type { PropSpec } from '@vcl/IComponent';
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TLitControlElement } from '@vcl/LitControlElement';
//import { TMetaSubFrame } from './TSubFrame';
import { TLitFrame } from '@vcl/palettes/lit/TLitFrame';
import { TLitButton } from '@vcl/palettes/lit/TLitButton';
//import { TColor } from '@vcl/Color';
import { getApplication } from '@vcl/IApplication';
import { TApplication } from '@vcl/Application';
import { TLitCheckbox } from '@vcl/palettes/lit/TLitCheckBox';
import { TLitPanel } from '@vcl/palettes/lit/TLitPanel';
import { DelphineSubFrame } from './TSubFrame';

export class DelphineMyLitFrame extends TLitFrame {
        static properties = {
                ...TLitFrame.properties,

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
                        <div
                                id="hello-frameBBB"
                                data-delphine-name="hello-frameBBB"
                                data-delphine-oncreate="onMyCreateBBB"
                                @click="${(ev: Event) => {
                                        ev.stopPropagation();
                                        console.log('click on hello-frameBBB');
                                }}"
                                @dblclick="${(ev: Event) => {
                                        ev.stopPropagation();
                                        console.log('dblclick on hello-frameBBB');
                                }}"
                                @contextmenu="${(ev: Event) => {
                                        ev.stopPropagation();
                                        console.log('contextmenu on hello-frameBBB');
                                }}"
                                @contextpopup="${(ev: Event) => {
                                        ev.stopPropagation();
                                        console.log('contextpopup on hello-frameBBB');
                                }}"
                        >
                                <lit-panel data-delphine-name="Panel1BBB" data-delphine-component="lit-panel">
                                        <h2 id="ipo9">Frame</h2>
                                        👋 Message: ${this.msg}

                                        <lit-button
                                                data-delphine-component="TButton"
                                                id="button-a"
                                                caption="Show Riri"
                                                data-delphine-name="showriri"
                                                @click="${this.showriri_onclick}"
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
                                                @click="${this.pushriri_onclick}"
                                                data-delphine-ondblclick=""
                                                data-delphine-popupmenu=""
                                                data-delphine-oncontextpopup=""
                                                class="delphine-control delphine-button"
                                        >
                                        </lit-button>

                                        <lit-button
                                                data-delphine-component="TButton"
                                                data-delphine-name="Modern"
                                                @click="${this.modern_onclick}"
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
                                                @click="${this.Win95_onclick}"
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
                                                @click="${this.Win98_onclick}"
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
                                                @click="${this.cde_onclick}"
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
                                                @click="${this.Motif_onclick}"
                                                caption="Motif"
                                                data-delphine-ondblclick=""
                                                data-delphine-oncontextpopup=""
                                                data-delphine-caption="Motif"
                                                id="iyccw"
                                                class="delphine-control delphine-button"
                                        >
                                        </lit-button>
                                        <p>Number of clicks: ${this.subCounter}</p>
                                        <lit-button data-delphine-component="TButton" data-delphine-name="incrementSubCounter" @click="${this.incrementSubCounter}" caption="Incr. Counter" id="fgju" class="delphine-control delphine-button"> </lit-button>
                                        <p>myCounter: ${this.myCounter}</p>
                                        <lit-button data-delphine-component="TButton" data-delphine-name="incrementMyCounter" @click="${this.incrementMyCounter}" caption="Incr. MyCounter" id="fgjuqd" class="delphine-control delphine-button"> </lit-button>
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

        showriri_onclick(_ev: Event | null, _sender: TControl) {
                debugger;
                const btn = this.componentRegistry.get('showriri') as TLitButton;
                if (!btn) {
                        console.warn('button-a not found in registry');
                        return;
                }
                btn!.color = 'rgb(255, 255, 2';
                console.log('Button1 clicked!!!!');
                const app = getApplication() as TApplication;
                app.createAndShow('Riri');
        }

        pushriri_onclick(_ev: Event | null, _sender: TControl) {
                debugger;
                const btn = this.componentRegistry.get('pushriri') as TLitButton;
                if (!btn) {
                        console.warn('button-b not found in registry');
                        return;
                }
                btn!.color = 'rgb(0, 128, 0)';
                btn!.caption = 'PUSH to Riri!';
                console.log('Button2 clicked!!!!');
                const app = getApplication() as TApplication;
                app.createAndPushForm('Riri');
        }

        chk_onclick(_ev: Event | null, _sender: TControl) {
                const btn = this.componentRegistry.get('chk3') as TLitCheckbox;
                btn!.caption = btn?.checked ? 'Checked' : 'unchecked';
        }

        mainForm_onclick(_ev: Event | null, _sender: TControl) {
                console.log('Form clicked!!!!');
                const panel = this.componentRegistry.get('myPanel') as TLitPanel;
                if (!panel) {
                        console.warn('myPanel not found in registry');
                        return;
                }
                //panel!.backgroundColor = TColor.rgb(54, 127, 173);
        }

        button1_onclick(_ev: Event | null, _sender: TControl) {
                const btn = this.componentRegistry.get('button1') as TLitButton;
                if (!btn) {
                        console.warn('button1 not found in registry');
                        return;
                }
                btn!.color = 'rgb(0, 0, 255)';
                btn!.caption = 'MIMI';
                btn!.enabled = false;
                console.log('Button1 clicked!!!!');
        }

        zaza_onclick(_ev: Event | null, _sender: TControl) {
                const btn = this.componentRegistry.get('buttonx') as TLitButton;
                btn!.color = 'rgb(0, 255, 0)';
                console.log('zazaVue clicked!!!!');
        }

        modern_onclick(_ev: Event | null, _sender: TControl) {
                const app = getApplication();
                app!.setTheme('modern');
        }

        Win95_onclick(_ev: Event | null, _sender: TControl) {
                const app = getApplication();
                app!.setTheme('win95');
        }

        Win98_onclick(_ev: Event | null, _sender: TControl) {
                // TODO: handle Win98_onclick
                const app = getApplication();
                app!.setTheme('win98');
        }

        cde_onclick(_ev: Event | null, _sender: TControl) {
                const app = getApplication();
                app!.setTheme('cde');
        }

        Button1_ondblclick(_ev: Event | null, _sender: TControl) {
                console.log('Button1 double clicked!!!!');
        }

        Button1_oncontextpopup(_ev: Event | null, _sender: TControl) {
                console.log('Button1 context popup!!!!'); // TODO: handle Button1_oncontextpopup
        }

        Motif_onclick(_ev: Event | null, _sender: TControl) {
                // TODO: handle Button1_onclick
                console.log('Motif clicked!!!!');
                const app = getApplication();
                app!.setTheme('motif');
        }

        button1_ondblclick(_ev: Event | null, _sender: TControl) {
                // TODO: handle button1_ondblclick
        }

        Button1_onclick(_ev: Event | null, _sender: TControl) {
                // TODO: handle Button1_onclick
        }

        ButtonEnabled_onclick(_ev: Event | null, _sender: TControl) {
                // TODO: handle ButtonEnabled_onclick
                const btn = this.componentRegistry.get('LitCheckbox') as TLitButton;
                btn.enabled = !btn?.enabled;
                console.log(` enabled: ${btn.enabled}`);
        }

        ButtonChecked_onclick(_ev: Event | null, _sender: TControl) {
                // TODO: handle ButtonChecked_onclick
                const btn = this.componentRegistry.get('LitCheckbox') as TLitCheckbox;
                btn.checked = !btn?.checked;
                console.log(` checked: ${btn.checked}`);
        }

        LitCheckbox_onclick(_ev: Event | null, _sender: TControl) {
                // TODO: handle LitCheckbox_onclick
                const btn = this.componentRegistry.get('LitCheckbox') as TLitCheckbox;
                console.log(`LitCheckbox enabled: ${btn.enabled}`);
                console.log(`LitCheckbox checked: ${btn.checked}`);
        }

        ChangeColor_onclick(_ev: Event | null, _sender: TControl) {
                // TODO: handle ChangeColor_onclick
                const btn = this.componentRegistry.get('LitCheckbox') as TLitCheckbox;
                btn.color = 'rgb(255, 0, 255)';
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
