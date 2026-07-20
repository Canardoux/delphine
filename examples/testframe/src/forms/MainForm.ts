import { TForm } from '@vcl';
//import type MainFrame from '../frames/MainFrame';
//import { TLitFrame } from '@vcl/palettes/lit/TLitFrame';
import type MainFrame from '../frames/MainFrame';

export default class MainForm extends TForm {
        constructor() {
                // registerMainFrame(); // Normalement c'est déjà fait!
                const registeredClass = customElements.get('main-frame');

                //console.log('MainFrame === registeredClass:', MainFrame === registeredClass);
                //console.log('MainFrame:', MainFrame);
                console.log('registeredClass:', registeredClass);

                // const frame = new MainFrame();
                const frame = document.createElement('main-frame') as MainFrame;

                super(frame, 'MainForm');
        }
}
