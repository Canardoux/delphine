import{T as o,i as e,b as a}from"./LitControlElement-GywwQSYU.js";const t=class t extends o{constructor(){super(...arguments),this.caption="The Caption",this.enabled=!0}render(){return a`
                        <button style=${this.getControlStyle()} ?disabled=${!this.enabled}>
                                <span class="caption">${this.caption}</span>
                        </button>
                `}};t.properties={...o.properties,caption:{type:String},enabled:{type:Boolean}},t.styles=[o.styles,e`
                        :host {
                                display: inline-block;
                                vertical-align: middle;
                        }

                        button {
                                box-sizing: border-box;
                                border: none;
                                transform: translateY(0);

                                min-width: 75px;
                                min-height: 30px;
                                padding: 0 12px;

                                color: inherit;
                                width: inherit;

                                font-family: var(--control-font-family, Arial, sans-serif);

                                font-size: var(--control-font-size, 11px);

                                background: var(--button-background, ButtonFace);

                                box-shadow: var(--button-box-shadow, none);

                                border-radius: var(--button-border-radius, 0);
                        }

                        button:not(:disabled):active {
                                background: var(--button-active-background, var(--button-background, ButtonFace));

                                box-shadow: var(--button-active-box-shadow, var(--button-box-shadow, none));
                                transform: translateY(var(--button-active-translate-y, 0));

                                border-radius: var(--button-border-radius, 0);
                        }

                        button:not(:disabled):active .caption {
                                transform: translate(var(--button-active-content-x, 0), var(--button-active-content-y, 0));
                        }

                        button .caption {
                                display: inline-block;
                        }

                        button:focus-visible {
                                outline: 1px dotted currentColor;
                                outline-offset: -4px;
                        }

                        button:disabled {
                                color: var(--button-shadow, GrayText);
                        }
                `];let n=t;function i(){customElements.get("lit-button")||customElements.define("lit-button",n)}export{n as TButton,i as registerRuntime};
