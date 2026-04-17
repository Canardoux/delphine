import{a as s,b as r,T as m}from"./Application-CXxZQVca.js";const l=`<delphine version="1.0" class="HelloFrame" name="MainForm"></delphine>

<style>
* {
        box-sizing: border-box;
}

#ipo9 {
        background-color: rgb(228, 175, 175);
}

body {
        margin: 0;
}

body {
        margin-top: 0px;
        margin-right: 0px;
        margin-bottom: 0px;
        margin-left: 0px;
}
</style>

<template>
<div
        data-delphine-props='{
                "name": "hello-frame"
        }'
        id="hello-frame"
        data-delphine-component="hello-frame"
        data-delphine-name="hello-frame"
        data-delphine-oncreate="onMyCreate"
>
        <h2 id="ipo9">Frame</h2>
        👋 Message!
        <button
                data-delphine-component="TButton"
                id="button-changeMessage"
                data-delphine-caption="Change message"
                data-delphine-name="button-changeMessage"
                data-delphine-onclick="changeMessage_onclick"
        >
                Change Message
        </button>
        <button
                data-delphine-component="TButton"
                id="myframeButton"
                data-delphine-caption="Delphine HTML caption"
                data-delphine-name="myframeButton"
                data-delphine-onclick="myframeButton_onclick"
        >
                Titi
        </button>
</div>
</template>
`;function c(t){const e=t.match(/<template[^>]*>([\s\S]*?)<\/template>/i);return e?e[1]??"":""}const d=c(l);class p extends r{changeMessage_onclick(e,n){debugger;const o=this.componentRegistry.get("myframeButton");o.caption="New message"}myframeButton_onclick(e,n){debugger;this.emit("MessageChanged",{message:"New message from Frame"})}}const a=class a extends s{constructor(e,n){super(e,n),this.schema={name:"hello-frame",component:d,label:"Hello Frame",category:"Frame",icon:void 0,isContainer:!0,instanceName:"helloFrame",tagName:"div",props:{message:{kind:"string",default:"Hello depuis Delphine"},count:{kind:"number",default:0},enabled:{kind:"boolean",default:!0}}}}create(e,n,o){return new p(a.metaclass,e,n,o)}defProps(){return[]}getSchema(){return this.schema}};a.metaclass=new a(s.metaclass,"hello-frame");let i=a;class u extends m{async initialize(){debugger;this.typeRegistry?.register(i.metaclass),this.mainForm=await this.createFormByName("MainForm"),this.riri=await this.createFormByName("Riri")}run(){this.mainForm.show()}}export{u as default};
