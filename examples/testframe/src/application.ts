import RiriForm from './forms/Riri';
import MainForm from './forms/MainForm';
import { TApplication } from '@vcl';
import { TMetaPluginHost } from '@vcl';

export default class Application extends TApplication {
        override async initialize(): Promise<void> {
                debugger;
                // These two plugins must be initialized in the Standard init()
        }

        override run(): void {
                this.mainForm!.show();
        }
}
