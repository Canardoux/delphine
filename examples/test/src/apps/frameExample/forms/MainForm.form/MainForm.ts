import { TForm, TControl, TButton, TColor, TApplication, TPanel, TPluginHost } from '@vcl';
import { getApplication } from '@vcl/IApplication';

import './MainForm.css';
import { HelloFrame } from '../../frames/HelloFrame.frame/HelloFrame';
import { THostFrame } from '@vcl/Frame';

export default class MainForm extends TForm {
        buttona_onclick(_ev: Event | null, _sender: TControl) {
                const btn = this.componentRegistry.get<TButton>('button-a');
                if (!btn) {
                        console.warn('button-a not found in registry');
                        return;
                }
                btn!.color = TColor.rgb(255, 255, 2);
                console.log('Button1 clicked!!!!');
                const app = getApplication() as TApplication;
                app.createAndShow('Riri');
                //app.replaceForm('Riri');
        }

        buttonb_onclick(_ev: Event | null, _sender: TControl) {
                const btn = this.componentRegistry.get<TButton>('button-b');
                if (!btn) {
                        console.warn('button-b not found in registry');
                        return;
                }
                btn!.color = TColor.rgb(0, 128, 0);
                btn!.caption = 'PUSH to Riri!';
                console.log('Button2 clicked!!!!');
                const app = getApplication() as TApplication;
                //app.createAndShow('Riri');
                app.createAndPushForm('Riri');
        }

        mainForm_onclick(_ev: Event | null, _sender: TControl) {
                console.log('Form clicked!!!!');
                const panel = this.componentRegistry.get<TPanel>('myPanel');
                if (!panel) {
                        console.warn('myPanel not found in registry');
                        return;
                }
                //btn.color = TColor.rgb(0, 0, 255);
                panel!.backgroundColor = TColor.rgb(54, 127, 173);
        }

        button1_onclick(_ev: Event | null, _sender: TControl) {
                const btn = this.componentRegistry.get<TButton>('button1');
                if (!btn) {
                        console.warn('button1 not found in registry');
                        return;
                }
                //btn.color = TColor.rgb(0, 0, 255);
                btn!.color = TColor.rgb(0, 0, 255);
                btn!.caption = 'MIMI';
                btn!.enabled = false;
                console.log('Button1 clicked!!!!');
        }

        subButton1_onclick(_ev: Event | null, _sender: TControl) {
                const panel = this.componentRegistry.get<TPanel>('myPanel');
                if (!panel) {
                        console.warn('myPanel not found in registry');
                        return;
                }
                panel!.backgroundColor = TColor.rgb(28, 188, 28);

                const hostFrame = this.componentRegistry.get<THostFrame>('myframeplugin');
                const frame = hostFrame!.getFrame() as HelloFrame;
                const btn = frame.componentRegistry.get<TButton>('myframeButton');
                btn!.caption = 'Message updated from Delphine!!!';
                //frame.setProp('message', 'Message updated from Delphine!!!');
        }

        subButton2_onclick(_ev: Event | null, _sender: TControl) {
                const frame = this.componentRegistry.get<TPluginHost>('myframeplugin');
                frame!.setPluginProp('message', 'Message updated from Delphine!!!');
        }

        zaza_onclick(_ev: Event | null, _sender: TControl) {
                const btn = this.componentRegistry.get<TButton>('buttonx');
                btn!.color = TColor.rgb(0, 255, 0);
                console.log('zazaVue clicked!!!!');
                //btn!.enabled = false;
        }

        myframe_onFrameEvent(ev: CustomEvent | null, _sender: TControl) {
                console.log('myframe_onFrameEvent!!!!');
                switch (ev?.detail?.eventType) {
                        case 'MessageChanged':
                                const hostFrame = this.componentRegistry.get<THostFrame>('myframeplugin');
                                const frame = hostFrame!.getFrame() as HelloFrame;
                                const btn = frame.componentRegistry.get<TButton>('myframeButton');
                                btn!.caption = ev.detail.data.message;

                                break;

                        default:
                                break;
                }
        }
}
