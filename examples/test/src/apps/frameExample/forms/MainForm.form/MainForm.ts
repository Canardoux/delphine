import { TForm, TControl, TButton, TColor, TApplication, TPanel, TPluginHost } from '@vcl';
import { getApplication } from '@vcl/IApplication';

import './MainForm.css';

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
                panel!.backgroundColor = TColor.rgb(54, 127, 173);

                const frame = this.componentRegistry.get<TPluginHost>('myframeplugin');
                //vue!.props.message = 'Message updated from Delphine!!!';
                frame!.setPluginProp('message', 'Message updated from Delphine!!!');
        }

        zaza_onclick(_ev: Event | null, _sender: TControl) {
                const btn = this.componentRegistry.get<TButton>('buttonx');
                btn!.color = TColor.rgb(0, 255, 0);
                console.log('zazaVue clicked!!!!');
                //btn!.enabled = false;
        }
}
