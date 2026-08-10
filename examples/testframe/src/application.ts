import { TApplication } from '@vcl';
//import { TMetaPluginHost } from '@vcl';

export default class Application extends TApplication {
        override async initialize(): Promise<void> {
                // These two plugins must be initialized in the Standard init()
        }

        override run(): void {
                this.mainForm!.show();
        }
}
