const params = new URLSearchParams(window.location.search);
const appName = params.get('app') ?? 'MainApp';

async function main(): Promise<void> {
        // 1. Charger la config de l'app
        const appConfigUrl = `/src/apps/${appName}/app.json`;

        const appConfigResponse = await fetch(appConfigUrl);
        if (!appConfigResponse.ok) {
                throw new Error(`Cannot load ${appConfigUrl}`);
        }

        const appConfig = await appConfigResponse.json();
        const formName = appConfig.mainForm;

        if (!formName) {
                throw new Error('mainForm not defined in app.json');
        }

        // 2. Construire les chemins
        const basePath = `/src/apps/${appName}/forms/${formName}.form`;

        const modulePath = `${basePath}/${formName}.ts`;
        const htmlPath = `${basePath}/${formName}.html`;

        // 3. Charger le module TS
        let module: any;
        try {
                module = await import(/* @vite-ignore */ modulePath);
        } catch (e) {
                console.error('Failed to load TS module:', e);
                throw e;
        }

        // 4. Charger le HTML
        const response = await fetch(htmlPath);
        if (!response.ok) {
                throw new Error(`Cannot load ${htmlPath}`);
        }

        const htmlSource = await response.text();

        // 5. Injecter dans #app
        const app = document.getElementById('app');
        if (!app) {
                throw new Error('#app not found');
        }

        app.innerHTML = htmlSource;

        // 6. Instancier la Form
        const FormClass = module.default ?? module[formName];
        if (!FormClass) {
                throw new Error(`Cannot resolve class ${formName}`);
        }

        const form = new FormClass(formName);

        // 7. Lancer Delphine
        form.show();
}

void main().catch((e) => {
        console.error('appRuntime failed:', e);
});
