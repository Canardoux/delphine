import { TForm, TControl, TButton, TColor, TApplication, TPanel } from '@vcl';
import { getApplication } from '@vcl/IApplication';

import './MainForm.css';

export default class MainForm extends TForm {
        button1_onclick(_ev: Event | null, _sender: TControl) {
                const btn = this.componentRegistry.get<TButton>('button1');
                if (!btn) {
                        console.warn('button1 not found in registry');
                        return;
                }
                btn!.color = TColor.rgb(255, 255, 2);
                console.log('Button1 clicked!!!!');
                const app = getApplication() as TApplication;
                app.showFormByName('Riri');
                //app.replaceForm('Riri');
        }

        button2_onclick(_ev: Event | null, _sender: TControl) {
                const btn = this.componentRegistry.get<TButton>('button2');
                if (!btn) {
                        console.warn('button2 not found in registry');
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
}
