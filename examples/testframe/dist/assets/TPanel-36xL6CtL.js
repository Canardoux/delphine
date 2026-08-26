import{T as o,i as e,b as s}from"./LitControlElement-BHTBfLva.js";const t=class t extends o{updated(){super.updated(),this.style.setProperty("--delphine-control-color",this.color||""),this.style.setProperty("--delphine-control-background-color",this.backgroundColor||""),this.style.width=this.width||"",this.style.backgroundColor=this.backgroundColor,this.style.color=this.color,this.style.width=this.width}render(){return s`<slot></slot>`}};t.properties={...o.properties},t.styles=[o.styles,e`
                        :host {
                                display: block;
                                box-sizing: border-box;

                                padding: 4px;

                                background-color: var(--delphine-control-background-color, var(--panel-background, transparent));

                                box-shadow: var(--panel-box-shadow, none);
                                border-radius: var(--panel-border-radius, 0);
                        }
                `];let r=t;function l(){customElements.get("lit-panel")||customElements.define("lit-panel",r)}export{r as TPanel,l as registerRuntime};
