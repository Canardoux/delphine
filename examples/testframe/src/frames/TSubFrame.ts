import { html, css, type CSSResultGroup } from 'lit';
import { TLitButton } from '@vcl/palettes/lit/TLitButton';
import { TLitCheckbox } from '@vcl/palettes/lit/TLitCheckBox';
import { TLitFrame } from '@vcl/palettes/lit/TLitFrame';
import { TLitPanel } from '@vcl/palettes/lit/TLitPanel';

export class DelphineSubFrame extends TLitFrame {
        static properties = {
                ...TLitFrame.properties,

                msg: { type: String },
                numberClicked: { type: Number }
        };

        msg = 'Caption';
        numberClicked = 50;

        static override styles: CSSResultGroup = [
                TLitFrame.styles,
                css`
                        div {
                                color: green;
                        }
                `
        ];

        render() {
                return html`
                        <div id="sub-frameCCC" data-delphine-name="sub-frameCCC" data-delphine-oncreate="onMyCreate">
                                MY-SUB-FRAME
                                <lit-panel data-delphine-name="Panel1CCC" data-delphine-component="lit-panel">
                                        <h2 id="ipo9">SUB Frame</h2>
                                        👋 Message: ${this.msg}
                                        <lit-button
                                                data-delphine-component="TLitButton"
                                                id="button-changeMessageCCC"
                                                caption="Change messageCCC"
                                                data-delphine-name="button-changeMessageCCC"
                                                @click="${this.changeMessage_onclick}"
                                                data-delphine-ondblclick=""
                                                color="blue"
                                                backgroundColor="pink"
                                                class="delphine-control delphine-button"
                                        >
                                        </lit-button>
                                        <lit-button
                                                data-delphine-component="TLitButton"
                                                id="button-incrementCCC"
                                                color="cyan"
                                                caption="Increment counterCCC"
                                                data-delphine-name="button-incrementCCC"
                                                @click="${this.increment_onclick}"
                                                @dblclick="${(ev: Event) => {
                                                        ev.stopPropagation();
                                                        console.log('dblclick on button-incrementCCC');
                                                }}"
                                                @contextmenu="${(ev: Event) => {
                                                        ev.stopPropagation();
                                                        console.log('contextmenu on button-incrementCCC');
                                                }}"
                                                @contextpopup="${(ev: Event) => {
                                                        ev.stopPropagation();
                                                        console.log('contextpopup on button-incrementCCC');
                                                }}"
                                                class="delphine-control delphine-litbutton"
                                                >Increment counter!!!</lit-button
                                        >
                                        <lit-checkbox
                                                data-delphine-component="TLitCheckbox"
                                                data-delphine-name="LitCheckboxCCC"
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
                        </div>
                `;
        }

        changeMessage_onclick(_ev: Event) {
                debugger;
                console.log('changeMessage_onclick');
                _ev.stopPropagation();
                this.msg = 'New Caption';

                const btn3 = this.getComponent<TLitCheckbox>('LitCheckboxCCC');
                btn3!.enabled = !btn3?.enabled;
                const btn2 = this.getComponent<TLitCheckbox>('button-changeMessageCCC');
                btn2!.caption = btn3?.enabled ? 'Enabled' : 'Disabled';
        }

        increment_onclick(_ev: Event) {
                debugger;
                _ev.stopPropagation();

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

                const btn = this.getComponent<TLitButton>('button-changeMessageCCC');
                btn!.caption = 'New Caption';

                const btn2 = this.getComponent<TLitButton>('button-incrementCCC');
                btn2!.caption = 'New Caption for btn2';

                console.log('Color before', btn!.color);
                btn!.color = 'red';
                btn!.width = '500px';
                btn!.backgroundColor = 'yellow';
                console.log('Color after', btn!.color);

                const panel = this.getComponent<TLitPanel>('Panel1CCC');
                panel!.backgroundColor = 'lightblue';
                panel!.color = 'red';
                //btn!.style.setProperty('color', 'red');
                //btn!.style.setProperty('width', '500px');

                const c = this.getComponent<DelphineSubFrame>('sub-frameCCC');
                c?.style.setProperty('background-color', 'yellow');
                const btn3 = this.getComponent<TLitCheckbox>('LitCheckboxCCC');
                btn3!.checked = !btn3?.checked;
                this.checkbox_onchange(new Event('change'));
        }

        checkbox_onchange(_ev: Event) {
                _ev.stopPropagation();
                const btn = this.getComponent<TLitCheckbox>('LitCheckboxCCC');
                btn!.caption = btn?.checked ? 'Checked' : 'Unchecked';
        }
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
