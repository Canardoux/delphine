import{T as o,i,b as n}from"./LitControlElement-GywwQSYU.js";const e=class e extends o{constructor(){super(...arguments),this.caption="Caption",this.checked=!1,this.enabled=!0}handleChange(t){t.stopPropagation();const a=t.currentTarget;this.checked=a.checked,this.dispatchEvent(new CustomEvent("change",{bubbles:!0,composed:!0}))}render(){return n`
                        <label>
                                <input class="native-checkbox" type="checkbox" .checked=${this.checked} ?disabled=${!this.enabled} @change=${this.handleChange} />

                                <span class="check-box" aria-hidden="true"></span>

                                <span class="caption">${this.caption}</span>
                        </label>
                `}};e.properties={...o.properties,caption:{type:String},checked:{type:Boolean},enabled:{type:Boolean}},e.styles=[o.styles,i`
                        :host {
                                display: inline-block;

                                vertical-align: middle;
                        }

                        label {
                                display: inline-flex;

                                align-items: center;

                                gap: 6px;

                                white-space: nowrap;

                                user-select: none;

                                cursor: default;
                        }

                        label > input.native-checkbox {
                                position: absolute;

                                width: 1px;

                                height: 1px;

                                margin: 0;

                                padding: 0;

                                opacity: 0;

                                overflow: hidden;

                                pointer-events: none;

                                appearance: none;

                                box-shadow: none;
                        }

                        .check-box {
                                position: relative;
                                display: inline-block;
                                flex: 0 0 14px;
                                width: 14px;
                                height: 14px;
                                box-sizing: border-box;

                                background: var(--checkbox-background, white);
                                box-shadow: var(--checkbox-box-shadow, inset 0 0 0 1px #808080);

                                border-radius: var(--checkbox-border-radius, 0);
                        }

                        input.native-checkbox:checked + .check-box::after {
                                content: '';
                                position: absolute;

                                left: 3px;
                                top: 2px;

                                width: 7px;
                                height: 4px;

                                border-left: 2px solid var(--checkbox-check-color, currentColor);

                                border-bottom: 2px solid var(--checkbox-check-color, currentColor);

                                transform: rotate(-45deg);
                                box-sizing: border-box;
                        }

                        input.native-checkbox:checked + .check-box {
                                background: var(--checkbox-checked-background, var(--checkbox-background, white));

                                box-shadow: var(--checkbox-checked-box-shadow, var(--checkbox-box-shadow, none));
                        }

                        input.native-checkbox:focus-visible + .check-box {
                                outline: 1px dotted currentColor;

                                outline-offset: 2px;
                        }

                        input.native-checkbox:disabled + .check-box {
                                background: var(--checkbox-disabled-background, var(--checkbox-background, white));
                        }

                        input.native-checkbox:disabled:checked + .check-box::after {
                                border-color: var(--checkbox-disabled-check-color, var(--checkbox-check-color, currentColor));
                        }

                        input.native-checkbox:disabled ~ .caption {
                                color: var(--button-shadow);

                                text-shadow: 1px 1px var(--button-highlight);
                        }
                `];let c=e;function h(){customElements.get("lit-checkbox")||customElements.define("lit-checkbox",c)}export{c as TCheckBox,h as registerRuntime};
