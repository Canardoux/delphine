import { TApplication } from '@vcl';

const params = new URLSearchParams(window.location.search);
const formName = params.get('form');
const appName = params.get('app') ?? 'MainApp';

if (!formName) {
        throw new Error('Missing form name');
}

async function main(): Promise<void> {
        // 1. Create fake application
        const app = new TApplication(appName, { mainForm: formName });

        // 2. Load Form module
        const basePath = `/src/apps/${appName}/forms/${formName}.form`;
        const modulePath = `${basePath}/${formName}.ts`;
        const htmlPath = `${basePath}/${formName}.html`;

        const module = await import(/* @vite-ignore */ modulePath);
        const response = await fetch(htmlPath);
        const htmlSource = await response.text();

        const FormClass = module.default ?? module[formName];
        if (!FormClass) {
                throw new Error(`Unable to resolve form class ${formName}`);
        }

        // 3. Create form
        const form = new FormClass(formName);
        form.create(htmlSource);

        // 4. Register it as main form
        app.mainForm = form;

        // 5. Show it
        form.show();
}

void main().catch((e) => {
        console.error('previewRuntime failed:', e);
});
