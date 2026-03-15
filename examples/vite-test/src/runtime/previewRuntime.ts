const params = new URLSearchParams(window.location.search);
const formName = params.get('form');

console.log('*** PREVIEW RUNTIME MARKER 2026-03-14-B ***', import.meta.url);

if (!formName) {
        throw new Error('Missing form name');
}

async function main(): Promise<void> {
        debugger;

        const modulePath = `/src/forms/${formName}.form/${formName}.ts`;
        const htmlPath = `/src/forms/${formName}.form/${formName}.html`;

        console.log('Loading TS module:', modulePath);

        let module: any;
        try {
                module = await import(modulePath);
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
