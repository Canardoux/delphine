import RiriForm from './forms/Riri.form/Riri';
import MainForm from './forms/MainForm.form/MainForm';
import { TApplication } from '@vcl';

export default class Application extends TApplication {
        public mainForm!: MainForm;
        public riri!: RiriForm;

        override async initialize(): Promise<void> {
                debugger;
                this.mainForm = (await this.createFormByName('MainForm')) as MainForm;
                this.riri = (await this.createFormByName('Riri')) as RiriForm;
        }

        override run(): void {
                //super.run();
                //this.runWhenDomReady(() => {
                this.mainForm.show();
                //});
        }
}
