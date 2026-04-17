import { TApplication } from '@vcl';

const params = new URLSearchParams(window.location.search);
const appName = params.get('app') ?? 'MainApp';

async function main(): Promise<void> {
        const appConfigUrl = `/src/app.json`;

        const appConfigResponse = await fetch(appConfigUrl);
        if (!appConfigResponse.ok) {
                throw new Error(`Cannot load ${appConfigUrl}`);
        }

        const appConfig = await appConfigResponse.json();

        let app: TApplication;

        try {
                const module: any = await import('../src/application');

                const AppClass = module.default ?? module[appName] ?? module.MainApp;
                if (AppClass) {
                        app = new AppClass(appName, appConfig);
                } else {
                        throw new Error('No App class found');
                }
        } catch {
                app = new TApplication(appName, appConfig);
        }

        await app.initialize();
        app.start();
}

void main().catch((e) => {
        console.error('appRuntime failed:', e);
});
