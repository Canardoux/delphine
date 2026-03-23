import RiriForm from './forms/Riri.form/Riri';
import MainForm from './forms/MainForm.form/MainForm';
import { TApplication, PluginRegistry, TMetaPluginHost, TMetaControl } from '@vcl';
import { createHelloVuePlugin } from './plugins/HelloVuePlugin/createHelloVuePlugin';

export default class Application extends TApplication {
        public mainForm!: MainForm;
        public riri!: RiriForm;

        override async initialize(): Promise<void> {
                debugger;
                const metaPlugin = new TMetaPluginHost(TMetaControl.metaclass, 'hello-vue', createHelloVuePlugin);
                this.typeRegistry?.register(metaPlugin);
                //PluginRegistry.pluginRegistry.register('hello-vue', { factory: createHelloVuePlugin }); // Must be done before the createForms() !!!
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
