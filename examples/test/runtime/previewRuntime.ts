import { TApplication } from '@vcl';

const params = new URLSearchParams(window.location.search);
const unitName = params.get('unit') ?? 'MainUnit';
const appName = params.get('app') ?? 'MainApp';

if (!unitName) {
        throw new Error('Missing unit name');
}
function extractTemplateFromDform(source: string): string {
        const match = source.match(/<template[^>]*>([\s\S]*?)<\/template>/i);
        return match ? (match[1] ?? '') : '';
}

function extractStyleFromDform(source: string): string {
        const match = source.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
        return match ? (match[1] ?? '') : '';
}
function applyPreviewStyle(unitName: string, cssText: string): void {
        const styleId = `delphine-preview-style-${unitName}`;

        let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
        if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = styleId;
                document.head.appendChild(styleEl);
        }

        styleEl.textContent = cssText;
}

async function tryLoadUnit(unitName: string): Promise<{
        module: any;
        html: string;
        css: string;
        kind: 'form' | 'frame';
}> {
        const candidateBasePaths: Array<{
                basePath: string;
                kind: 'form' | 'frame';
        }> = [
                { basePath: `/src/forms/${unitName}`, kind: 'form' },
                { basePath: `/src/frames/${unitName}`, kind: 'frame' }
        ];

        let lastError: unknown;

        for (const candidate of candidateBasePaths) {
                const { basePath, kind } = candidate;
                try {
                        const module = await import(/* @vite-ignore */ `${basePath}.ts`);

                        const response = await fetch(`${basePath}.dform`);
                        if (!response.ok) {
                                throw new Error(`Cannot load ${basePath}.dform`);
                        }

                        const dformText = await response.text();

                        const html = extractTemplateFromDform(dformText);
                        const css = extractStyleFromDform(dformText);

                        return { module, html, css, kind };
                } catch (error) {
                        lastError = error;
                }
        }

        throw lastError ?? new Error(`Unable to load unit ${unitName}`);
}

async function main(): Promise<void> {
        const app = new TApplication(appName, { mainForm: unitName! });

        const { module, html, css, kind } = await tryLoadUnit(unitName!);

        const UnitClass = module.default ?? module[unitName!];
        if (!UnitClass) {
                throw new Error(`Unable to resolve class ${unitName!}`);
        }

        applyPreviewStyle(unitName!, css);

        const unit = new UnitClass(unitName);
        unit.create(html);

        if (kind === 'form') {
                app.mainForm = unit;
                unit.show();
                return;
        }

        document.body.innerHTML = '';

        const frameRoot = unit.elem as HTMLElement | undefined;
        if (!frameRoot) {
                throw new Error(`Preview frame ${unitName!} has no root element`);
        }

        frameRoot.hidden = false;
        document.body.appendChild(frameRoot);
}

void main().catch((e) => {
        console.error('previewRuntime failed:', e);
});
