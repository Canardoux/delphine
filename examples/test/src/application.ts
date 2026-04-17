import RiriForm from './forms/Riri';
import MainForm from './forms/MainForm';
import { TApplication } from '@vcl';
import { MetaHelloFrame } from './frames/HelloFrame';

export default class Application extends TApplication {
        public riri!: RiriForm;

        override async initialize(): Promise<void> {
                debugger;

                this.typeRegistry?.register(MetaHelloFrame.metaclass);
                this.mainForm = (await this.createFormByName('MainForm')) as MainForm;
                this.riri = (await this.createFormByName('Riri')) as RiriForm;
        }

        override run(): void {
                this.mainForm!.show();
        }
}
