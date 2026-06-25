import { TForm, TControl, TColor, TApplication, TPluginHost } from '@vcl';
import { TButton } from '@vcl/palettes/standard/TButton';
import { TPanel } from '@vcl/palettes/standard/TPanel';
import { getApplication } from '@vcl/IApplication';
import { TCheckBox } from '@vcl/palettes/standard/TCheckBox';
import { TLitCheckbox } from '@vcl/palettes/lit/TLitCheckBox';
//import std from '@vcl/palettes/standard/index';

//import './MainForm.css';
import { HelloFrame } from '../frames/HelloFrame';
import { THostFrame } from '@vcl/palettes/standard/TFrame';

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
        }

        label_onclick(_ev: Event | null, _sender: TControl) {
                const btn = this.componentRegistry.get<TCheckBox>('chk3');
                btn!.checked = !btn?.checked;
                btn!.caption = `${btn?.checked ? 'Checked' : 'unchecked'} es-tu vraiment sur ?`;
                btn!.color = new TColor('rgb(255,0,255)');
        }

        chk_onclick(_ev: Event | null, _sender: TControl) {
                const btn = this.componentRegistry.get<TCheckBox>('chk3');
                btn!.caption = btn?.checked ? 'Checked' : 'unchecked';
        }

        buttonb_onclick(_ev: Event | null, _sender: TControl) {
                const popupMenu1 = this.componentRegistry.get<TPluginHost>('PopupMenu1');
                const btn = this.componentRegistry.get<TButton>('button-b');
                if (!btn) {
                        console.warn('button-b not found in registry');
                        return;
                }
                btn!.color = TColor.rgb(0, 128, 0);
                btn!.caption = 'PUSH to Riri!';
                console.log('Button2 clicked!!!!');
                const app = getApplication() as TApplication;
                app.createAndPushForm('Riri');
        }

        mainForm_onclick(_ev: Event | null, _sender: TControl) {
                console.log('Form clicked!!!!');
                const panel = this.componentRegistry.get<TPanel>('myPanel');
                if (!panel) {
                        console.warn('myPanel not found in registry');
                        return;
                }
                panel!.backgroundColor = TColor.rgb(54, 127, 173);
        }

        button1_onclick(_ev: Event | null, _sender: TControl) {
                const btn = this.componentRegistry.get<TButton>('button1');
                if (!btn) {
                        console.warn('button1 not found in registry');
                        return;
                }
                btn!.color = TColor.rgb(0, 0, 255);
                btn!.caption = 'MIMI';
                btn!.enabled = false;
                console.log('Button1 clicked!!!!');
        }

        subBtn1_onclick(_ev: Event | null, _sender: TControl) {
                const panel = this.componentRegistry.get<TPanel>('myPanel');
                if (!panel) {
                        console.warn('myPanel not found in registry');
                        //return;
                } else {
                        panel.backgroundColor = TColor.rgb(28, 188, 28);
                }

                const hostFrame = this.componentRegistry.get<THostFrame>('myframeplugin');
                const frame = hostFrame!.getFrame() as HelloFrame;
                const btn = frame.componentRegistry.get<TButton>('myframeButton');
                btn!.caption = 'Message updated from Delphine!!!';
        }

        zaza_onclick(_ev: Event | null, _sender: TControl) {
                const btn = this.componentRegistry.get<TButton>('buttonx');
                btn!.color = TColor.rgb(0, 255, 0);
                console.log('zazaVue clicked!!!!');
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

        Flat_onclick(_ev: Event | null, _sender: TControl) {
                const app = getApplication();
                app!.setTheme('flat');
        }

        Win95_onclick(_ev: Event | null, _sender: TControl) {
                const app = getApplication();
                app!.setTheme('win95');
        }

        Win98_onclick(_ev: Event | null, _sender: TControl) {
                // TODO: handle Win98_onclick
                const app = getApplication();
                app!.setTheme('win98');
        }

        Win7_onclick(_ev: Event | null, _sender: TControl) {
                const app = getApplication();
                app!.setTheme('win7');
        }

        Button1_ondblclick(_ev: Event | null, _sender: TControl) {
                console.log('Button1 double clicked!!!!');
        }

        Button1_oncontextpopup(_ev: Event | null, _sender: TControl) {
                console.log('Button1 context popup!!!!'); // TODO: handle Button1_oncontextpopup
        }

        Motif_onclick(_ev: Event | null, _sender: TControl) {
                // TODO: handle Button1_onclick
                console.log('Motif clicked!!!!');
                const app = getApplication();
                app!.setTheme('motif');
        }

        button1_ondblclick(_ev: Event | null, _sender: TControl) {
                // TODO: handle button1_ondblclick
        }

        Button1_onclick(_ev: Event | null, _sender: TControl) {
                // TODO: handle Button1_onclick
        }

        ButtonEnabled_onclick(_ev: Event | null, _sender: TControl) {
                // TODO: handle ButtonEnabled_onclick
                const btn = this.componentRegistry.get<TLitCheckbox>('LitCheckbox')!;
                btn.enabled = !btn?.enabled;
                console.log(` enabled: ${btn.enabled}`);
        }

        ButtonChecked_onclick(_ev: Event | null, _sender: TControl) {
                // TODO: handle ButtonChecked_onclick
                const btn = this.componentRegistry.get<TLitCheckbox>('LitCheckbox')!;
                btn.checked = !btn?.checked;
                console.log(` checked: ${btn.checked}`);
        }

        LitCheckbox_onclick(_ev: Event | null, _sender: TControl) {
                // TODO: handle LitCheckbox_onclick
                const btn = this.componentRegistry.get<TLitCheckbox>('LitCheckbox')!;
                console.log(`LitCheckbox enabled: ${btn.enabled}`);
                console.log(`LitCheckbox checked: ${btn.checked}`);
        }

        ChangeColor_onclick(_ev: Event | null, _sender: TControl) {
                // TODO: handle ChangeColor_onclick
                const btn = this.componentRegistry.get<TLitCheckbox>('LitCheckbox')!;
                btn.color = TColor.rgb(255, 0, 255);
        }
}
