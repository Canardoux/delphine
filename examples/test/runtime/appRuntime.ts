import { TApplication } from '@vcl';

const params = new URLSearchParams(window.location.search);
const appName = params.get('app') ?? 'MainApp';

async function main(): Promise<void> {
        let app: TApplication;

        try {
                const module: any = await import('../src/application');

                const AppClass = module.default ?? module[appName] ?? module.MainApp;
                if (AppClass) {
                        app = new AppClass(appName);
                } else {
                        throw new Error('No App class found');
                }
        } catch {
                app = new TApplication(appName);
        }

        //app.setTheme(appConfig.ui.theme);
        await app.readConfig();
        await app.registerRuntimeTypes();
        await app.createAutoForms();
        await app.initialize();
        app.start();
}

void main().catch((e) => {
        console.error('appRuntime failed:', e);
});
