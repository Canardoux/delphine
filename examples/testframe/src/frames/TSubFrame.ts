// frames/TSubFrame.ts

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

        // <delphine:property-values>
        msg = 'Caption';
        numberClicked = 50;
        color = 'green';
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
                return html`
                        <lit-panel data-delphine-component="TPanel" data-delphine-name="panel1CCC" id="iryw"
                                ><lit-button data-delphine-component="TButton" data-delphine-name="buttonChangeMessageCCC" color="red" backgroundcolor="pink" caption="this.numberClicked" data-delphine-onclick="changeMessage_onclick" id="iyiz"> </lit-button
                                ><lit-button data-delphine-component="TButton" data-delphine-name="buttonIncrementCCC" caption="Increment counterCCC: ${this.numberClicked}" data-delphine-onclick="increment_onclick" id="izif"> </lit-button
                                ><lit-checkbox data-delphine-component="TCheckBox" data-delphine-name="litCheckboxCCC" caption="THE CAPTION FROM GRAPESJS" data-delphine-onclick="LitCheckbox_onclick" id="imsp"> </lit-checkbox></lit-panel
                        ><lit-button data-delphine-component="TButton" data-delphine-name="Button1" color="" backgroundcolor="" caption="The Caption" enabled="true" id="igqba"> </lit-button>
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
                this.color = 'magenta';

                //const btn3 = this.getComponent<TCheckBox>('LitCheckboxCCC');
                this.litCheckboxCCC.checked = !this.litCheckboxCCC.checked;
                this.checkbox_onchange(new Event('change')); // Lit does not call this automatically when changing the checked property programmatically
        }

        checkbox_onchange(_ev: Event) {
                //_ev.stopPropagation();
                //const btn = this.getComponent<TCheckBox>('LitCheckboxCCC');
                this.litCheckboxCCC.caption = this.litCheckboxCCC.checked ? 'Checked' : 'Unchecked';
        }

        LitCheckbox_onclick(_ev: Event) {
                console.log('LitCheckbox_onclick()');
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
