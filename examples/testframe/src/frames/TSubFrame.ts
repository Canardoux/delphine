import { html, css, type CSSResultGroup } from 'lit';
import { TButton } from '@vcl/palettes/standard/TButton';
import { TCheckBox } from '@vcl/palettes/standard/TCheckBox';
import { TFrame } from '@vcl/palettes/standard/TFrame';
import { TPanel } from '@vcl/palettes/standard/TPanel';
import { TLitControlElement } from '@vcl/LitControlElement';

export class DelphineSubFrame extends TFrame {
        static properties = {
                ...TFrame.properties,
                // <delphine:properties>
                msg: { type: String },
                numberClicked: { type: Number }
                // </delphine:properties>
        };

        msg = 'Caption';
        numberClicked = 50;

        static override styles: CSSResultGroup = [
                TFrame.styles,
                // <delphine:styles>
                css`
                        delphine-frame {
                                color: green;
                        }
                `
                // </delphine:styles>
        ];
        render() {
                return this.layout;
        }

        // <delphine:layout>
        get layout() {
                return html`
                        <delphine-frame id="sub-frameCCC" data-delphine-name="subFrameCCC" data-delphine-oncreate="onMyCreate">
                                MY-SUB-FRAME
                                <lit-panel data-delphine-name="panel1CCC" data-delphine-component="lit-panel">
                                        <h2 id="ipo9">SUB Frame</h2>
                                        👋 Message: ${this.msg}
                                        <lit-button
                                                data-delphine-component="lit-button"
                                                id="button-changeMessageCCC"
                                                caption="Change messageCCC"
                                                data-delphine-name="buttonChangeMessageCCC"
                                                data-delphine-onclick="changeMessage_onclick"
                                                color="cyan"
                                                backgroundColor="pink"
                                                class="delphine-control delphine-button"
                                        >
                                        </lit-button>
                                        <lit-button data-delphine-component="lit-button" id="button-incrementCCC" caption="Increment counterCCC" data-delphine-name="buttonIncrementCCC" data-delphine-onclick="increment_onclick" class="delphine-control delphine-litbutton"
                                                >Increment counter!!!</lit-button
                                        >
                                        <lit-checkbox
                                                data-delphine-component="lit-checkbox"
                                                data-delphine-name="litCheckboxCCC"
                                                data-delphine-popupmenu=""
                                                data-delphine-onclick="LitCheckbox_onclick"
                                                data-delphine-ondblclick=""
                                                data-delphine-oncontextpopup=""
                                                caption="THE CAPTION FROM GRAPESJS"
                                                id="ibu0nCCC"
                                                class="delphine-control delphine-litcheckbox"
                                                @change="${this.checkbox_onchange}"
                                        >
                                        </lit-checkbox>
                                        <p>Number of clicks: ${this.numberClicked}</p>
                                </lit-panel>
                        </delphine-frame>
                `;
        }
        // </delphine:layout>

        // <delphine:components>
        // get subFrameCCC(): DelphineSubFrame {
        //         return this.getComponent<DelphineSubFrame>('subFrameCCC')!;
        // }

        get buttonChangeMessageCCC(): TButton {
                return this.getComponent<TButton>('buttonChangeMessageCCC')!;
        }

        get buttonIncrementCCC(): TButton {
                return this.getComponent<TButton>('buttonIncrementCCC')!;
        }

        get litCheckboxCCC(): TCheckBox {
                return this.getComponent<TCheckBox>('litCheckboxCCC')!;
        }

        get panel1CCC(): TPanel {
                return this.getComponent<TPanel>('panel1CCC')!;
        }

        // </delphine:components>

        // <delphine:handlers>
        changeMessage_onclick(_ev: Event, _sender: TLitControlElement) {
                debugger;
                console.log('changeMessage_onclick');
                //_ev.stopPropagation();
                this.msg = 'New Caption';

                //const btn3 = this.getComponent<TCheckBox>('litCheckboxCCC');
                this.litCheckboxCCC.enabled = !this.litCheckboxCCC.enabled;
                //const btn2 = this.getComponent<TCheckBox>('button-changeMessageCCC');
                this.buttonChangeMessageCCC.caption = this.litCheckboxCCC.enabled ? 'Enabled' : 'Disabled';
        }

        increment_onclick(_ev: Event, _sender: TLitControlElement) {
                debugger;
                //_ev.stopPropagation();

                // Optionnel si vous voulez aussi bloquer les listeners en capture suivants
                //_ev.stopImmediatePropagation();

                ++this.numberClicked;
                this.dispatchEvent(
                        new CustomEvent<number>('counter-change', {
                                detail: this.numberClicked,
                                bubbles: true,
                                composed: true
                        })
                );

                //const btn = this.getComponent<TButton>('button-changeMessageCCC');
                this.buttonChangeMessageCCC.caption = 'New Caption';

                //const btn2 = this.getComponent<TButton>('button-incrementCCC');
                this.buttonIncrementCCC.caption = 'New Caption for btn2';

                this.buttonChangeMessageCCC.color = 'red';
                this.buttonChangeMessageCCC.width = '500px';
                this.buttonChangeMessageCCC.backgroundColor = 'yellow';

                //const panel = this.getComponent<TPanel>('Panel1CCC');
                //this.panel1CCC.backgroundColor = 'lightblue';
                //this.panel1CCC.color = 'red';

                //const c = this.getComponent<DelphineSubFrame>('sub-frameCCC');
                //this.subFrameCCC.style.setProperty('background-color', 'yellow');
                //this.style.color = 'magenta';
                console.log('Color...', this.color);
                this.color = 'orange';

                //const btn3 = this.getComponent<TCheckBox>('LitCheckboxCCC');
                this.litCheckboxCCC.checked = !this.litCheckboxCCC.checked;
                this.checkbox_onchange(new Event('change')); // Lit does not call this automatically when changing the checked property programmatically
        }

        checkbox_onchange(_ev: Event) {
                //_ev.stopPropagation();
                //const btn = this.getComponent<TCheckBox>('LitCheckboxCCC');
                this.litCheckboxCCC.caption = this.litCheckboxCCC.checked ? 'Checked' : 'Unchecked';
        }

        // </delphine:handlers>
}

//

export function registerSubFrame() {
        if (!customElements.get('sub-frame')) {
                customElements.define('sub-frame', DelphineSubFrame);
        }
}

export const registerFrame = registerSubFrame;

declare global {
        interface HTMLElementTagNameMap {
                'sub-frame': DelphineSubFrame;
        }
}
