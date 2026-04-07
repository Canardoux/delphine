import RiriForm from './forms/Riri.form/Riri';
import MainForm from './forms/MainForm.form/MainForm';
import { TApplication, TMetaPluginHost, TMetaControl } from '@vcl';
import { TMetaCompositeControl } from '@vcl/CompositeControl';
import type { ComponentSchema } from '@vcl/IComponent';

import { MetaHelloFrame } from './frames/HelloFrame.frame/HelloFrame';

//import { createHelloVuePlugin } from './plugins/HelloVuePlugin/createHelloVuePlugin';

export default class Application extends TApplication {
        //public mainForm!: MainForm;
        public riri!: RiriForm;

        override async initialize(): Promise<void> {
                debugger;

                this.typeRegistry?.register(MetaHelloFrame.metaclass);
                this.mainForm = (await this.createFormByName('MainForm')) as MainForm;
                this.riri = (await this.createFormByName('Riri')) as RiriForm;
        }

        override run(): void {
                //super.run();
                //this.runWhenDomReady(() => {
                this.mainForm!.show();
                //});
        }
}
