const params = new URLSearchParams(window.location.search);
const formName = params.get('form');
const appName = params.get('app') ?? 'MainApp';

console.log('*** PREVIEW RUNTIME ***', import.meta.url);

if (!formName) {
        throw new Error('Missing form name');
}

async function main(): Promise<void> {
        const basePath = `/src/apps/${appName}/forms/${formName}.form`;
        const modulePath = `${basePath}/${formName}.ts`;
        const htmlPath = `${basePath}/${formName}.html`;

        console.log('Loading TS module:', modulePath);

        let module: any;
        try {
                module = await import(/* @vite-ignore */ modulePath);
                console.log('TS module loaded');
        } catch (e) {
                console.error('Failed to load TS module:', e);
                throw e;
        }

        console.log('Loading HTML text:', htmlPath);

        let htmlSource: string;
        try {
                const response = await fetch(htmlPath);
                if (!response.ok) {
                        throw new Error(`HTTP ${response.status} while loading ${htmlPath}`);
                }
                htmlSource = await response.text();
                console.log('HTML loaded');
        } catch (e) {
                console.error('Failed to load HTML:', e);
                throw e;
        }

        const FormClass = module.default ?? module[formName!];
        if (!FormClass) {
                throw new Error(`Unable to resolve form class ${formName}`);
        }

        const app = document.getElementById('app');
        if (!app) {
                throw new Error('Preview container #app not found');
        }

        app.innerHTML = htmlSource;

        const form = new FormClass(formName);
        form.show();
}

void main().catch((e) => {
        console.error('previewRuntime failed:', e);
});

if (import.meta.hot) {
        import.meta.hot.on('vite:beforeUpdate', (payload) => {
                console.log('Vite update detected in preview runtime:', payload);
                window.location.reload();
        });
}
