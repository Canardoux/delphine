import { TForm, TControl, TButton, TColor, TApplication } from '@vcl';
import { getApplication } from '@vcl/IApplication';

export default class RiriForm extends TForm {
        button1_onclick(_ev: Event | null, _sender: TControl) {
                const btn = this.componentRegistry.get<TButton>('button1');
                if (!btn) {
                        console.warn('button1 not found in registry');
                        return;
                }
                btn!.color = TColor.rgb(0, 128, 128);
                console.log('Button1 clicked!!!!');
                const app = getApplication() as TApplication;
                //const mainForm = app.getFormByName('MainForm');
                //app?.showFormByName('MainForm');
                app.replaceForm('MainForm');
        }

        button2_onclick(_ev: Event | null, _sender: TControl) {
                const btn = this.componentRegistry.get<TButton>('button2');
                if (!btn) {
                        console.warn('button2 not found in registry');
                        return;
                }
                btn!.color = TColor.rgb(255, 0, 0);
                console.log('Button2 clicked!!!!');
                const app = getApplication() as TApplication;
                //const mainForm = app.getFormByName('MainForm');
                //app?.showFormByName('MainForm');
                app.popFormDestroy();
        }
}
