import { TForm, TControl, TButton, TColor, TApplication } from '@vcl';
import { getApplication } from '@vcl/IApplication';

export default class MainForm extends TForm {
        button1_onclick(_ev: Event | null, _sender: TControl) {
                const btn = this.componentRegistry.get<TButton>('button1');
                if (!btn) {
                        console.warn('button1 not found in registry');
                        return;
                }
                btn!.color = TColor.rgb(128, 128, 0);
                console.log('Button1 clicked!!!!');
                const app = getApplication() as TApplication;
                const riri = app.getFormByName('Riri');
                riri?.show();
        }
}
