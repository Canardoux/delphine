import { TApplication } from '@vcl';

const params = new URLSearchParams(window.location.search);
const appName = params.get('app') ?? 'MainApp';

async function main(): Promise<void> {
        // 1. Load app config
        const appConfigUrl = `/src/apps/${appName}/app.json`;

        const appConfigResponse = await fetch(appConfigUrl);
        if (!appConfigResponse.ok) {
                throw new Error(`Cannot load ${appConfigUrl}`);
        }

        const appConfig = await appConfigResponse.json();

        // 2. Create App
        let app: TApplication;

        try {
                // Try to load user-defined Application
                const module = await import(/* @vite-ignore */ `/src/apps/${appName}/MainApp.ts`);
                const AppClass = module.default ?? module[appName] ?? module.MainApp;

                if (AppClass) {
                        app = new AppClass(appName, appConfig);
                } else {
                        throw new Error('No App class found');
                }
        } catch {
                // Fallback: default Application
                app = new TApplication(appName, appConfig);
        }

        // 3. Initialize and run
        await app.initialize();
        app.run();
}

void main().catch((e) => {
        console.error('appRuntime failed:', e);
});
