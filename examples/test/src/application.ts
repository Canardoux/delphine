import RiriForm from './forms/Riri';
import MainForm from './forms/MainForm';
import { TApplication } from '@vcl';
import { MetaHelloFrame } from './frames/HelloFrame';
import { createHelloVuePlugin } from './plugins/HelloVuePlugin/createHelloVuePlugin';
import { TMetaPluginHost } from '@vcl';
import { createHelloSveltePlugin } from './plugins/HelloSveltePlugin/createHelloSveltePlugin';

export default class Application extends TApplication {
        override async initialize(): Promise<void> {
                debugger;
                // These two plugins must be initialized in the Standard init()
                const metaPluginVue = new TMetaPluginHost(TMetaPluginHost.metaclass, 'hello-vue', createHelloVuePlugin);
                this.typeRegistry?.register(metaPluginVue);

                const metaPluginSvelte = new TMetaPluginHost(TMetaPluginHost.metaclass, 'hello-svelte', createHelloSveltePlugin);
                this.typeRegistry?.register(metaPluginSvelte);
        }

        override run(): void {
                this.mainForm!.show();
        }
}
