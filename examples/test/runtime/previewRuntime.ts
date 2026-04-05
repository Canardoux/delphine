import { TApplication } from '@vcl';

const params = new URLSearchParams(window.location.search);
const unitName = params.get('unit') ?? 'MainUnit';
const appName = params.get('app') ?? 'MainApp';

if (!unitName) {
        throw new Error('Missing unit name');
}

async function tryLoadUnit(
        appName: string,
        unitName: string,
        kind: 'forms' | 'frames'
): Promise<{
        module: any;
        htmlSource: string;
        kind: 'forms' | 'frames';
}> {
        const basePath = `/src/apps/${appName}/${kind}/${unitName}.${kind === 'forms' ? 'form' : 'frame'}`;
        const modulePath = `${basePath}/${unitName}.ts`;
        const htmlPath = `${basePath}/${unitName}.html`;

        const module = await import(/* @vite-ignore */ modulePath);
        const response = await fetch(htmlPath);

        if (!response.ok) {
                throw new Error(`HTTP ${response.status} while loading ${htmlPath}`);
        }

        const htmlSource = await response.text();
        return { module, htmlSource, kind };
}

async function main(): Promise<void> {
        const app = new TApplication(appName, { mainForm: unitName! });

        let loaded:
                | {
                          module: any;
                          htmlSource: string;
                          kind: 'forms' | 'frames';
                  }
                | undefined;

        try {
                loaded = await tryLoadUnit(appName, unitName!, 'forms');
        } catch {
                loaded = await tryLoadUnit(appName, unitName!, 'frames');
        }

        const { module, htmlSource, kind } = loaded;

        const UnitClass = module.default ?? module[unitName!];
        if (!UnitClass) {
                throw new Error(`Unable to resolve class ${unitName!}`);
        }

        const unit = new UnitClass(unitName);
        unit.create(htmlSource);

        if (kind === 'forms') {
                app.mainForm = unit;
                unit.show();
        } else {
                // Preview simple d'une Frame :
                // on l'attache directement au body.
                document.body.innerHTML = '';
                if (unit.elem) {
                        document.body.appendChild(unit.elem);
                } else {
                        throw new Error(`Frame ${unitName} has no root element after create()`);
                }
        }
}

void main().catch((e) => {
        console.error('previewRuntime failed:', e);
});
